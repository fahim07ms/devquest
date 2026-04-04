import pool from '../db/pool.js';
import { withTransaction } from '../db/client.js';

// Get answers for a specific question
const getAnswersByQuestionId = async (questionId, bypassFreeze = false) => {
    // Frozen answers are not included in the results unless bypassFreeze is true
    const freezeFilter = bypassFreeze ? '' : 'AND c.is_frozen = FALSE';
    
    // Query to get answers for a specific question
    const query = `
        SELECT
            a.content_id as id,
            a.is_accepted as "isAccepted",
            a.accepted_at as "acceptedAt",
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
            ) as "author"
        FROM answer a
        JOIN content c ON a.content_id = c.content_id
        LEFT JOIN profile p ON c.author_id = p.user_id
        LEFT JOIN "user" u ON c.author_id = u.user_id
        WHERE a.question_id = $1 ${freezeFilter}
        ORDER BY
            a.is_accepted DESC,
            c.vote_score DESC,
            c.created_at
    `;
    
    const result = await pool.query(
        query,
        [questionId]
    );
    
    return result.rows;
};

// Get a specific answer by its ID
const getAnswerById = async (answerId, bypassFreeze = false) => {
    // Frozen answers are not included in the results unless bypassFreeze is true
    const freezeFilter = bypassFreeze ? '' : 'AND c.is_frozen = FALSE';
    
    const query = `
        SELECT
            a.content_id as id,
            a.question_id as "questionId",
            a.is_accepted as "isAccepted",
            a.accepted_at as "acceptedAt",
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
            ) as "author"
        FROM answer a
        JOIN content c ON a.content_id = c.content_id
        LEFT JOIN profile p ON c.author_id = p.user_id
        LEFT JOIN "user" u ON c.author_id = u.user_id
        WHERE a.content_id = $1 ${freezeFilter}
    `;
    const result = await pool.query(
        query,
        [answerId]
    );
    
    return result.rows[0] || null;
}

// Create a new answer for a specific question
const createAnswer = async (userId, questionId, body) => {
    const result = await pool.query(
        `CALL create_answer($1, $2, $3, NULL)`,
        [questionId, body, userId]
    );
    
    const answerId = result.rows[0]['p_answer_id'];
    
    if (!answerId) return null;
    return getAnswerById(answerId);
};

// Update an existing answer
const updateAnswer = async (answerId, body, authorId) => {
    const result = await pool.query(
        `CALL update_answer($1, $2, $3, NULL)`,
        [answerId, body, authorId]
    );
    
    if (!result.rows[0]['p_updated_answer']) return null;
    return getAnswerById(answerId);
};

// Delete an answer
const deleteAnswer = async (answerId, userId) => {
    const result = await pool.query(
        `CALL delete_answer($1, $2, NULL)`,
        [answerId, userId]
    );
    
    return result.rows[0]['p_deleted_answer'] || null;
};

// Update the status of an answer (accepted/rejected)
const updateAnswerStatus = async (answerId, isAccepted, acceptedAt) => {
    const result = await withTransaction(async (client) => {
        // Update the answer status
        const updateAnswer = await client.query(
            `UPDATE answer
            SET is_accepted = $1, accepted_at = $2
            WHERE content_id = $3
            RETURNING content_id, is_accepted, accepted_at, question_id`,
            [isAccepted, acceptedAt, answerId]
        );
        
        if (updateAnswer.rowCount === 0) {
            throw new Error('NOT_FOUND');
        }
        
        // Update the question's is_answered status
        await client.query(
            `UPDATE question
            SET is_answered = $1
            WHERE content_id = $2`,
            [isAccepted, updateAnswer.rows[0]['question_id']]
        );
        
        return updateAnswer.rows[0];
    })
    
    if (!result) return null;
    return getAnswerById(result["content_id"]);
}

export default {
    getAnswersByQuestionId,
    getAnswerById,
    createAnswer,
    updateAnswer,
    deleteAnswer,
    updateAnswerStatus,
};