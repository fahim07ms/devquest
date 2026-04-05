import { withTransaction } from "../db/client.js";
import pool from "../db/pool.js";

// Get comments for a specific parent comment
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

// Get a specific comment by its ID
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

// Create a new comment under a specific parent comment
const createComment = async (userId, parentId, recipientId, body, parentType) => {
    const result = await pool.query(
        `CALL create_comment($1, $2, $3, $4, $5, NULL)`,
        [parentId, recipientId, body, userId, parentType]
    );
    
    const commentId = result.rows[0]['p_comment_id'];
    if (!commentId) return null;
    return getCommentById(commentId);
}

// Update an existing comment
const updateComment = async (commentId, body, authorId) => {
    const result = await pool.query(
        `CALL update_comment($1, $2, $3, NULL)`,
        [commentId, body, authorId]
    );
    
    const updatedCommentId = result.rows[0]['p_updated_comment'];
    if (!updatedCommentId) return null;
    return getCommentById(updatedCommentId);
};

// Delete a comment
const deleteComment = async (commentId, userId) => {
    const result = await pool.query(
        `CALL delete_comment($1, $2, NULL)`,
        [commentId, userId]
    );
    
    return result.rows[0]['p_deleted_comment'] || null;
};

export default {
    getCommentsByParentId,
    getCommentById,
    createComment,
    updateComment,
    deleteComment,
};