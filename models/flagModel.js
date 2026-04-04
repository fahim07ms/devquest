import pool from '../db/pool.js';
import { withTransaction } from '../db/client.js';

// Shared select columns used across all flag queries.
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
    c.is_frozen as "isFrozen",
    -- Resolve the parent question ID regardless of content type so the
    -- frontend can build the correct deep-link every time.
    CASE
        WHEN c.content_type = 'question' THEN f.content_id
        WHEN c.content_type = 'answer'   THEN ans.question_id
        WHEN c.content_type = 'comment'  THEN COALESCE(cm_ans.question_id, cm.parent_id)
    END AS "questionId",
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

// The FROM + JOIN block that every flag SELECT reuses.
const FLAG_JOINS = `
    FROM flag f
    LEFT JOIN content c         ON c.content_id     = f.content_id
    LEFT JOIN answer  ans       ON ans.content_id   = f.content_id
    LEFT JOIN comment cm        ON cm.content_id    = f.content_id
    LEFT JOIN answer  cm_ans    ON cm_ans.content_id = cm.parent_id
    LEFT JOIN "user" reporter   ON f.user_id        = reporter.user_id
    LEFT JOIN "user" moderator  ON f.moderator_id   = moderator.user_id
`;

// Get a single flag by ID
const getFlagById = async (flagId) => {
    const query = `
        SELECT ${FLAG_SELECT},
        c.content_type as "contentType"
        ${FLAG_JOINS}
        WHERE f.flag_id = $1
    `;
    
    const result = await pool.query(query, [flagId]);
    return result.rows[0] || null;
};

// Get all flags (moderator view) with optional status and category filters
const getAllFlags = async ({ status, category, limit, offset }) => {
    let paramCount = 1;
    const params   = [];
    const conditions = [];
    
    // Status and category filters are optional, so only add them to the query if they're provided
    if (status) {
        conditions.push(`f.status = $${paramCount++}`);
        params.push(status);
    }
    
    if (category) {
        conditions.push(`f.flag_category = $${paramCount++}`);
        params.push(category);
    }
    
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    const query = `
        SELECT ${FLAG_SELECT},
        c.content_type as "contentType"
        ${FLAG_JOINS}
        ${whereClause}
        ORDER BY f.created_at DESC
        LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;
    
    params.push(limit, offset);
    
    // Build count params without limit/offset
    const countParams = conditions.length > 0 ? params.slice(0, -2) : [];
    
    const [flagsResult, countResult] = await Promise.all([
        pool.query(query, params),
        pool.query(`SELECT COUNT(*) FROM flag f ${whereClause}`, countParams),
    ]);
    
    return {
        flags:      flagsResult.rows,
        totalFlags: parseInt(countResult.rows[0].count, 10),
    };
};

// Create a flag
const createFlag = async (userId, { contentId, reason, flagCategory, suggestedDuplicateId }) => {
    const result = await pool.query(
        `CALL create_flag($1, $2, $3, $4, $5, NULL)`,
        [userId, contentId, reason, flagCategory, suggestedDuplicateId ?? null]
    );
    
    const flagId = result.rows[0]['p_flag_id'];
    
    if (!flagId) return null;
    return getFlagById(flagId);
};

// Get all flags on a specific piece of content
const getFlagsByContentId = async (contentId) => {
    const query = `
        SELECT ${FLAG_SELECT}
        ${FLAG_JOINS}
        WHERE f.content_id = $1
        ORDER BY f.created_at DESC
    `;
    
    const result = await pool.query(query, [contentId]);
    return result.rows;
};

// Moderator reviews a flag: updates status and optional note.
// When status is 'action_taken', the flagged content is frozen, so it is no
// longer accessible to regular users.
const reviewFlag = async (flagId, moderatorId, { status, moderatorNote }) => {
    const result = await pool.query(
        `CALL review_flag($1, $2, $3, $4, NULL)`,
        [flagId, moderatorId, status, moderatorNote ?? null]
    );
    
    const updatedFlagId = result.rows[0]['p_updated_flag'];
    
    if (!updatedFlagId) return null;
    return getFlagById(updatedFlagId);
};

// Explicitly unfreeze a piece of content (moderator action)
const unfreezeContent = async (contentId) => {
    const result = await withTransaction(async (client) => {
        return await client.query(
            `UPDATE content SET is_frozen = FALSE WHERE content_id = $1 RETURNING content_id`,
            [contentId]
        );
    })
    return result.rows[0] || null;
};

// Delete a flag (does NOT unfreeze the content)
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
    unfreezeContent,
    deleteFlag,
};