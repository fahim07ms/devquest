import pool from '../db/pool.js';
import Tag from './tagModel.js';

// Aggregated stats for the authenticated user's dashboard header
const getUserStats = async (userId) => {
    const result = await pool.query(
        `SELECT
            u.username,
            u.reputation_points  AS "reputationPoints",
            u.badge_count        AS "badgeCount",
            u.created_at         AS "createdAt",
            p.first_name         AS "firstName",
            p.last_name          AS "lastName",
            p.profile_picture    AS "profilePicture",
            (SELECT
                COUNT(*)
            FROM content
            WHERE content_type = 'question'
                AND author_id = $1
                AND deleted_at IS NULL
            ) as "questionCount",
            (SELECT
                COUNT(*)
            FROM content
            WHERE content_type = 'answer'
                AND author_id = $1
                AND deleted_at IS NULL
            ) as "answerCount",
            (SELECT
                COUNT(*)
            FROM user_tag_follow
            WHERE user_id = $1
            ) as "followedTagCount",
            (SELECT
                COUNT(*)
            FROM answer a
                JOIN content c ON a.content_id = c.content_id
            WHERE c.author_id = $1
                AND a.is_accepted = true
            ) as "acceptedAnswerCount"
        FROM "user" u
        LEFT JOIN profile p ON u.user_id = p.user_id
        WHERE u.user_id = $1`,
        [userId]
    );
    return result.rows[0] ?? null;
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
            c.content_id            AS "id",
            q.title,
            c.body,
            q.view_count            AS "viewCount",
            q.answer_count          AS "answersCount",
            q.last_activity_at      AS "lastActivityAt",
            c.vote_score            AS "voteScore",
            c.created_at            AS "createdAt",
            c.updated_at            AS "updatedAt",
            c.is_frozen             AS "isFrozen",
            (
                SELECT jsonb_build_object(
                    'id',        b.bounty_id,
                    'amount',    b.amount,
                    'expiresAt', b.expires_at
                )
                FROM bounty b
                WHERE b.question_id = q.content_id AND b.status = 'active'
                LIMIT 1
            ) AS "activeBounty",
            jsonb_build_object(
                'authorId',       c.author_id,
                'username',       u.username,
                'firstName',      p.first_name,
                'lastName',       p.last_name,
                'profilePicture', p.profile_picture
            ) AS "author",
            (
                SELECT ARRAY_AGG(jsonb_build_object('tag_id', t.tag_id, 'name', t.name))
                FROM question_tag qt2
                JOIN tag t ON qt2.tag_id = t.tag_id
                WHERE qt2.question_id = q.content_id
            ) AS "tags"
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