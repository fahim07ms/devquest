import { withTransaction } from "../db/client.js";
import pool from "../db/pool.js";

const getCommentsByParentId = async (parentId, bypassFreeze = false) => {
    const freezeFilter = bypassFreeze ? '' : 'AND c.is_frozen = FALSE';
    
    const query = `
        SELECT
            cm.parent_id as "parentId",
            cm.content_id as "id",
            c.body,
            c.vote_score as "voteScore",
            c.is_frozen as "isFrozen",
            c.author_id as "authorId",
            c.created_at as "createdAt",
            c.updated_at as "updatedAt",
            jsonb_build_object(
                'authorId', c.author_id,
                'username', u.username,
                'firstName', p.first_name,
                'lastName', p.last_name,
                'profilePicture', p.profile_picture
            ) as "author",
            jsonb_build_object(
                'recipientId', r.user_id,
                'recipientUsername', r.username
            ) as "recipient"
        FROM comment cm
        JOIN content c ON cm.content_id = c.content_id
        LEFT JOIN profile p ON c.author_id = p.user_id
        LEFT JOIN "user" u ON c.author_id = u.user_id
        LEFT JOIN "user" r ON cm.recipient_id = r.user_id
        WHERE cm.parent_id = $1 ${freezeFilter}
        ORDER BY c.created_at
    `;
    const result = await pool.query(
        query,
        [parentId]
    );
    
    return result.rows;
};

const getCommentById = async (commentId, bypassFreeze = false) => {
    const freezeFilter = bypassFreeze ? '' : 'AND c.is_frozen = FALSE';
    
    const query = `
        SELECT
            cm.content_id as "id",
            cm.parent_id as "parentId",
            c.body,
            c.vote_score as "voteScore",
            c.is_frozen as "isFrozen",
            c.created_at as "createdAt",
            c.updated_at as "updatedAt",
            jsonb_build_object(
                'authorId', c.author_id,
                'username', u.username,
                'firstName', p.first_name,
                'lastName', p.last_name,
                'profilePicture', p.profile_picture
            ) as "author",
            jsonb_build_object(
                'recipientId', r.user_id,
                'recipientUsername', r.username
            ) as "recipient"
        FROM comment cm
        JOIN content c ON cm.content_id = c.content_id
        LEFT JOIN profile p ON c.author_id = p.user_id
        LEFT JOIN "user" u ON c.author_id = u.user_id
        LEFT JOIN "user" r ON cm.recipient_id = r.user_id
        WHERE cm.content_id = $1 ${freezeFilter}
    `;
    const result = await pool.query(
        query,
        [commentId]
    );
    
    if (result.rowCount === 0) return null;
    
    const nestedComments = await getCommentsByParentId(commentId);
    
    return {
        ...result.rows[0],
        nestedComments,
    };
};

const createComment = async (userId, parentId, recipientId, body) => {
    const result = await withTransaction(async (client) => {
        const content = await client.query(
            `INSERT INTO content (content_type, author_id, body)
            VALUES ('comment', $1, $2) RETURNING *`,
            [userId, body]
        );
        
        const commentResult = await client.query(
            `INSERT INTO comment (parent_id, content_id, recipient_id)
            VALUES ($1, $2, $3) RETURNING *`,
            [parentId, content.rows[0]["content_id"], recipientId]
        );
        
        return commentResult.rows[0];
    });
    
    if (!result) return null;
    return getCommentById(result["content_id"]);
}

const updateComment = async (commentId, body, authorId) => {
    const result = await withTransaction(async (client) => {
        const updateContent = await client.query(
            `UPDATE content
            SET body = $1, updated_at = NOW()
            WHERE content_id = $2 AND author_id = $3
            RETURNING content_id, body, created_at, updated_at, author_id, vote_score`,
            [body, commentId, authorId]
        );
        
        if (updateContent.rowCount === 0) {
            throw new Error('UNAUTHORIZED_OR_NOT_FOUND');
        }
        
        return updateContent.rows[0];
    });
    
    if (!result) return null;
    return getCommentById(result["content_id"]);
};

const deleteComment = async (commentId, userId) => {
    const result = await withTransaction(async (client) => {
        const check = await client.query(
            `SELECT c.author_id FROM content c WHERE c.content_id = $1`,
            [commentId]
        );
        
        if (check.rowCount === 0) {
            throw new Error('NOT_FOUND');
        }
        
        if (check.rows[0]['author_id'] !== userId) {
            throw new Error('UNAUTHORIZED');
        }
        
        await client.query(
            `DELETE FROM content WHERE content_id = $1`,
            [commentId]
        );
        
        return { id: commentId };
    });
    
    return result || null;
};

export default {
    getCommentsByParentId,
    getCommentById,
    createComment,
    updateComment,
    deleteComment,
};