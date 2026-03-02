-- Function for updating timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
    RETURNS TRIGGER AS
$$
    BEGIN
        -- Update the `updated_at` field of the new row to current time
        NEW.updated_at := CURRENT_TIMESTAMP;

        RETURN NEW;
    END;
$$ LANGUAGE plpgsql;

-- Trigger for updating updated_at field on modification of the ` Content ` table
CREATE TRIGGER trg_update_content_timestamp
    BEFORE UPDATE
    ON content
    FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Trigger for updating updated_at field on modification of the ` Flag ` table
CREATE TRIGGER trg_update_flag_timestamp
    BEFORE UPDATE
    ON flag
    FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Trigger for updating updated_at field on modification of the ` Profile ` table
CREATE TRIGGER trg_update_profile_timestamp
    BEFORE UPDATE
    ON profile
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- Trigger for updating vote count for a content
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
        RETURN NULL;
    END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_vote_score
    AFTER INSERT OR UPDATE OR DELETE
    ON vote
    FOR EACH ROW
    EXECUTE FUNCTION update_vote_score();

-- Trigger for updating the count of answer on a question
CREATE OR REPLACE FUNCTION update_answer_count()
    RETURNS TRIGGER AS
$$
    BEGIN
        IF TG_OP = 'INSERT' THEN
            UPDATE question
            SET answer_count = answer_count + 1,
                last_activity_at = CURRENT_TIMESTAMP
            WHERE content_id = NEW.content_id;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE question
            SET answer_count = answer_count - 1,
                last_activity_at = CURRENT_TIMESTAMP
            WHERE content_id = OLD.content_id;
        END IF;
        RETURN NULL;
    END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_answer_count
    AFTER INSERT OR DELETE
    ON answer
    FOR EACH ROW
    EXECUTE FUNCTION update_answer_count();

-- Trigger for updating the badge count of a user
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
            SET badge_count = badge_count - 1
            WHERE user_id = OLD.user_id;
        END IF;
        RETURN NULL;
    END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_badge_count
    AFTER INSERT OR DELETE
    ON badge_award
    FOR EACH ROW
    EXECUTE FUNCTION update_badge_count();

-- Trigger for updating the reputation points of a user
CREATE OR REPLACE FUNCTION update_reputation_points()
    RETURNS TRIGGER AS
$$
    BEGIN
        IF TG_OP = 'INSERT' THEN
            UPDATE "user"
            SET reputation_points = greatest(0, reputation_points + NEW.change_amount)
            WHERE user_id = NEW.user_id;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE "user"
            SET reputation_points = greatest(0, reputation_points - OLD.change_amount)
            WHERE user_id = OLD.user_id;
        END IF;
        RETURN NULL;
    END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_reputation_points
    AFTER INSERT OR DELETE
    ON reputation_history
    FOR EACH ROW
    EXECUTE FUNCTION update_reputation_points();

-- Trigger for notifying users on new answers
CREATE OR REPLACE FUNCTION notify_on_new_answer()
    RETURNS TRIGGER AS
$$
    DECLARE
        v_answerer_id UUID;
        v_questioner_id UUID;
    BEGIN
        -- Get the actor user id
        SELECT c.author_id INTO v_answerer_id
        FROM answer a
        JOIN content c ON c.content_id = a.content_id
        WHERE a.content_id = NEW.content_id;

        -- Get the recipient_user_id
        SELECT c.author_id INTO v_questioner_id
        FROM answer a
        JOIN content c ON c.content_id = a.question_id
        WHERE a.content_id = NEW.content_id;

        IF v_questioner_id IS NOT NULL AND v_questioner_id <> v_answerer_id THEN
            INSERT INTO notification (
                recipient_user_id,
                actor_user_id,
                notification_type,
                related_entity_id,
                action_url
            ) VALUES (
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
    AFTER INSERT
    ON answer
    FOR EACH ROW
    EXECUTE FUNCTION notify_on_new_answer();

-- Trigger for notifying user on answer accepted
CREATE OR REPLACE FUNCTION notify_on_answer_accepted()
    RETURNS TRIGGER AS
$$
    DECLARE
        v_answerer_id UUID;
        v_questioner_id UUID;
    BEGIN
        IF NEW.is_accepted = true AND (OLD.is_accepted IS NULL OR OLD.is_accepted = false) THEN
            -- Get the answerer user id
            SELECT c.author_id INTO v_answerer_id
            FROM answer a
                     JOIN content c ON c.content_id = a.content_id
            WHERE a.content_id = NEW.content_id;

            -- Get the questioner user id
            SELECT c.author_id INTO v_questioner_id
            FROM answer a
                     JOIN content c ON c.content_id = a.question_id
            WHERE a.content_id = NEW.content_id;

            IF v_questioner_id IS NOT NULL AND v_questioner_id <> v_answerer_id THEN
                INSERT INTO notification (
                    recipient_user_id,
                    actor_user_id,
                    notification_type,
                    related_entity_id,
                    action_url
                ) VALUES (
                             v_answerer_id,
                             v_questioner_id,
                             'ANSWER_ACCEPTED',
                             NEW.content_id,
                             '/questions/' || NEW.question_id || '#answer-' || NEW.content_id
                         );
            END IF;
        END IF;
    END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_notify_on_answer_accepted
    AFTER UPDATE
    ON answer
    FOR EACH ROW
    EXECUTE FUNCTION notify_on_answer_accepted();