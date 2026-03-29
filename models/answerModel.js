import pool from '../db/pool.js';
import { withTransaction } from '../db/client.js';

const getAnswersByQuestionId = async (questionId, bypassFreeze = false) => {
    const freezeFilter = bypassFreeze ? '' : 'AND c.is_frozen = FALSE';
    
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
        JOIN profile p ON c.author_id = p.user_id
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

const getAnswerById = async (answerId, bypassFreeze = false) => {
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

const createAnswer = async (userId, questionId, body) => {
    const result = await withTransaction(async (client) => {
        const content = await client.query(
            `INSERT INTO content (content_type, author_id, body)
            VALUES ('answer', $1, $2) RETURNING *`,
            [userId, body]
        );
        
        const answerResult = await client.query(
            `INSERT INTO answer (question_id, content_id)
            VALUES ($1, $2) RETURNING *`,
            [questionId, content.rows[0]["content_id"]]
        );
        
        await client.query(
            `UPDATE question SET answer_count = answer_count + 1, last_activity_at = NOW() WHERE content_id = $1`,
            [questionId]
        );
        
        return answerResult.rows[0];
    });
    
    if (!result) return null;
    return getAnswerById(result["content_id"]);
};

const updateAnswer = async (answerId, body, authorId) => {
    const result = await withTransaction(async (client) => {
        const updateContent = await client.query(
            `UPDATE content
            SET body = $1
            WHERE content_id = $2 AND author_id = $3
            RETURNING content_id, body, created_at, updated_at, author_id, vote_score`,
            [body, answerId, authorId]
        );
        
        if (updateContent.rowCount === 0) {
            throw new Error('UNAUTHORIZED_OR_NOT_FOUND');
        }
        
        // Update last_activity_at on the parent question
        await client.query(
            `UPDATE question
            SET last_activity_at = NOW()
            WHERE content_id = (SELECT question_id FROM answer WHERE content_id = $1)`,
            [answerId]
        );
        
        return updateContent.rows[0]
            ;
    });
    
    if (!result) return null;
    return getAnswerById(result["content_id"]);
};

const deleteAnswer = async (answerId, userId) => {
    const result = await withTransaction(async (client) => {
        const check = await client.query(
            `SELECT c.author_id, a.question_id FROM content c
            JOIN answer a ON a.content_id = c.content_id
            WHERE c.content_id = $1`,
            [answerId]
        );
        
        if (check.rowCount === 0) {
            throw new Error('NOT_FOUND');
        }
        
        if (check.rows[0].author_id !== userId) {
            throw new Error('UNAUTHORIZED');
        }
        
        const questionId = check.rows[0].question_id;
        
        await client.query(
            `DELETE FROM content WHERE content_id = $1`,
            [answerId]
        );
        
        await client.query(
            `UPDATE question
            SET answer_count = GREATEST(answer_count - 1, 0), last_activity_at = NOW()
            WHERE content_id = $1`,
            [questionId]
        );
        
        return { id: answerId };
    });
    
    return result || null;
};

const updateAnswerStatus = async (answerId, isAccepted, acceptedAt) => {
    const result = await withTransaction(async (client) => {
        const updateAnswer = await client.query(
            `UPDATE answer
            SET is_accepted = $1, accepted_at = $2
            WHERE content_id = $3
            RETURNING content_id, is_accepted, accepted_at`,
            [isAccepted, acceptedAt, answerId]
        );
        
        if (updateAnswer.rowCount === 0) {
            throw new Error('NOT_FOUND');
        }
        
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