-- ============================================================
-- UTILITY TRIGGERS
-- ============================================================

-- Shared function for updating `updated_at` on any table that has it
CREATE OR REPLACE FUNCTION update_timestamp()
    RETURNS TRIGGER AS
$$
BEGIN
    NEW.updated_at := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_content_timestamp
    BEFORE UPDATE ON content
    FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_update_flag_timestamp
    BEFORE UPDATE ON flag
    FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_update_profile_timestamp
    BEFORE UPDATE ON profile
    FOR EACH ROW
EXECUTE FUNCTION update_timestamp();


-- ============================================================
-- VOTE SCORE
-- ============================================================

CREATE OR REPLACE FUNCTION update_vote_score()
    RETURNS TRIGGER AS
$$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE content
        SET vote_score = vote_score + NEW.vote_type
        WHERE content_id = NEW.content_id;

    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE content
        SET vote_score = vote_score + (NEW.vote_type - OLD.vote_type)
        WHERE content_id = NEW.content_id;

    ELSIF TG_OP = 'DELETE' THEN
        UPDATE content
        SET vote_score = vote_score - OLD.vote_type
        WHERE content_id = OLD.content_id;
    END IF;

    RETURN NULL; -- AFTER trigger, return value is ignored
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_vote_score
    AFTER INSERT OR UPDATE OR DELETE ON vote
    FOR EACH ROW
EXECUTE FUNCTION update_vote_score();


-- ============================================================
-- ANSWER COUNT ON QUESTION
-- ============================================================

