import { withTransaction } from "../db/client.js";
import pool from "../db/pool.js";

// Get all questions with pagination, sorting, filtering and search
const getQuestions = async (limit, offset, sortBy, sortOrder, filters, search) => {
    try {
        // TODO: Implement tag filters
        
        const query = `
            SELECT
                c.content_id as "id",
                q.title,
                c.body,
                q.view_count as "viewCount",
                q.answer_count as "answersCount",
                q.last_activity_at as "lastActivityAt",
                c.vote_score as "voteScore",
                c.created_at as "createdAt",
                c.updated_at as "updatedAt",
                jsonb_build_object(
                    'firstName', p.first_name,
                    'lastName', p.last_name,
                    'profilePicture', p.profile_picture
                ) as "author",
                COALESCE(
                    jsonb_agg(
                        jsonb_build_object('id', t.tag_id, 'name', t.name)
                    ) FILTER (WHERE t.tag_id IS NOT NULL),
                    '[]'::jsonb
                ) as "tags"
            FROM question q
            JOIN content c ON q.content_id = c.content_id
            JOIN profile p ON c.author_id = p.user_id
            LEFT JOIN question_tag qt ON qt.question_id = q.content_id
            LEFT JOIN tag t ON t.tag_id = qt.tag_id
            WHERE LOWER(q.title) LIKE LOWER('%' || $1 || '%')
            GROUP BY c.content_id, q.content_id, p.user_id
            ORDER BY ${sortBy} ${sortOrder}
            LIMIT $2 OFFSET $3
        `;
        
        const result = await pool.query(
            query,
            [search, limit, offset]
        );
        
        return result.rows;
        
    } catch (error) {
        throw error;
    }
}

const getQuestionById = async (id) => {
    const query = `
        SELECT
            q.*,
            c.body,
            c.author_id,
            c.created_at,
            c.updated_at,
            p.first_name,
            p.last_name,
            p.profile_picture
        FROM question q
            LEFT JOIN content c ON q.content_id = c.content_id
            LEFT JOIN profile p ON c.author_id = p.user_id
        WHERE q.content_id = $1
    `;
    
    const result = await pool.query(
        query,
        [id]
    );
    
    return result.rows[0] || null;
}

const createQuestion = async (userId, title, body, tags) => {
    const result = await withTransaction(async (client) => {
        const content = await client.query(
            `INSERT INTO content (content_type, author_id, body)
            VALUES ('question', $1, $2) RETURNING *`,
            [userId, body]
        );
        
        const qnResult = await client.query(
            `INSERT INTO question (content_id, title)
            VALUES ($1, $2) RETURNING *`,
            [content.rows[0]["content_id"], title]
        );
        
        // TODO: ADD TAGS
        
        return {
            id: qnResult.rows[0]["content_id"],
            authorId: content.rows[0]["author_id"],
            title: qnResult.rows[0]["title"],
            body: content.rows[0]["body"],
            voteScore: content.rows[0]["vote_score"],
            createdAt: content.rows[0]["created_at"],
            updatedAt: content.rows[0]["updated_at"],
            viewCount: qnResult.rows[0]["view_count"],
            answersCount: qnResult.rows[0]["answers_count"],
            lastActivityAt: qnResult.rows[0]["last_activity_at"],
        }
    });
    
    return result || null;
}

const updateQuestion = async (questionId, title, body, tags, authorId) => {
    const result = await withTransaction(async (client) => {
        const updateContent = await client.query(
            `UPDATE content
            SET body = $1
            WHERE content_id = $2 AND author_id = $3
            RETURNING content_id, body, created_at, updated_at, author_id, vote_score`,
            [body, questionId, authorId]
        );
        
        if (updateContent.rowCount === 0) {
            throw new Error('UNAUTHORIZED_OR_NOT_FOUND');
        }
        
        const updateQuestion = await client.query(
            `UPDATE question
            SET title = $1, last_activity_at = NOW()
            WHERE content_id = $2
            RETURNING view_count, answer_count, last_activity_at, title`,
            [title, questionId]
        )
        
        return {
            ...updateContent.rows[0],
            ...updateQuestion.rows[0],
        }
    })
    
    return result || null;
};

// Delete question
const deleteQuestion = async (questionId, userId) => {
    const result = await withTransaction(async (client) => {
        // Check ownership of the question
        const check = await client.query(
            `SELECT c.author_id FROM content c WHERE c.content_id = $1`,
            [questionId]
        );
        
        if (check.rows.length === 0) throw new Error('NOT_FOUND');
        if (check.rows[0]['author_id'] !== userId) throw new Error('UNAUTHORIZED');
        
        const deleted = await client.query(
            `DELETE FROM content WHERE content_id = $1 RETURNING content_id`,
            [questionId]
        );
        
        return deleted.rows[0] || null;
    });
    
    return result || null;
}

export default {
    getQuestions,
    getQuestionById,
    createQuestion,
    updateQuestion,
    deleteQuestion,
}