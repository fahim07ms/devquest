import { withTransaction } from "../db/client.js";
import pool from "../db/pool.js";

// Get bounty for a specific bounty id
const getBountyById = async (bountyId) => {
    const query = `
        SELECT
            b.bounty_id as id,
            b.question_id as "questionId",
            b.amount,
            b.offered_by as "offeredBy",
            b.awarded_answer_id as "awardedAnswerId",
            b.status as "status",
            b.expires_at as "expiresAt",
            b.reason,
            b.created_at as "createdAt",
            b.awarded_at as "awardedAt"
        FROM bounty b
        WHERE b.bounty_id = $1
    `;
    const result = await pool.query(
        query,
        [bountyId]
    );
    
    return result.rows[0] || null;
}

// Create a new bounty on a question
const createBounty = async (questionId, offeredBy, amount, reason) => {
    const result = await pool.query(
        `CALL create_bounty($1, $2, $3, $4, NULL)`,
        [questionId, amount, offeredBy, reason]
    );
    
    const bountyId = result.rows[0]['p_bounty_id'];
    if (!bountyId) return null;
    return getBountyById(bountyId);
};

// Award a bounty to an answer
const awardBounty = async (bountyId, answerId, awardedBy) => {
    const result = await pool.query(
        `CALL award_bounty($1, $2, $3, NULL)`,
        [bountyId, answerId, awardedBy]
    );
    
    const awardedBountyId = result.rows[0]['p_awarded_bounty_id'];

    if (!awardedBountyId) return null;
    return getBountyById(awardedBountyId);
};

export default {
    createBounty,
    awardBounty
};
