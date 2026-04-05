import { withTransaction } from "../db/client.js";
import pool from "../db/pool.js";

// Add a bookmark for a user
const addBookmark = async (userId, contentId) => {
    const result = await withTransaction(async (client) => {
        const insertResult = await client.query(
            `INSERT INTO bookmark (user_id, content_id)
            VALUES ($1, $2)
            ON CONFLICT (user_id, content_id) DO NOTHING
            RETURNING *`,
            [userId, contentId]
        );
        
        return insertResult.rows[0] || { user_id: userId, content_id: contentId };
    });
    
    return result || null;
};

// Remove a bookmark for a user
const removeBookmark = async (userId, contentId) => {
    const result = await withTransaction(async (client) => {
        const deleteResult = await client.query(
            `DELETE FROM bookmark
            WHERE user_id = $1 AND content_id = $2
            RETURNING *`,
            [userId, contentId]
        );
        
        return deleteResult.rows[0] || null;
    });
    
    return result || null;
};

// Check if a specific bookmark exists
const checkBookmark = async (userId, contentId) => {
    const query = `
        SELECT 1 FROM bookmark
        WHERE user_id = $1 AND content_id = $2
    `;
    
    try {
        const result = await pool.query(query, [userId, contentId]);
        return result.rowCount > 0;
    } catch (error) {
        throw error;
    }
};

// Get a user's bookmarked questions with pagination
const getUserBookmarks = async (userId, limit, offset, bypassFreeze = false) => {
    // Bypass freeze filter if requested
    const freezeFilter = bypassFreeze ? '' : 'AND c.is_frozen = FALSE';
    
    const query = `
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
            b.created_at as "bookmarkedAt",
            jsonb_build_object(
                'authorId', c.author_id,
                'username', u.username,
                'firstName', p.first_name,
                'lastName', p.last_name,
                'profilePicture', p.profile_picture
            ) as "author",
            (
                SELECT
                    ARRAY_AGG(jsonb_build_object(
                              'tag_id', t.tag_id,
                              'name', t.name
                              )) AS "tags"
                FROM question_tag qt
                JOIN tag t ON qt.tag_id = t.tag_id
                WHERE qt.question_id = q.content_id
                GROUP BY qt.question_id
            )
        FROM bookmark b
        JOIN content c ON b.content_id = c.content_id
        JOIN question q ON c.content_id = q.content_id
        LEFT JOIN profile p ON c.author_id = p.user_id
        LEFT JOIN "user" u ON c.author_id = u.user_id
        WHERE b.user_id = $1
        ${freezeFilter}
        ORDER BY b.created_at DESC
        LIMIT $2 OFFSET $3
    `;

    // Count total bookmarks for pagination
    const countQuery = `
        SELECT COUNT(*)
        FROM bookmark b
        JOIN content c ON b.content_id = c.content_id
        JOIN question q ON c.content_id = q.content_id
        WHERE b.user_id = $1
        ${freezeFilter}
    `;

    try {
        const result = await pool.query(query, [userId, limit, offset]);
        const total = await pool.query(countQuery, [userId]);

        const totalQuestions = parseInt(total.rows[0].count, 10);
        const totalPages = Math.ceil(totalQuestions / limit);
        const currentPage = Math.floor(offset / limit) + 1;

        return {
            questions: result.rows,
            totalQuestions,
            totalPages,
            currentPage,
        };
    } catch (error) {
        throw error;
    }
};

export default {
    addBookmark,
    removeBookmark,
    checkBookmark,
    getUserBookmarks
};
