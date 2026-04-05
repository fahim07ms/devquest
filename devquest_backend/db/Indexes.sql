-- USER TABLE INDEXES
CREATE INDEX IF NOT EXISTS idx_user_reputation ON "user"(reputation_points DESC);
CREATE INDEX IF NOT EXISTS idx_user_role ON "user"(role) WHERE role IN ('moderator', 'admin');

-- PROFILE TABLE INDEXES
CREATE INDEX IF NOT EXISTS idx_profile_user_id ON profile(user_id);

-- CONTENT TABLE INDEXES
CREATE INDEX IF NOT EXISTS idx_content_user_id ON content(author_id) WHERE author_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_content_type ON content(content_type);
CREATE INDEX IF NOT EXISTS idx_content_created_at ON content(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_vote_score ON content(vote_score DESC);
CREATE INDEX IF NOT EXISTS idx_content_active ON content(content_type, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_content_type_score ON content(content_type, vote_score DESC) WHERE deleted_at IS NULL;

-- QUESTION TABLE INDEXES
CREATE INDEX IF NOT EXISTS idx_question_view_count ON question(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_question_last_activity ON question(last_activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_question_hot ON question(last_activity_at DESC, view_count DESC)
    WHERE view_count > 0;

-- ANSWER TABLE INDEXES
CREATE INDEX IF NOT EXISTS idx_answer_question_id ON answer(question_id);
CREATE INDEX IF NOT EXISTS idx_answer_accepted ON answer(question_id, is_accepted) WHERE is_accepted = true;

-- COMMENT TABLE INDEXES
CREATE INDEX IF NOT EXISTS idx_comment_parent_id ON comment(parent_id);

-- QUESTION_DUPLICATE TABLE INDEXES
CREATE INDEX IF NOT EXISTS idx_duplicate_canonical ON question_duplicate(duplicate_of);

-- QUESTION_TAG TABLE INDEXES
CREATE INDEX IF NOT EXISTS idx_question_tag_tag ON question_tag(tag_id);
CREATE INDEX IF NOT EXISTS idx_question_tag_assigned ON question_tag(assigned_at DESC);

-- USER_TAG_FOLLOW TABLE INDEXES
CREATE INDEX IF NOT EXISTS idx_user_tag_follow_tag ON user_tag_follow(tag_id);
CREATE INDEX IF NOT EXISTS idx_user_tag_follow_user ON user_tag_follow(user_id);

-- VOTE TABLE INDEXES
CREATE INDEX IF NOT EXISTS idx_vote_user ON vote(user_id);
CREATE INDEX IF NOT EXISTS idx_vote_content ON vote(content_id);
CREATE INDEX IF NOT EXISTS idx_vote_created_at ON vote(created_at DESC);

-- BOOKMARK TABLE INDEXES
CREATE INDEX IF NOT EXISTS idx_bookmark_user ON bookmark(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookmark_content ON bookmark(content_id);

-- FLAG TABLE INDEXES
CREATE INDEX idx_flag_user ON flag(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_flag_content ON flag(content_id);
CREATE INDEX idx_flag_status ON flag(status) WHERE status = 'pending';
CREATE INDEX idx_flag_moderator ON flag(moderator_id) WHERE moderator_id IS NOT NULL;
CREATE INDEX idx_flag_category ON flag(flag_category);

-- BOUNTY TABLE INDEXES
CREATE INDEX IF NOT EXISTS idx_bounty_question ON bounty(question_id);
CREATE INDEX IF NOT EXISTS idx_bounty_offered_by ON bounty(offered_by)
    WHERE offered_by IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bounty_status ON bounty(status, expires_at);
CREATE INDEX IF NOT EXISTS idx_bounty_expires ON bounty(expires_at) WHERE status = 'active';

-- BADGE TABLE INDEXES
CREATE INDEX IF NOT EXISTS idx_badge_tier ON badge(badge_tier);
CREATE INDEX IF NOT EXISTS idx_badge_criteria ON badge(criteria_type, criteria_threshold);

-- BADGE_AWARD TABLE INDEXES
CREATE INDEX IF NOT EXISTS idx_badge_award_user ON badge_award(user_id, awarded_at DESC);
CREATE INDEX IF NOT EXISTS idx_badge_award_badge ON badge_award(badge_id);

-- REPUTATION_HISTORY TABLE INDEXES
CREATE INDEX IF NOT EXISTS idx_reputation_history_user ON reputation_history(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reputation_history_created ON reputation_history(created_at DESC);
CREATE INDEX idx_reputation_history_reason ON reputation_history(reason);
CREATE INDEX idx_reputation_history_entity ON reputation_history(related_entity_type, related_entity_id);

-- NOTIFICATION TABLE INDEXES
CREATE INDEX IF NOT EXISTS idx_notification_recipient ON notification(recipient_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_unread ON notification(recipient_user_id, is_read, created_at DESC)
    WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notification_actor ON notification(actor_user_id)
    WHERE actor_user_id IS NOT NULL;
