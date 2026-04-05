
-------------------------------------
-- USER PROCEDURES
-------------------------------------
-- Register a new user
CREATE OR REPLACE PROCEDURE register_user(
    p_username VARCHAR(50),
    p_email VARCHAR(255),
    p_password_hash TEXT
)  AS $$
    DECLARE
        v_user_id UUID;
    BEGIN
        INSERT INTO "user" (username, email, password_hash)
        VALUES (p_username, p_email, p_password_hash)
        RETURNING user_id INTO v_user_id;

        INSERT INTO profile (user_id)
        VALUES (v_user_id);
    END;
$$ LANGUAGE plpgsql;

-------------------------------------
-- QUESTION PROCEDURES
-------------------------------------
-- Create a new question
CREATE OR REPLACE PROCEDURE create_question(
    p_title VARCHAR(300),
    p_content JSONB,
    p_author_id UUID,
    p_tags UUID[],
    OUT p_question_id UUID
) AS $$
    BEGIN
        -- Insert into the content table
        INSERT INTO content (content_type, author_id, body)
        VALUES ('question', p_author_id, p_content)
        RETURNING content_id INTO p_question_id;

        -- Insert into the question table
        INSERT INTO question (content_id, title)
        VALUES (p_question_id, p_title);

        -- Insert the tags into the question_tag table
        INSERT INTO question_tag (question_id, tag_id)
        SELECT p_question_id, unnest(p_tags);
    END;
$$ LANGUAGE plpgsql;

-- Update a question
CREATE OR REPLACE PROCEDURE update_question(
    p_question_id UUID,
    p_title VARCHAR(300),
    p_content JSONB,
    p_author_id UUID,
    OUT p_updated_question UUID
) AS $$
    DECLARE
        v_author_id UUID;
    BEGIN
        -- Get the author of the question
        SELECT c.author_id INTO v_author_id
        FROM content c
        WHERE c.content_id = p_question_id;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'NOT_FOUND';
        END IF;

        -- Check if the user is the author of the question
        IF v_author_id != p_author_id THEN
            RAISE EXCEPTION 'UNAUTHORIZED';
        END IF;

        -- Update the content table
        UPDATE content
        SET body = p_content
        WHERE content_id = p_question_id;

        -- Update the answer title and last_activity
        UPDATE question
        SET title = p_title, last_activity_at = CURRENT_TIMESTAMP
        WHERE content_id = p_question_id
        RETURNING content_id INTO p_updated_question;
    END;
$$ LANGUAGE plpgsql;

-- Delete a question
CREATE OR REPLACE PROCEDURE delete_question(
    p_question_id UUID,
    p_author_id UUID,
    INOUT p_deleted_question UUID DEFAULT NULL
) AS $$
    DECLARE
        v_author_id UUID;
    BEGIN
        -- Get the author of the question
        SELECT c.author_id INTO v_author_id
        FROM content c
        WHERE c.content_id = p_question_id;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'NOT_FOUND';
        END IF;

        -- Check if the user is the author of the question
        IF v_author_id != p_author_id THEN
            RAISE EXCEPTION 'UNAUTHORIZED';
        END IF;

        -- Delete the question (question cascaded)
        DELETE FROM content
        WHERE content_id = p_question_id RETURNING content_id INTO p_deleted_question;
    END;
$$ LANGUAGE plpgsql;

-------------------------------------
-- ANSWER PROCEDURES
-------------------------------------
-- Create a new answer
CREATE OR REPLACE PROCEDURE create_answer(
    p_question_id UUID,
    p_content JSONB,
    p_author_id UUID,
    OUT p_answer_id UUID
) AS $$
    BEGIN
        -- Check if the question exists
        IF NOT EXISTS (
            SELECT 1 FROM content
            WHERE content_id = p_question_id
                AND content_type = 'question'
        ) THEN
            RAISE EXCEPTION 'QUESTION_NOT_FOUND';
        END IF;

        -- Create the content
        INSERT INTO content (content_type, author_id, body)
        VALUES ('answer', p_author_id, p_content)
        RETURNING content_id INTO p_answer_id;

        -- Insert the answer into the answer table
        INSERT INTO answer (content_id, question_id)
        VALUES (p_answer_id, p_question_id);

        -- Update the question's answer_count and last_activity_at
        UPDATE question SET
        answer_count = answer_count + 1,
        last_activity_at = CURRENT_TIMESTAMP
        WHERE content_id = p_question_id;
    END;