-- FIX: Was using NEW.content_id (the answer's ID) to look up the question.
--      Should use NEW.question_id (the foreign key pointing to the question).
CREATE OR REPLACE FUNCTION update_answer_count()
    RETURNS TRIGGER AS
$$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE question
        SET answer_count     = answer_count + 1,
            last_activity_at = CURRENT_TIMESTAMP
        WHERE content_id = NEW.question_id;

    ELSIF TG_OP = 'DELETE' THEN
        UPDATE question
        SET answer_count     = GREATEST(0, answer_count - 1),
            last_activity_at = CURRENT_TIMESTAMP
        WHERE content_id = OLD.question_id;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_answer_count
    AFTER INSERT OR DELETE ON answer
    FOR EACH ROW
EXECUTE FUNCTION update_answer_count();


-- ============================================================
-- BADGE COUNT ON USER
-- ============================================================

CREATE OR REPLACE FUNCTION update_badge_count()
    RETURNS TRIGGER AS
$$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE "user"
        SET badge_count = badge_count + 1
        WHERE user_id = NEW.user_id;

    ELSIF TG_OP = 'DELETE' THEN
        UPDATE "user"
        SET badge_count = GREATEST(0, badge_count - 1)
        WHERE user_id = OLD.user_id;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_badge_count
    AFTER INSERT OR DELETE ON badge_award
    FOR EACH ROW
EXECUTE FUNCTION update_badge_count();


-- ============================================================
-- REPUTATION POINTS (driven by reputation_history)
-- NOTE: All reputation changes must go through reputation_history.
--       Do NOT manually UPDATE user.reputation_points elsewhere.
-- ============================================================

CREATE OR REPLACE FUNCTION update_reputation_points()
    RETURNS TRIGGER AS
$$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE "user"
        SET reputation_points = GREATEST(0, reputation_points + NEW.change_amount)
        WHERE user_id = NEW.user_id;

    ELSIF TG_OP = 'DELETE' THEN
        -- Reverting a history entry means reversing its effect
        UPDATE "user"
        SET reputation_points = GREATEST(0, reputation_points - OLD.change_amount)
        WHERE user_id = OLD.user_id;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_reputation_points
    AFTER INSERT OR DELETE ON reputation_history
    FOR EACH ROW
EXECUTE FUNCTION update_reputation_points();


-- ============================================================
-- VOTE REPUTATION — handles INSERT, UPDATE (vote flip), DELETE
-- ============================================================
-- The UPDATE case covers when a user switches vote direction
-- (e.g. upvote → downvote or vice versa via PUT /votes/:id).
-- Without this, flipping a vote leaves the old reputation_history
-- rows in place and never creates the corrected ones.

CREATE OR REPLACE FUNCTION process_vote_reputation() RETURNS TRIGGER AS $$
DECLARE
    v_author_id    UUID;
    v_content_type content_type;
    v_rep_change   INTEGER;
    v_reason       reputation_reason;
BEGIN

    -- ── INSERT: new vote cast ─────────────────────────────────────────────────
    IF TG_OP = 'INSERT' THEN
        SELECT author_id, content_type
        INTO v_author_id, v_content_type
        FROM content WHERE content_id = NEW.content_id;

        -- No rep change if content has no author or voter is the author
        IF v_author_id IS NULL OR v_author_id = NEW.user_id THEN
            RETURN NULL;
        END IF;

        IF v_content_type = 'question' THEN
            v_rep_change := CASE WHEN NEW.vote_type = 1 THEN 10 ELSE -2 END;
            v_reason     := CASE WHEN NEW.vote_type = 1 THEN 'QUESTION_UPVOTED' ELSE 'QUESTION_DOWNVOTED' END;

        ELSIF v_content_type = 'answer' THEN
            v_rep_change := CASE WHEN NEW.vote_type = 1 THEN 10 ELSE -2 END;
            v_reason     := CASE WHEN NEW.vote_type = 1 THEN 'ANSWER_UPVOTED' ELSE 'ANSWER_DOWNVOTED' END;

            -- Downvoting costs the voter 1 rep
            IF NEW.vote_type = -1 THEN
                INSERT INTO reputation_history (user_id, change_amount, reason, related_entity_type, related_entity_id)
                VALUES (NEW.user_id, -1, 'DOWNVOTE_GIVEN', 'vote', NEW.vote_id);
            END IF;
        ELSE
            RETURN NULL; -- No rep for comments
        END IF;

        INSERT INTO reputation_history (user_id, change_amount, reason, related_entity_type, related_entity_id)
        VALUES (v_author_id, v_rep_change, v_reason, 'vote', NEW.vote_id);

        -- ── UPDATE: vote direction flipped ────────────────────────────────────────
        -- The vote row is the same (same vote_id), only vote_type changed.
        -- We delete the old history entries and insert corrected ones.
    ELSIF TG_OP = 'UPDATE' AND OLD.vote_type != NEW.vote_type THEN
        SELECT author_id, content_type
        INTO v_author_id, v_content_type
        FROM content WHERE content_id = NEW.content_id;

        IF v_author_id IS NULL OR v_author_id = NEW.user_id THEN
            RETURN NULL;
        END IF;

        -- Remove all old reputation records tied to this vote.
        -- The trg_update_reputation_points DELETE trigger will reverse their effect.
        DELETE FROM reputation_history
        WHERE related_entity_type = 'vote' AND related_entity_id = OLD.vote_id;

        -- Now insert fresh records for the new vote direction
        IF v_content_type = 'question' THEN
            v_rep_change := CASE WHEN NEW.vote_type = 1 THEN 10 ELSE -2 END;
            v_reason     := CASE WHEN NEW.vote_type = 1 THEN 'QUESTION_UPVOTED' ELSE 'QUESTION_DOWNVOTED' END;

        ELSIF v_content_type = 'answer' THEN
            v_rep_change := CASE WHEN NEW.vote_type = 1 THEN 10 ELSE -2 END;
            v_reason     := CASE WHEN NEW.vote_type = 1 THEN 'ANSWER_UPVOTED' ELSE 'ANSWER_DOWNVOTED' END;

            -- Downvoting costs the voter 1 rep (if switching TO a downvote)
            IF NEW.vote_type = -1 THEN
                INSERT INTO reputation_history (user_id, change_amount, reason, related_entity_type, related_entity_id)
                VALUES (NEW.user_id, -1, 'DOWNVOTE_GIVEN', 'vote', NEW.vote_id);
            END IF;
        ELSE
            RETURN NULL;
        END IF;

        INSERT INTO reputation_history (user_id, change_amount, reason, related_entity_type, related_entity_id)
        VALUES (v_author_id, v_rep_change, v_reason, 'vote', NEW.vote_id);

        -- ── DELETE: vote removed ──────────────────────────────────────────────────
    ELSIF TG_OP = 'DELETE' THEN
        -- Cascade-delete all history entries for this vote.
        -- The trg_update_reputation_points DELETE trigger reverses each one.
        DELETE FROM reputation_history
        WHERE related_entity_type = 'vote' AND related_entity_id = OLD.vote_id;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Re-create the trigger to include UPDATE
DROP TRIGGER IF EXISTS trg_vote_reputation ON vote;

CREATE TRIGGER trg_vote_reputation
    AFTER INSERT OR UPDATE OR DELETE ON vote
    FOR EACH ROW
EXECUTE FUNCTION process_vote_reputation();


-- ============================================================
-- REPUTATION FROM ANSWER ACCEPTANCE
-- ============================================================

CREATE OR REPLACE FUNCTION process_accept_reputation() RETURNS TRIGGER AS $$
DECLARE
    v_answer_author   UUID;
    v_question_author UUID;
BEGIN
    IF TG_OP = 'UPDATE' THEN
        -- Answer was just accepted
        IF NEW.is_accepted = true AND OLD.is_accepted = false THEN
            SELECT author_id INTO v_answer_author
            FROM content WHERE content_id = NEW.content_id;

            SELECT c.author_id INTO v_question_author
            FROM content c WHERE c.content_id = NEW.question_id;

            -- No self-accept rep (though the controller should prevent this anyway)
            IF v_answer_author IS NOT NULL AND v_answer_author != v_question_author THEN
                INSERT INTO reputation_history (user_id, change_amount, reason, related_entity_type, related_entity_id)
                VALUES (v_answer_author, 15, 'ANSWER_ACCEPTED', 'answer', NEW.content_id);

                INSERT INTO reputation_history (user_id, change_amount, reason, related_entity_type, related_entity_id)
                VALUES (v_question_author, 2, 'ANSWER_ACCEPTED', 'answer', NEW.content_id);
            END IF;

            -- Answer acceptance was reverted
        ELSIF NEW.is_accepted = false AND OLD.is_accepted = true THEN
            DELETE FROM reputation_history
            WHERE reason = 'ANSWER_ACCEPTED'
              AND related_entity_type = 'answer'
              AND related_entity_id = NEW.content_id;
        END IF;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_accept_reputation
    AFTER UPDATE ON answer
    FOR EACH ROW
EXECUTE FUNCTION process_accept_reputation();


-- ============================================================
-- NOTIFICATIONS
-- ============================================================

-- Notify question author when a new answer is posted
CREATE OR REPLACE FUNCTION notify_on_new_answer() RETURNS TRIGGER AS $$
DECLARE
    v_answerer_id  UUID;
    v_questioner_id UUID;
BEGIN
    SELECT author_id INTO v_answerer_id
    FROM content WHERE content_id = NEW.content_id;

    SELECT author_id INTO v_questioner_id
    FROM content WHERE content_id = NEW.question_id;

    IF v_questioner_id IS NOT NULL AND v_questioner_id != v_answerer_id THEN
        INSERT INTO notification (recipient_user_id, actor_user_id, notification_type, related_entity_id, action_url)
        VALUES (
                   v_questioner_id,
                   v_answerer_id,
                   'NEW_ANSWER',
                   NEW.content_id,
                   '/questions/' || NEW.question_id || '#answer-' || NEW.content_id
               );
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_notify_on_new_answer
    AFTER INSERT ON answer
    FOR EACH ROW
EXECUTE FUNCTION notify_on_new_answer();


-- Notify answerer when their answer is accepted
CREATE OR REPLACE FUNCTION notify_on_answer_accepted() RETURNS TRIGGER AS $$
DECLARE
    v_answerer_id   UUID;
    v_questioner_id UUID;
BEGIN
    IF NEW.is_accepted = true AND OLD.is_accepted = false THEN
        SELECT author_id INTO v_answerer_id
        FROM content WHERE content_id = NEW.content_id;

        SELECT author_id INTO v_questioner_id
        FROM content WHERE content_id = NEW.question_id;

        IF v_answerer_id IS NOT NULL AND v_questioner_id != v_answerer_id THEN
            INSERT INTO notification (recipient_user_id, actor_user_id, notification_type, related_entity_id, action_url)
            VALUES (
                       v_answerer_id,
                       v_questioner_id,
                       'ANSWER_ACCEPTED',
                       NEW.content_id,
                       '/questions/' || NEW.question_id || '#answer-' || NEW.content_id
                   );
        END IF;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_notify_on_answer_accepted
    AFTER UPDATE ON answer
    FOR EACH ROW
EXECUTE FUNCTION notify_on_answer_accepted();


-- Notify parent content author on new comment; also notify @mentioned user
CREATE OR REPLACE FUNCTION notify_on_new_comment() RETURNS TRIGGER AS $$
DECLARE
    v_parent_author UUID;
    v_parent_type   content_type;
    v_question_id   UUID;
    v_actor_id      UUID;
BEGIN
    SELECT author_id, content_type
    INTO v_parent_author, v_parent_type
    FROM content WHERE content_id = NEW.parent_id;

    -- Resolve which question this comment belongs to for the action_url
    IF v_parent_type = 'answer' THEN
        SELECT question_id INTO v_question_id FROM answer WHERE content_id = NEW.parent_id;
    ELSE
        v_question_id := NEW.parent_id;
    END IF;

    SELECT author_id INTO v_actor_id FROM content WHERE content_id = NEW.content_id;

    -- Notify parent author
    IF v_parent_author IS NOT NULL AND v_parent_author != v_actor_id THEN
        INSERT INTO notification (recipient_user_id, actor_user_id, notification_type, related_entity_id, action_url)
        VALUES (
                   v_parent_author,
                   v_actor_id,
                   'NEW_COMMENT',
                   NEW.content_id,
                   '/questions/' || v_question_id || '#comment-' || NEW.content_id
               );
    END IF;

    -- Notify @mentioned user (recipient_id) if different from parent author and actor
    IF NEW.recipient_id IS NOT NULL
        AND NEW.recipient_id != v_actor_id
        AND NEW.recipient_id != v_parent_author
    THEN
        INSERT INTO notification (recipient_user_id, actor_user_id, notification_type, related_entity_id, action_url)
        VALUES (
                   NEW.recipient_id,
                   v_actor_id,
                   'MENTIONED',
                   NEW.content_id,
                   '/questions/' || v_question_id || '#comment-' || NEW.content_id
               );
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_notify_on_new_comment
    AFTER INSERT ON comment
    FOR EACH ROW
EXECUTE FUNCTION notify_on_new_comment();


-- Notify user when they earn a badge
CREATE OR REPLACE FUNCTION notify_on_badge_earned() RETURNS TRIGGER AS $$
DECLARE
    v_username VARCHAR(50);
BEGIN
    SELECT username INTO v_username FROM "user" WHERE user_id = NEW.user_id;

    INSERT INTO notification (recipient_user_id, actor_user_id, notification_type, related_entity_id, action_url)
    VALUES (
               NEW.user_id,
               NULL,
               'BADGE_EARNED',
               NEW.badge_id,
               '/users/' || v_username
           );

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_notify_on_badge_earned
    AFTER INSERT ON badge_award
    FOR EACH ROW
EXECUTE FUNCTION notify_on_badge_earned();


-- Notify answer author when a bounty is awarded to their answer
CREATE OR REPLACE FUNCTION notify_on_bounty_awarded() RETURNS TRIGGER AS $$
DECLARE
    v_answer_author UUID;
BEGIN
    IF TG_OP = 'UPDATE' AND NEW.status = 'awarded' AND OLD.status != 'awarded' THEN
        SELECT c.author_id INTO v_answer_author
        FROM answer a
                 JOIN content c ON a.content_id = c.content_id
        WHERE a.content_id = NEW.awarded_answer_id;

        IF v_answer_author IS NOT NULL AND v_answer_author != NEW.offered_by THEN
            INSERT INTO notification (recipient_user_id, actor_user_id, notification_type, related_entity_id, action_url)
            VALUES (
                       v_answer_author,
                       NEW.offered_by,
                       'BOUNTY_AWARDED',
                       NEW.bounty_id,
                       '/questions/' || NEW.question_id || '#answer-' || NEW.awarded_answer_id
                   );
        END IF;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_notify_on_bounty_awarded
    AFTER UPDATE ON bounty
    FOR EACH ROW
EXECUTE FUNCTION notify_on_bounty_awarded();


-- ============================================================
-- BADGE EVALUATION ENGINE
-- ============================================================

-- Called manually or from trigger hooks to evaluate and award eligible badges
CREATE OR REPLACE FUNCTION check_and_award_badges(p_user_id UUID) RETURNS void AS $$
DECLARE
    r_badge    RECORD;
    v_user_val INTEGER := 0;
BEGIN
    -- Only evaluate badges the user hasn't earned yet
    FOR r_badge IN
        SELECT * FROM badge
        WHERE badge_id NOT IN (
            SELECT badge_id FROM badge_award WHERE user_id = p_user_id
        )
        LOOP
            v_user_val := 0;

            IF r_badge.criteria_type = 'question_count' THEN
                SELECT COUNT(*) INTO v_user_val
                FROM content WHERE content_type = 'question' AND author_id = p_user_id AND deleted_at IS NULL;

            ELSIF r_badge.criteria_type = 'answer_count' THEN
                SELECT COUNT(*) INTO v_user_val
                FROM content WHERE content_type = 'answer' AND author_id = p_user_id AND deleted_at IS NULL;

            ELSIF r_badge.criteria_type = 'total_votes_received' THEN
                SELECT COALESCE(SUM(vote_score), 0) INTO v_user_val
                FROM content WHERE author_id = p_user_id AND deleted_at IS NULL;

            ELSIF r_badge.criteria_type = 'answer_score' THEN
                SELECT COALESCE(MAX(vote_score), 0) INTO v_user_val
                FROM content WHERE content_type = 'answer' AND author_id = p_user_id AND deleted_at IS NULL;

            END IF;

            IF v_user_val >= r_badge.criteria_threshold THEN
                INSERT INTO badge_award (user_id, badge_id)
                VALUES (p_user_id, r_badge.badge_id);
            END IF;
        END LOOP;
END;
$$ LANGUAGE plpgsql;


-- Evaluate badges when a user posts content
CREATE OR REPLACE FUNCTION trigger_evaluate_badges_content() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.author_id IS NOT NULL THEN
        PERFORM check_and_award_badges(NEW.author_id);
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_eval_badges_content
    AFTER INSERT ON content
    FOR EACH ROW
EXECUTE FUNCTION trigger_evaluate_badges_content();


-- Evaluate badges when a vote is cast (score-based badges)
CREATE OR REPLACE FUNCTION trigger_evaluate_badges_vote() RETURNS TRIGGER AS $$
DECLARE
    v_author_id UUID;
BEGIN
    SELECT author_id INTO v_author_id FROM content WHERE content_id = NEW.content_id;

    IF v_author_id IS NOT NULL THEN
        PERFORM check_and_award_badges(v_author_id);
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_eval_badges_vote
    AFTER INSERT ON vote
    FOR EACH ROW
EXECUTE FUNCTION trigger_evaluate_badges_vote();



CREATE OR REPLACE FUNCTION expire_stale_bounties() RETURNS void AS $$
BEGIN
    UPDATE bounty
    SET status = 'expired'
    WHERE status = 'active'
      AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
