-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUM START

-- USER ROLE
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'moderator', 'member');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CONTENT TYPE
DO $$ BEGIN
    CREATE TYPE content_type AS ENUM ('question', 'answer', 'comment');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Flag Status
DO $$ BEGIN
    CREATE TYPE flag_status AS ENUM ('pending', 'reviewed', 'rejected', 'action_taken');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Flag Category
DO $$ BEGIN
    CREATE TYPE flag_category AS ENUM ('spam', 'offensive', 'duplicate', 'low_quality', 'off_topic', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Bounty Type
DO $$ BEGIN
    CREATE TYPE bounty_status AS ENUM ('active', 'awarded', 'expired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Badge Tier
DO $$ BEGIN
    CREATE TYPE badge_tier AS ENUM ('bronze', 'silver', 'gold');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Notification Type
DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM (
        'NEW_ANSWER', 'NEW_COMMENT', 'BADGE_EARNED', 'ANSWER_ACCEPTED', 'BOUNTY_EXPIRING','BOUNTY_AWARDED',
        'QUESTION_EDITED', 'MENTIONED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Badge Criteria Type
DO $$ BEGIN
    CREATE TYPE badge_criteria_type AS ENUM (
        'question_count',
        'answer_count',
        'comment_count',
        'question_views',
        'answer_score',
        'accepted_answer_score',
        'total_votes_received',
        'helpful_flags',
        'consecutive_days_visited'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Reputation Reason Type
DO $$ BEGIN
    CREATE TYPE reputation_reason AS ENUM (
        'QUESTION_UPVOTED',
        'QUESTION_DOWNVOTED',
        'ANSWER_UPVOTED',
        'ANSWER_DOWNVOTED',
        'ANSWER_ACCEPTED',
        'ANSWER_UNACCEPTED',
        'BOUNTY_OFFERED',
        'BOUNTY_AWARDED',
        'DOWNVOTE_GIVEN',
        'SPAM_PENALTY',
        'MODERATOR_ADJUSTMENT'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Reputation Entity Type
DO $$ BEGIN
    CREATE TYPE reputation_entity_type AS ENUM (
        'question',
        'answer',
        'bounty',
        'vote',
        'flag'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Notification Type
DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM (
        'NEW_ANSWER',
        'NEW_COMMENT',
        'BADGE_EARNED',
        'ANSWER_ACCEPTED',
        'BOUNTY_EXPIRING',
        'BOUNTY_AWARDED',
        'QUESTION_EDITED',
        'MENTIONED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ENUM END

-- USER TABLE
CREATE TABLE IF NOT EXISTS "user" (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role user_role DEFAULT 'member',
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    reputation_points INTEGER NOT NULL DEFAULT 0,
    badge_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT username_length CHECK (char_length(username) >= 1),
    CONSTRAINT reputation_not_negative CHECK (reputation_points >= 0),
    CONSTRAINT badge_count_not_negative CHECK (badge_count >= 0)
);


-- PROFILE TABLE
CREATE TABLE IF NOT EXISTS "profile" (
    profile_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES "user"(user_id) ON DELETE CASCADE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    birth_date DATE,
    profile_picture TEXT,
    bio TEXT,
    website TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Constraint
    CONSTRAINT birth_date_valid CHECK (birth_date IS NULL OR birth_date <= CURRENT_DATE)
);

-- TAG TABLE
CREATE TABLE IF NOT EXISTS "tag" (
    tag_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT name_not_empty CHECK (char_length(trim(name)) >= 1)
);

-- CONTENT TABLE
CREATE TABLE IF NOT EXISTS "content" (
    content_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_type content_type NOT NULL,
    author_id UUID,
    body JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ,
    vote_score INTEGER NOT NULL DEFAULT 0,

    -- Constraints
    CONSTRAINT fk_author FOREIGN KEY(author_id) REFERENCES "user"(user_id) ON DELETE SET NULL,
    CONSTRAINT deleted_after_created CHECK (deleted_at IS NULL OR deleted_at >= created_at)
);

-- Question TABLE
CREATE TABLE IF NOT EXISTS "question" (
    content_id UUID PRIMARY KEY REFERENCES "content"(content_id) ON DELETE CASCADE,
    title VARCHAR(300) NOT NULL,
    view_count INTEGER NOT NULL DEFAULT 0,
    answer_count INTEGER NOT NULL DEFAULT 0,
    is_answered BOOLEAN NOT NULL DEFAULT FALSE,
    last_activity_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT title_not_empty CHECK (char_length(trim(title)) >= 5),
    CONSTRAINT title_length_limit CHECK (char_length(trim(title)) <= 300),
    CONSTRAINT view_count_not_negative CHECK (view_count >= 0),
    CONSTRAINT answer_count_not_negative CHECK (answer_count >= 0)
);

-- Answer Table
CREATE TABLE IF NOT EXISTS "answer" (
    content_id UUID PRIMARY KEY REFERENCES "content"(content_id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES "question"(content_id) ON DELETE CASCADE,
    is_accepted BOOLEAN NOT NULL DEFAULT FALSE,
    accepted_at TIMESTAMPTZ
);

-- Question-Tag M:N Relationship
CREATE TABLE IF NOT EXISTS "question_tag" (
    question_id UUID NOT NULL REFERENCES question(content_id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tag(tag_id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    PRIMARY KEY (question_id, tag_id)
);

-- Comment Table
CREATE TABLE IF NOT EXISTS "comment" (
    content_id UUID PRIMARY KEY REFERENCES content(content_id) ON DELETE CASCADE,
    parent_id UUID NOT NULL REFERENCES content(content_id) ON DELETE CASCADE,
    depth_level INTEGER DEFAULT 0,

    -- Constraints
    CONSTRAINT no_self_reference CHECK (content_id != parent_id)
);

-- Duplicate Question Relationship
CREATE TABLE IF NOT EXISTS "question_duplicate" (
    question_id UUID NOT NULL REFERENCES "question"(content_id) ON DELETE CASCADE,
    duplicate_of UUID NOT NULL REFERENCES "question"(content_id) ON DELETE CASCADE,
    marked_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    PRIMARY KEY(question_id),
    CONSTRAINT no_self_duplicate CHECK (question_id != duplicate_of)
);

-- USER_TAG_FOLLOW (M:N Relationship)
CREATE TABLE IF NOT EXISTS "user_tag_follow" (
    user_id UUID NOT NULL REFERENCES "user"(user_id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tag(tag_id) ON DELETE CASCADE,
    followed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    PRIMARY KEY (user_id, tag_id)
);

-- Vote Table
CREATE TABLE IF NOT EXISTS "vote" (
    vote_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES "user"(user_id) ON DELETE CASCADE,
    content_id UUID NOT NULL REFERENCES content(content_id) ON DELETE CASCADE,
    vote_type SMALLINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT vote_type_valid CHECK (vote_type IN (-1, 1)),
    CONSTRAINT one_vote_per_user_content UNIQUE (user_id, content_id)
);

-- Bookmark Table (M:N Relationship)
CREATE TABLE IF NOT EXISTS "bookmark" (
    user_id UUID NOT NULL REFERENCES "user"(user_id) ON DELETE CASCADE,
    content_id UUID NOT NULL REFERENCES content(content_id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    PRIMARY KEY (user_id, content_id)
);

-- Flag Table
CREATE TABLE IF NOT EXISTS "flag" (
    flag_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES "user"(user_id) ON DELETE SET NULL,
    content_id UUID NOT NULL REFERENCES content(content_id) ON DELETE CASCADE,
    reason VARCHAR(100) NOT NULL,
    flag_category flag_category NOT NULL DEFAULT 'other',
    status flag_status NOT NULL DEFAULT 'pending',
    moderator_id UUID REFERENCES "user"(user_id) ON DELETE SET NULL,
    moderator_note TEXT,
    suggested_duplicate_id UUID REFERENCES question(content_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT reason_not_empty CHECK (char_length(trim(reason)) > 0),
    CONSTRAINT duplicate_flag_has_suggestion CHECK (
        (flag_category = 'duplicate' AND suggested_duplicate_id IS NOT NULL) OR
        (flag_category != 'duplicate' AND suggested_duplicate_id IS NULL)
    )
);

-- BOUNTY TABLE
CREATE TABLE IF NOT EXISTS "bounty" (
        bounty_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        question_id UUID NOT NULL REFERENCES question(content_id) ON DELETE CASCADE,
        offered_by UUID REFERENCES "user"(user_id) ON DELETE SET NULL,
        awarded_answer_id UUID REFERENCES answer(content_id) ON DELETE SET NULL,
        amount INTEGER NOT NULL,
        reason TEXT NOT NULL,
        status bounty_status NOT NULL DEFAULT 'active',
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        awarded_at TIMESTAMPTZ,

        -- Constraints
        CONSTRAINT amount_positive CHECK (amount > 0),
        CONSTRAINT expires_after_created CHECK (expires_at > created_at),
        CONSTRAINT awarded_fields_valid CHECK (
            (status = 'awarded' AND awarded_at IS NOT NULL AND awarded_answer_id IS NOT NULL) OR
            (status != 'awarded' AND awarded_at IS NULL)
        )
);

-- BADGE TABLE
CREATE TABLE IF NOT EXISTS "badge" (
    badge_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    badge_tier badge_tier NOT NULL,
    criteria_type badge_criteria_type NOT NULL,
    criteria_threshold INTEGER NOT NULL,
    icon_url VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT criteria_threshold_positive CHECK (criteria_threshold > 0)
);

-- BADGE_AWARD (M:N Relationship)
CREATE TABLE IF NOT EXISTS "badge_award" (
    award_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES "user"(user_id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES badge(badge_id) ON DELETE CASCADE,
    awarded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT unique_user_badge UNIQUE (user_id, badge_id)
);

-- REPUTATION_HISTORY TABLE
CREATE TABLE IF NOT EXISTS "reputation_history" (
    history_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES "user"(user_id) ON DELETE CASCADE,
    change_amount INTEGER NOT NULL,
    reason reputation_reason NOT NULL,
    related_entity_type reputation_entity_type NOT NULL,
    related_entity_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT change_amount_not_zero CHECK (change_amount != 0)
);

-- NOTIFICATION TABLE
CREATE TABLE IF NOT EXISTS "notification" (
    notification_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_user_id UUID NOT NULL REFERENCES "user"(user_id) ON DELETE CASCADE,
    actor_user_id UUID REFERENCES "user"(user_id) ON DELETE SET NULL,
    notification_type notification_type NOT NULL,
    related_entity_id UUID NOT NULL, -- We will derive it from notification_type
    is_read BOOLEAN NOT NULL DEFAULT false,
    action_url VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- Changes and Updates
ALTER TABLE comment
DROP COLUMN depth_level;
ALTER TABLE comment
ADD COLUMN recipient_id UUID REFERENCES "user"(user_id) ON DELETE SET NULL;