$$ LANGUAGE plpgsql;

-- Update an answer
CREATE OR REPLACE PROCEDURE update_answer(
    p_answer_id UUID,
    p_content JSONB,
    p_author_id UUID,
    OUT p_updated_answer UUID
) AS $$
    DECLARE
        v_author_id UUID;
    BEGIN
        -- Get the author of the answer
        SELECT c.author_id INTO v_author_id
        FROM content c
        WHERE c.content_id = p_answer_id;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'NOT_FOUND';
        END IF;

        -- Check if the user is the author of the answer
        IF v_author_id != p_author_id THEN
            RAISE EXCEPTION 'UNAUTHORIZED';
        END IF;

        -- Update the answer
        UPDATE content
        SET body = p_content
        WHERE content_id = p_answer_id
        RETURNING content_id INTO p_updated_answer;

        -- Update the last_activity_at of the question
        UPDATE question
        SET last_activity_at = CURRENT_TIMESTAMP
        WHERE content_id = (
            SELECT question_id FROM answer WHERE content_id = p_updated_answer
        );
    END;
$$ LANGUAGE plpgsql;

-- Delete an answer
CREATE OR REPLACE PROCEDURE delete_answer(
    p_answer_id UUID,
    p_author_id UUID,
    OUT p_deleted_answer UUID
) AS $$
    DECLARE
        v_author_id UUID;
        v_question_id UUID;
    BEGIN
        -- Get the author of the answer
        SELECT c.author_id, a.question_id INTO v_author_id, v_question_id
        FROM content c
        JOIN answer a ON a.content_id = c.content_id
        WHERE c.content_id = p_answer_id;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'NOT_FOUND';
        END IF;

        -- Check if the user is the author of the answer
        IF v_author_id != p_author_id THEN
            RAISE EXCEPTION 'UNAUTHORIZED';
        END IF;

        -- Delete the answer (answer cascaded)
        DELETE FROM content
        WHERE content_id = p_answer_id
        RETURNING content_id INTO p_deleted_answer;

        -- Decrement the question's answer_count and last_activity_at
        UPDATE question SET
        answer_count = answer_count - 1,
        last_activity_at = CURRENT_TIMESTAMP
        WHERE content_id = v_question_id;
    END;
$$ LANGUAGE plpgsql;

-------------------------------------
-- COMMENT PROCEDURES
-------------------------------------
-- Create a new comment
CREATE OR REPLACE PROCEDURE create_comment(
    p_parent_id UUID,
    p_recipient_id UUID,
    p_content JSONB,
    p_author_id UUID,
    p_parent_type content_type,
    OUT p_comment_id UUID
) AS $$
    DECLARE
        v_comment_id UUID;
    BEGIN
        -- Check if the parent exists
        IF NOT EXISTS (
            SELECT 1 FROM content
            WHERE content_id = p_parent_id
                AND content_type = p_parent_type
        ) THEN
            RAISE EXCEPTION 'PARENT_NOT_FOUND';
        END IF;

        -- Check if the recipient exists
        IF p_recipient_id IS NOT NULL AND NOT EXISTS (
            SELECT 1 FROM "user"
            WHERE user_id = p_recipient_id
        ) THEN
            RAISE EXCEPTION 'RECIPIENT_NOT_FOUND';
        END IF;

        -- Create the content
        INSERT INTO content (content_type, author_id, body)
        VALUES ('comment', p_author_id, p_content)
        RETURNING content_id INTO v_comment_id;

        -- Create the comment
        INSERT INTO comment (parent_id, content_id, recipient_id)
        VALUES (p_parent_id, v_comment_id, p_recipient_id)
        RETURNING content_id INTO p_comment_id;
    END;
