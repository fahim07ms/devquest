import pool from '../db/pool.js';

const getContentById = async (id) => {
    const query = `
        SELECT
            c.content_id as id,
            c.content_type as "contentType",
            c.body,
            c.vote_score as "voteScore",
            c.created_at as "createdAt",
            c.updated_at as "updatedAt",
            c.author_id as "authorId"
        FROM content c
        WHERE c.content_id = $1
    `;
    const result = await pool.query(
        query,
        [id]
    );
    
    return result.rows[0] || null;
}

export default {
    getContentById
};