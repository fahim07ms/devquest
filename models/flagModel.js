import pool from '../db/pool.js';
import { withTransaction } from '../db/client.js';

// Shared select columns
const FLAG_SELECT = `
    f.flag_id as id,
    f.content_id as "contentId",
    f.reason,
    f.flag_category as "flagCategory",
    f.status,
    f.moderator_note as "moderatorNote",
    f.suggested_duplicate_id as "suggestedDuplicateId",
    f.created_at as "createdAt",
    f.updated_at as "updatedAt",
    jsonb_build_object(
        'userId',   reporter.user_id,
        'username', reporter.username
    ) AS "reporter",
    CASE
        WHEN f.moderator_id IS NULL THEN NULL
        ELSE jsonb_build_object(
            'userId',   moderator.user_id,
            'username', moderator.username
        )
    END AS "moderator"
`;

// Create a flag
const createFlag = async (userId, { contentId, reason, flagCategory, suggestedDuplicateId }) => {
    const result = await withTransaction(async (client) => {
        // Prevent a user from flagging the same content twice
        const existing = await client.query(
            `SELECT flag_id FROM flag WHERE user_id = $1 AND content_id = $2`,
            [userId, contentId]
        );
        
        if (existing.rowCount > 0) {
            throw new Error('ALREADY_FLAGGED');
        }
        
        const flagResult = await client.query(
            `INSERT INTO flag
                (user_id, content_id, reason, flag_category, suggested_duplicate_id)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING flag_id`,
            [userId, contentId, reason, flagCategory, suggestedDuplicateId ?? null]
        );
        
        return flagResult.rows[0];
    });
    
    if (!result) return null;
    return getFlagById(result.flag_id);
};

// Get single flag by ID
const getFlagById = async (flagId) => {
    const query = `
        SELECT ${FLAG_SELECT},
        c.content_type as "contentType"
        FROM flag f
        LEFT JOIN content c ON c.content_id = f.content_id
        LEFT JOIN "user" reporter  ON f.user_id      = reporter.user_id
        LEFT JOIN "user" moderator ON f.moderator_id = moderator.user_id
        WHERE f.flag_id = $1
    `;
    
    const result = await pool.query(query, [flagId]);
    return result.rows[0] || null;
};

// Get all flags (moderator view) with optional status filter
const getAllFlags = async ({ status, limit, offset }) => {
    let paramCount = 1;
    const params   = [];
    let whereClause = '';
    
    if (status) {
        whereClause = `WHERE f.status = $${paramCount}`;
        params.push(status);
        paramCount++;
    }
    
    const query = `
        SELECT ${FLAG_SELECT},
        c.content_type as "contentType"
        FROM flag f
        LEFT JOIN content c ON c.content_id = f.content_id
        LEFT JOIN "user" reporter  ON f.user_id      = reporter.user_id
        LEFT JOIN "user" moderator ON f.moderator_id = moderator.user_id
        ${whereClause}
        ORDER BY f.created_at DESC
        LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;
    
    params.push(limit, offset);
    
    const [flagsResult, countResult] = await Promise.all([
        pool.query(query, params),
        pool.query(
            `SELECT COUNT(*) FROM flag f ${whereClause}`,
            status ? [status] : []
        ),
    ]);
    
    return {
        flags:      flagsResult.rows,
        totalFlags: parseInt(countResult.rows[0].count, 10),
    };
};

// Get all flags on a specific piece of content
const getFlagsByContentId = async (contentId) => {
    const query = `
        SELECT ${FLAG_SELECT}
        FROM flag f
        LEFT JOIN "user" reporter  ON f.user_id      = reporter.user_id
        LEFT JOIN "user" moderator ON f.moderator_id = moderator.user_id
        WHERE f.content_id = $1
        ORDER BY f.created_at DESC
    `;
    
    const result = await pool.query(query, [contentId]);
    return result.rows;
};

// Moderator reviews a flag (updates status + optional note)
const reviewFlag = async (flagId, moderatorId, { status, moderatorNote }) => {
    const result = await withTransaction(async (client) => {
        const updateResult = await client.query(
            `UPDATE flag
             SET
                status         = $1,
                moderator_id   = $2,
                moderator_note = $3
             WHERE flag_id = $4
             RETURNING flag_id`,
            [status, moderatorId, moderatorNote ?? null, flagId]
        );
        
        if (updateResult.rowCount === 0) {
            throw new Error('NOT_FOUND');
        }
        
        return updateResult.rows[0];
    });
    
    if (!result) return null;
    return getFlagById(result.flag_id);
};

// Delete a flag
const deleteFlag = async (flagId) => {
    const result = await withTransaction(async (client) => {
        const deleteResult = await client.query(
            `DELETE FROM flag WHERE flag_id = $1 RETURNING flag_id AS id`,
            [flagId]
        );
        
        if (deleteResult.rowCount === 0) {
            throw new Error('NOT_FOUND');
        }
        
        return deleteResult.rows[0];
    });
    
    return result || null;
};

export default {
    createFlag,
    getFlagById,
    getAllFlags,
    getFlagsByContentId,
    reviewFlag,
    deleteFlag,
};