$$ LANGUAGE plpgsql;

-- Update question
CREATE OR REPLACE PROCEDURE  update_comment(
    p_comment_id UUID,
    p_content JSONB,
    p_author_id UUID,
    OUT p_updated_comment UUID
) AS $$
    DECLARE
        v_author_id UUID;
    BEGIN
        -- Check if the comment exists
        SELECT c.author_id INTO v_author_id
        FROM content c
        WHERE c.content_id = p_comment_id;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'NOT_FOUND';
        END IF;

        -- Check if the user is the author of the comment
        IF v_author_id != p_author_id THEN
            RAISE EXCEPTION 'UNAUTHORIZED';
        END IF;

        -- Update the comment
        UPDATE content
        SET body = p_content
        WHERE content_id = p_comment_id
        RETURNING content_id INTO p_updated_comment;
    END;
$$ LANGUAGE plpgsql;

-- Delete a comment
CREATE OR REPLACE PROCEDURE delete_comment(
    p_comment_id UUID,
    p_author_id UUID,
    OUT p_deleted_comment UUID
) AS $$
    DECLARE
        v_author_id UUID;
    BEGIN
        -- Check if the comment exists
        SELECT c.author_id INTO v_author_id
        FROM content c
        WHERE c.content_id = p_comment_id;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'NOT_FOUND';
        END IF;

        -- Check if the user is the author of the comment
        IF v_author_id != p_author_id THEN
            RAISE EXCEPTION 'UNAUTHORIZED';
        END IF;

        -- Delete the comment (comment cascaded)
        DELETE FROM content
        WHERE content_id = p_comment_id
        RETURNING content_id INTO p_deleted_comment;
    END;
$$ LANGUAGE plpgsql;

-------------------------------------
-- FLAG PROCEDURES
-------------------------------------
-- Create a flag
CREATE OR REPLACE PROCEDURE create_flag(
    p_user_id UUID,
    p_content_id UUID,
    p_reason VARCHAR(100),
    p_flag_category flag_category,
    p_suggested_duplicate UUID,
    OUT p_flag_id UUID
) AS $$
    BEGIN
        -- Check if the content exists
        IF NOT EXISTS (
            SELECT 1 FROM content
            WHERE content_id = p_content_id
        ) THEN
            RAISE EXCEPTION 'CONTENT_NOT_FOUND';
        END IF;

        -- Prevent a user from flagging the same content twice
        IF EXISTS (
            SELECT 1 FROM flag
            WHERE user_id = p_user_id
                AND content_id = p_content_id
        ) THEN
            RAISE EXCEPTION 'ALREADY_FLAGGED';
        END IF;

        -- Insert into the flag table
        INSERT INTO flag (user_id, content_id, reason, flag_category, suggested_duplicate_id)
        VALUES (p_user_id, p_content_id, p_reason, p_flag_category, p_suggested_duplicate)
        RETURNING flag_id INTO p_flag_id;
    END;
$$ LANGUAGE plpgsql;

-- Review a flag
CREATE OR REPLACE PROCEDURE review_flag(
    p_flag_id UUID,
    p_moderator_id UUID,
    p_status flag_status,
    p_moderator_note TEXT,
    OUT p_updated_flag UUID
) AS $$
    DECLARE
        v_content_id UUID;
    BEGIN
        -- Check if the flag exists
        IF NOT EXISTS (
            SELECT 1 FROM flag
            WHERE flag_id = p_flag_id
        ) THEN
            RAISE EXCEPTION 'FLAG_NOT_FOUND';
        END IF;

        -- Update the flag
        UPDATE flag
        SET status = p_status, moderator_id = p_moderator_id, moderator_note = p_moderator_note, updated_at = CURRENT_TIMESTAMP
        WHERE flag_id = p_flag_id
        RETURNING flag_id, content_id INTO p_updated_flag, v_content_id;

        -- Freeze the content when the moderator decides to take action
        IF p_status = 'action_taken' THEN
            UPDATE content
            SET is_frozen = true
            WHERE content_id = v_content_id;
        -- When the moderator reverses to a non-action status, unfreeze the content
        ELSIF p_status != 'action_taken' THEN
            UPDATE content
            SET is_frozen = false
            WHERE content_id = v_content_id;
        END IF;
    END;
