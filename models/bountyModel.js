import { withTransaction } from "../db/client.js";
import pool from "../db/pool.js";

// Create a new bounty on a question
const createBounty = async (questionId, offeredBy, amount, reason) => {
    const result = await withTransaction(async (client) => {
        // Verify a user has enough reputations
        const userRes = await client.query(
            `SELECT reputation_points FROM "user" WHERE user_id = $1`,
            [offeredBy]
        );
        if (userRes.rowCount === 0) throw new Error("USER_NOT_FOUND");
        
        const currentRep = userRes.rows[0].reputation_points;
        if (currentRep < amount) {
            throw new Error("INSUFFICIENT_REPUTATION");
        }
        
        // Insert into bounty
        const bountyRes = await client.query(
            `INSERT INTO bounty (question_id, offered_by, amount, reason, expires_at)
             VALUES ($1, $2, $3, $4, NOW() + INTERVAL '7 days')
             RETURNING *`,
            [questionId, offeredBy, amount, reason]
        );
        
        const bounty = bountyRes.rows[0];

        // Record the reputation history
        await client.query(
            `INSERT INTO reputation_history (user_id, change_amount, reason, related_entity_type, related_entity_id)
             VALUES ($1, $2, 'BOUNTY_OFFERED', 'bounty', $3)`,
            [offeredBy, -amount, bounty.bounty_id]
        );

        return bounty;
    });

    return result || null;
};

// Award a bounty to an answer
const awardBounty = async (bountyId, answerId, awardedBy) => {
    const result = await withTransaction(async (client) => {
        // Get bounty details
        const bountyRes = await client.query(
            `SELECT * FROM bounty WHERE bounty_id = $1 FOR UPDATE`,
            [bountyId]
        );
        if (bountyRes.rowCount === 0) throw new Error("NOT_FOUND");
        const bounty = bountyRes.rows[0];

        // Validate bounty state and permissions
        if (bounty.status !== 'active') throw new Error("BOUNTY_NOT_ACTIVE");

        // Get the answer author
        const ansRes = await client.query(
            `SELECT c.author_id 
             FROM answer a
             JOIN content c ON a.content_id = c.content_id
             WHERE a.content_id = $1 AND a.question_id = $2`,
            [answerId, bounty.question_id]
        );
        if (ansRes.rowCount === 0) throw new Error("ANSWER_NOT_FOUND");
        const answerAuthorId = ansRes.rows[0].author_id;
        
        // Update bounty status
        const updatedBounty = await client.query(
            `UPDATE bounty 
             SET status = 'awarded', awarded_answer_id = $1, awarded_at = NOW()
             WHERE bounty_id = $2
             RETURNING *`,
            [answerId, bountyId]
        );

        // Grant reputation to the answer's author (if they exist)
        if (answerAuthorId) {
            // Record reputation history for the recipient
            await client.query(
                `INSERT INTO reputation_history (user_id, change_amount, reason, related_entity_type, related_entity_id)
                 VALUES ($1, $2, 'BOUNTY_AWARDED', 'bounty', $3)`,
                [answerAuthorId, bounty.amount, bountyId]
            );
        }

        return updatedBounty.rows[0];
    });

    return result || null;
};

export default {
    createBounty,
    awardBounty
};
