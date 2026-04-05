import pool from '../db/pool.js';
import Tag from './tagModel.js';

// Aggregated stats for the authenticated user's dashboard header
const getUserStats = async (userId) => {
    const result = await pool.query(
        `SELECT get_user_stats($1) AS stats`,
        [userId]
    );
    
    return result.rows[0].stats ?? null;
};

// Questions feed — filtered by followed tags (or all questions if none followed)
// Returns the same shape as the questions listing so the frontend can reuse QuestionCard
const getFeedQuestions = async ({ userId, limit, offset }) => {
    const followedTagIds = await Tag.getFollowedTagIds(userId);
    const hasFollowedTags = followedTagIds.length > 0;
    
    // Build the tag filter clause
    const tagFilter = hasFollowedTags
        ? `AND q.content_id IN (
               SELECT question_id FROM question_tag
               WHERE tag_id = ANY($3::uuid[])
           )`
        : '';
    
    const baseParams = hasFollowedTags
        ? [limit, offset, followedTagIds]
        : [limit, offset];
    
    const feedQuery = `
        SELECT
            c.content_id as "id",
            q.title,
            c.body,
            q.view_count as "viewCount",
            q.answer_count as "answersCount",
            q.last_activity_at as "lastActivityAt",
            c.vote_score as "voteScore",
            c.created_at as "createdAt",
            c.updated_at as "updatedAt",
            c.is_frozen as "isFrozen",
            get_active_bounty(q.content_id) AS "activeBounty",
            jsonb_build_object(
                'authorId',       c.author_id,
                'username',       u.username,
                'firstName',      p.first_name,
                'lastName',       p.last_name,
                'profilePicture', p.profile_picture
            ) AS "author",
            get_question_tags(q.content_id) AS "tags"
        FROM question q
        JOIN content c ON q.content_id = c.content_id
        LEFT JOIN profile p ON c.author_id = p.user_id
        LEFT JOIN "user" u ON c.author_id = u.user_id
        WHERE c.is_frozen = FALSE
        ${tagFilter}
        ORDER BY q.last_activity_at DESC
        LIMIT $1 OFFSET $2
    `;
    
    // Count query mirrors the same filter (no pagination)
    const countQuery = `
        SELECT COUNT(*) FROM question q
        JOIN content c ON q.content_id = c.content_id
        WHERE c.is_frozen = FALSE
        ${tagFilter}
    `;
    
    const countParams = hasFollowedTags ? [followedTagIds] : [];
    const adjustedCountQuery = hasFollowedTags
        ? countQuery.replace('$3::uuid[]', '$1::uuid[]')
        : countQuery.replace('$3::uuid[]', '');
    
    const [feedResult, countResult] = await Promise.all([
        pool.query(feedQuery,  baseParams),
        pool.query(adjustedCountQuery, countParams),
    ]);
    
    const total      = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(total / limit);
    
    return {
        questions:        feedResult.rows,
        total,
        totalPages,
        currentPage:      Math.floor(offset / limit) + 1,
        isFiltered:       hasFollowedTags,
        followedTagCount: followedTagIds.length,
    };
};

export default {
    getUserStats,
    getFeedQuestions,
};