$$ LANGUAGE plpgsql;

-------------------------------------
-- FLAG PROCEDURES
-------------------------------------
-- Create a bounty
CREATE OR REPLACE PROCEDURE create_bounty(
    p_question_id UUID,
    p_amount INTEGER,
    p_offered_by UUID,
    p_reason TEXT,
    OUT p_bounty_id UUID
) AS $$
    DECLARE
        v_offerer_reputation INTEGER;
    BEGIN
        -- Check if the question exists
        IF NOT EXISTS (
            SELECT 1 FROM content
            WHERE content_id = p_question_id
                AND content_type = 'question'
        ) THEN
            RAISE EXCEPTION 'QUESTION_NOT_FOUND';
        END IF;

        -- Check offerer has enough reputation points
        SELECT reputation_points INTO v_offerer_reputation
        FROM "user"
        WHERE user_id = p_offered_by;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'USER_NOT_FOUND';
        END IF;

        IF v_offerer_reputation < p_amount THEN
            RAISE EXCEPTION 'INSUFFICIENT_REPUTATION';
        END IF;

        -- Insert into the bounty table
        INSERT INTO bounty (question_id, amount, offered_by, reason, expires_at)
        VALUES (p_question_id, p_amount, p_offered_by, p_reason, NOW() + INTERVAL '7 days')
        RETURNING bounty_id INTO p_bounty_id;

        -- Record the reputation change
        INSERT INTO reputation_history(user_id, change_amount, reason, related_entity_type, related_entity_id)
        VALUES (p_offered_by, -p_amount, 'BOUNTY_OFFERED', 'bounty', p_bounty_id);
    END;
$$ LANGUAGE plpgsql;

-- Award bounty
CREATE OR REPLACE PROCEDURE award_bounty(
    p_bounty_id UUID,
    p_answer_id UUID,
    p_awarded_by UUID,
    OUT p_awarded_bounty_id UUID
) AS $$
    DECLARE
        v_bounty_status bounty_status;
        v_answer_author_id UUID;
        v_bounty_amount INTEGER;
        v_bounty_awarded_by UUID;
    BEGIN
        -- Check if the bounty exists and is active
        SELECT status, amount, offered_by INTO v_bounty_status, v_bounty_amount, v_bounty_awarded_by
        FROM bounty
        WHERE bounty_id = p_bounty_id;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'BOUNTY_NOT_FOUND';
        END IF;

        IF v_bounty_status != 'active' THEN
            RAISE EXCEPTION 'BOUNTY_NOT_ACTIVE';
        END IF;

        IF p_awarded_by != v_bounty_awarded_by THEN
            RAISE EXCEPTION 'UNAUTHORIZED';
        END IF;

        -- Get the answer author
        SELECT c.author_id INTO v_answer_author_id
        FROM answer a
        JOIN content c ON c.content_id = a.content_id
        WHERE a.content_id = p_answer_id;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'ANSWER_NOT_FOUND';
        END IF;

        -- Update bounty status
        UPDATE bounty
        SET status = 'awarded', awarded_answer_id = p_answer_id, awarded_at = CURRENT_TIMESTAMP
        WHERE bounty_id = p_bounty_id;

        -- Grant reputation to the answer's author
        INSERT INTO reputation_history(user_id, change_amount, reason, related_entity_type, related_entity_id)
        VALUES (v_answer_author_id, v_bounty_amount, 'BOUNTY_AWARDED', 'bounty', p_bounty_id);
    END;
$$ LANGUAGE plpgsql;