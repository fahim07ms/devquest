import pool from '../db/pool.js';
import { withTransaction } from '../db/client.js';

const getCommentsByParentId = async (parentId) => {
    const query = `
        SELECT
            cm.parent_id,
            cm.content_id,
            cm.depth_level,
            c.body,
            c.vote_score,
            c.author_id,
            c.created_at,
            c.updated_at,
            p.first_name,
            p.last_name,
            p.profile_picture
        FROM comment cm
        JOIN content c ON cm.content_id = c.content_id
        JOIN profile p ON c.author_id = p.user_id
        WHERE cm.parent_id = $1
        ORDER BY c.created_at
    `;
    const result = await pool.query(
        query,
        [parentId]
    );
    
    return result.rows;
};

const getCommentById = async (commentId) => {
    const query = `
        SELECT
            cm.*,
            c.body,
            c.author_id,
            c.vote_score,
            c.created_at,
            c.updated_at,
            p.first_name,
            p.last_name,
            p.profile_picture
        FROM comment cm
        JOIN content c ON cm.content_id = c.content_id
        JOIN profile p ON c.author_id = p.user_id
        WHERE cm.content_id = $1
    `;
    const result = await pool.query(
        query,
        [commentId]
    );
    
    return result.rows[0] || null;
};

const createComment = async (parentId, userId, body) => {
    const result = await withTransaction(async (client) => {
        // Determine depth_level based on the parent_id
        const parentCheck = await client.query(
            `SELECT depth_level FROM comment WHERE content_id = $1`,
            [parentId]
        );
        
        const depthLevel = parentCheck.rowCount > 0
            ? parentCheck.rows[0]['depth_level'] + 1
            : 0;
        
        const content = await client.query(
            `INSERT INTO content (content_type, author_id, body)
            VALUES ('comment', $1, $2) RETURNING *`,
            [userId, body]
        );
        
        const commentResult = await client.query(
            `INSERT INTO comment (parent_id, content_id, depth_level)
            VALUES ($1, $2, $3) RETURNING *`,
            [parentId, content.rows[0]["content_id"], depthLevel]
        );
        
        return {
            id: commentResult.rows[0]["content_id"],
            parentId: commentResult.rows[0]["parent_id"],
            depthLevel: commentResult.rows[0]["depth_level"],
            authorId: content.rows[0]["author_id"],
            body: content.rows[0]["body"],
            voteScore: content.rows[0]["vote_score"],
            createdAt: content.rows[0]["created_at"],
            updatedAt: content.rows[0]["updated_at"],
        };
    });
    
    return result || null;
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
    
    return result || null;
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
        
        if (check.rows[0].author_id !== userId) {
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