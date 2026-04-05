-- User acceptance rate
CREATE OR REPLACE FUNCTION get_user_acceptance_rate(
    p_user_id UUID
) RETURNS NUMERIC AS
$$
    DECLARE
        v_total_answers INTEGER;
        v_total_accepted_answers INTEGER;
    BEGIN
        -- Get total answers of the users
        SELECT COUNT(*) INTO v_total_answers
        FROM content
        WHERE author_id = p_user_id AND content_type = 'answer';

        -- Avoid division by zero
        IF v_total_answers = 0 THEN
            RETURN 0.0;
        END IF;

        -- Get total accepted answer
        SELECT COUNT(*) INTO v_total_accepted_answers
        FROM content c
        JOIN answer a ON c.content_id = a.content_id
        WHERE c.author_id = p_user_id AND c.content_type = 'answer' AND a.is_accepted = TRUE;

        -- Calculate acceptance rate
        RETURN ROUND(v_total_accepted_answers::NUMERIC / v_total_answers::NUMERIC, 2);
    END;
$$ LANGUAGE plpgsql;

-- Get stats of a user
CREATE OR REPLACE FUNCTION get_user_stats(
    p_user_id UUID
) RETURNS JSONB AS
$$
    DECLARE
        v_question_count INTEGER;
        v_answer_count INTEGER;
        v_followed_tag_count INTEGER;
        v_accepted_answer_count INTEGER;
        v_acceptance_rate NUMERIC;
        v_result JSONB;
    BEGIN
        -- User's total questions
        SELECT COUNT(*) INTO v_question_count
        FROM content
        WHERE author_id = p_user_id
            AND content_type = 'question'
            AND deleted_at IS NULL;

        -- User's total answers
        SELECT COUNT(*) INTO v_answer_count
        FROM content
        WHERE author_id = p_user_id
            AND content_type = 'answer'
            AND deleted_at IS NULL;

        -- User's number of followed tags
        SELECT COUNT(*) INTO v_followed_tag_count
        FROM user_tag_follow
        WHERE user_id = p_user_id;

        -- User's accepted answers
        SELECT COUNT(*) INTO v_accepted_answer_count
        FROM content c
        JOIN answer a ON c.content_id = a.content_id
        WHERE c.author_id = p_user_id
            AND c.content_type = 'answer'
            AND a.is_accepted = TRUE;

        -- User's acceptance rate
        v_acceptance_rate := get_user_acceptance_rate(p_user_id);

        -- Get the resultant
        SELECT json_build_object(
            'username', u.username,
            'reputationPoints', u.reputation_points,
            'badgeCount', u.badge_count,
            'createdAt', u.created_at,
            'firstName', p.first_name,
            'lastName', p.last_name,
            'profilePicture', p.profile_picture,
            'bio', p.bio,
            'website', p.website,
            'questionCount', v_question_count,
            'answerCount', v_answer_count,
            'followedTagCount', v_followed_tag_count,
            'acceptedAnswerCount', v_accepted_answer_count,
            'acceptanceRate', v_acceptance_rate
        ) INTO v_result
        FROM "user" u
        LEFT JOIN profile p ON u.user_id = p.user_id
        WHERE u.user_id = p_user_id;

        RETURN v_result;
    END;
$$ LANGUAGE plpgsql;

-- Get tags related to a question
CREATE OR REPLACE FUNCTION get_question_tags(
    p_question_id UUID
) RETURNS JSONB[] AS
$$
    DECLARE
        v_result JSONB[];
    BEGIN
        SELECT ARRAY_AGG(jsonb_build_object(
            'tag_id', t.tag_id,
            'name', t.name
        )) INTO v_result
        FROM question_tag qt
        JOIN tag t ON t.tag_id = qt.tag_id
        WHERE qt.question_id = p_question_id;

        RETURN v_result;
    END;
$$ LANGUAGE plpgsql;

-- Get active bounty of a question
CREATE OR REPLACE FUNCTION get_active_bounty(
    p_question_id UUID
) RETURNS JSONB AS
$$
    DECLARE
        v_result JSONB;
    BEGIN
        SELECT jsonb_build_object(
            'id', b.bounty_id,
            'amount', b.amount,
            'expiresAt', b.expires_at
        ) INTO v_result
        FROM bounty b
        WHERE b.question_id = p_question_id AND b.status = 'active'
        LIMIT 1;

        RETURN v_result;
    END;
$$ LANGUAGE plpgsql;