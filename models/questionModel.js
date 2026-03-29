import {withTransaction} from "../db/client.js";
import pool from "../db/pool.js";

// Get all questions with pagination, sorting, filtering and search
// Probable filters: tags, creation date, last activity date, unanswered, highest score
const getQuestions = async (limit, offset, sortBy, sortOrder, tags, search, answered, bypassFreeze = false) => {
    // Initialize query with basic columns and joins
    
    // Moderators can bypass the freeze filter to view frozen content in listings
    const freezeFilter = bypassFreeze ? '' : 'AND c.is_frozen = FALSE';
    
    let initQuery = `
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
                c.is_frozen as "isFrozen",
                jsonb_build_object(
                    'authorId', c.author_id,
                    'username', u.username,
                    'firstName', p.first_name,
                    'lastName', p.last_name,
                    'profilePicture', p.profile_picture
                ) as "author",
                (
                    SELECT
                        ARRAY_AGG(jsonb_build_object(
                                  'tag_id', t.tag_id,
                                  'name', t.name
                                  )) AS "tags"
                    FROM question_tag qt
                    JOIN tag t ON qt.tag_id = t.tag_id
                    WHERE qt.question_id = q.content_id
                    GROUP BY qt.question_id
                )
            FROM question q
            JOIN content c ON q.content_id = c.content_id
            LEFT JOIN profile p ON c.author_id = p.user_id
            LEFT JOIN "user" u ON c.author_id = u.user_id
            WHERE q.title ILIKE ('%' || $1 || '%')
            ${freezeFilter}
        `;
    
    let totalQuestionsQuery = `
        SELECT COUNT(*) FROM question q
        JOIN content c ON q.content_id = c.content_id
        WHERE q.title ILIKE ('%' || $1 || '%')
        ${freezeFilter}
    `;
    let params = [search];
    let paramCount = 2;
    
    // Add tags filter if provided
    const hasTags = tags && tags.length > 0
    
    if (hasTags) {
        const tagPlaceholders = tags.map((_, i) => `$${i + paramCount}`).join(', ')
        
        const tagClause = `AND q.content_id IN (
            SELECT question_id FROM question_tag WHERE tag_id IN (${tagPlaceholders})
        )`;
        paramCount += tags.length;
        initQuery += tagClause;
        totalQuestionsQuery += tagClause;
        params = params.concat(tags);
    }
    
    // Add answered filter if provided
    if (answered !== undefined)
    {
        initQuery += `AND q.is_answered = $${paramCount}`;
        totalQuestionsQuery += `AND q.is_answered = $${paramCount}`;
        params.push(answered);
        paramCount++;
    }
    
    // Add sorting and pagination
    initQuery += ` ORDER BY ${sortBy} ${sortOrder} LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit);
    params.push(offset);
    try {
        // Execute the query with the provided parameters
        const result = await pool.query(
            initQuery,
            params
        );
        
        // Fetch total questions count
        const allQuestions = await pool.query(
            totalQuestionsQuery,
            params.slice(0, paramCount - 1)
        );
        const totalQuestions = allQuestions.rows[0].count;
        const totalPages = Math.ceil(totalQuestions / limit);
        const currentPage = Math.floor(offset / limit) + 1;
        
        return {
            questions: result.rows,
            totalQuestions,
            totalPages,
            currentPage,
        }
        
    } catch (error) {
        throw error;
    }
}

// Get question by ID — returns null if the question doesn't exist or has been frozen
const getQuestionById = async (id, bypassFreeze = false) => {
    const freezeFilter = bypassFreeze ? '' : 'AND c.is_frozen = FALSE';
    
    const query = `
        SELECT
            q.content_id as "id",
            q.title,
            c.body,
            q.view_count as "viewCount",
            q.answer_count as "answersCount",
            q.last_activity_at as "lastActivityAt",
            c.vote_score as "voteScore",
            c.created_at as "createdAt",
            c.updated_at as "updatedAt",
            c.is_frozen as "isFrozen",
            jsonb_build_object(
                'authorId', c.author_id,
                'username', u.username,
                'firstName', p.first_name,
                'lastName', p.last_name,
                'profilePicture', p.profile_picture
            ) as "author",
            q.is_answered as "isAnswered"
        FROM question q
            LEFT JOIN content c ON q.content_id = c.content_id
            LEFT JOIN profile p ON c.author_id = p.user_id
            LEFT JOIN "user" u ON c.author_id = u.user_id
        WHERE q.content_id = $1 ${freezeFilter}
    `;
    
    const result = await withTransaction(async (client) => {
        const question = await client.query(
            query,
            [id]
        );
        
        if (question.rowCount === 0) return null;
        
        const tags = await client.query(
            `
            SELECT t.tag_id, t.name FROM question_tag qt
            JOIN tag t ON qt.tag_id = t.tag_id
            WHERE qt.question_id = $1
        `,
            [id]
        );
        
        return {
            ...question.rows[0],
            tags: tags.rows,
        }
    })
    
    return result;
}

// Create a new question with tags
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
        
        for (const tag of tags) {
            await client.query(
                `INSERT INTO question_tag (question_id, tag_id)
                VALUES ($1, $2)`,
                [qnResult.rows[0]["content_id"], tag["tag_id"]]
            )
        }
        
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
            tags: tags
        }
    });
    
    return result || null;
}

// Update question
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
    
    if (!result) return null;
    return getQuestionById(result["content_id"]);
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

// Update view count
const updateViewCount = async (questionId) => {
    await pool.query(
        `UPDATE question
        SET view_count = view_count + 1
        WHERE content_id = $1`,
        [questionId]
    );
}

export default {
    getQuestions,
    getQuestionById,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    updateViewCount,
}