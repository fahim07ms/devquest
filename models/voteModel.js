import pool from "../db/pool.js";
import { withTransaction } from "../db/client.js";

const vote = async (contentId, userId, voteType) => {
    const query = `
        INSERT INTO vote (content_id, user_id, vote_type)
        VALUES ($1, $2, $3) RETURNING
            vote_id as id,
            content_id as "contentId",
            user_id as "userId",
            vote_type as "voteType"
    `;
    
    const result = await withTransaction(async (client) => {
        const voteResult = await client.query(
            query,
            [contentId, userId, voteType]
        );
        
        return voteResult.rows[0];
    });
    
    return result || null;
}

const getVoteForContent = async (contentId) => {
    const query = `
        SELECT
            v.vote_id as id,
            v.content_id as "contentId",
            v.user_id as "userId",
            v.vote_type as "voteType",
            v.created_at as "createdAt"
        FROM vote v
        WHERE v.content_id = $1
    `;
    
    const result = await pool.query(
        query,
        [contentId]
    );
    
    return result.rows;
}

const updateVote = async (voteId, voteType) => {
    const query = `
        UPDATE vote
        SET vote_type = $1
        WHERE vote_id = $2
        RETURNING
            vote_id as id,
            content_id as "contentId",
            user_id as "userId",
            vote_type as "voteType"
    `;
    
    const result = await withTransaction(async (client) => {
        const voteResult = await client.query(
            query,
            [voteType, voteId]
        );
        
        if (voteResult.rowCount === 0) {
            throw new Error('NOT_FOUND');
        }
        
        return voteResult.rows[0];
    })
    
    return result || null;
};

const deleteVote = async (voteId, userId) => {
    const query = `
        DELETE FROM vote
        WHERE vote_id = $1 AND user_id = $2
        RETURNING vote_id as id
    `;
    
    const result = await withTransaction(async (client) => {
        const voteResult = await client.query(
            query,
            [voteId, userId]
        );
        
        if (voteResult.rowCount === 0) {
            throw new Error('NOT_FOUND');
        }
        
        return voteResult.rows[0];
    })
    
    return result || null;
}

// Get user's vote for a content
const getUserVoteForContent = async (contentId, userId) => {
    const query = `
        SELECT
            v.vote_id as id,
            v.content_id as "contentId",
            v.user_id as "userId",
            v.vote_type as "voteType",
            v.created_at as "createdAt"
        FROM vote v
        WHERE v.content_id = $1 AND v.user_id = $2
    `;
    
    const result = await pool.query(
        query,
        [contentId, userId]
    );
    
    return result.rows[0] || null;
}

export default {
    vote,
    getVoteForContent,
    updateVote,
    deleteVote,
    getUserVoteForContent
};