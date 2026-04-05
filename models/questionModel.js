import { withTransaction } from "../db/client.js";
import pool from "../db/pool.js";

// Valid sort columns whitelist
const SORT_COLUMNS = {
    'c.created_at':        true,
    'q.answer_count':      true,
    'q.last_activity_at':  true,
    'c.vote_score':        true,
};

// Get all questions with pagination, sorting, filtering and search
const getQuestions = async (limit, offset, sortBy, sortOrder, tags, search, answered, hasBounty, bypassFreeze = false) => {
    // Validate sort column against whitelist to prevent SQL injection
    const safeSort  = SORT_COLUMNS[sortBy] ? sortBy : 'c.created_at';
    const safeOrder = sortOrder === 'ASC' ? 'ASC' : 'DESC';
    
    // Moderators bypass the freeze filter to see frozen content in listings
    const freezeFilter = bypassFreeze ? '' : 'AND c.is_frozen = FALSE';
    
    // Initial query
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
            get_active_bounty(q.content_id) as "activeBounty",
            jsonb_build_object(
                    'authorId',      c.author_id,
                    'username',      u.username,
                    'firstName',     p.first_name,
                    'lastName',      p.last_name,
                    'profilePicture', p.profile_picture
            ) as "author",
            get_question_tags(q.content_id) AS "tags"
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
    
    let params     = [search];
    let paramCount = 2;
    
    // Tag filter
    const hasTags = tags && tags.length > 0;
    if (hasTags) {
        const tagPlaceholders = tags.map((_, i) => `$${i + paramCount}`).join(', ');
        const tagClause = ` AND q.content_id IN (
            SELECT question_id FROM question_tag WHERE tag_id IN (${tagPlaceholders})
        )`;
        initQuery           += tagClause;
        totalQuestionsQuery += tagClause;
        params               = params.concat(tags);
        paramCount          += tags.length;
    }
    
    // Answered filter
    if (answered === 'true' || answered === 'false') {
        const answeredBool = answered === 'true';
        initQuery           += ` AND q.is_answered = $${paramCount}`;
        totalQuestionsQuery += ` AND q.is_answered = $${paramCount}`;
        params.push(answeredBool);
        paramCount++;
    }
    
    // Bounty filter
    if (hasBounty === 'true' || hasBounty === 'false') {
        const bountyClause = hasBounty === 'true'
            ? ` AND EXISTS (SELECT 1 FROM bounty b WHERE b.question_id = q.content_id AND b.status = 'active')`
            : ` AND NOT EXISTS (SELECT 1 FROM bounty b WHERE b.question_id = q.content_id AND b.status = 'active')`;
        initQuery           += bountyClause;
        totalQuestionsQuery += bountyClause;
    }
    
    // Sort + pagination
    initQuery += ` ORDER BY ${safeSort} ${safeOrder} LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);
    
    try {
        const [result, allQuestions] = await Promise.all([
            pool.query(initQuery, params),
            pool.query(totalQuestionsQuery, params.slice(0, paramCount - 1)),
        ]);
        
        const totalQuestions = parseInt(allQuestions.rows[0].count, 10);
        const totalPages     = Math.ceil(totalQuestions / limit);
        const currentPage    = Math.floor(offset / limit) + 1;
        
        return { questions: result.rows, totalQuestions, totalPages, currentPage };
    } catch (error) {
        throw error;
    }
};

// Get question by ID — returns null if not found or frozen (unless bypassed)
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
            -- Bounty
            (
                SELECT jsonb_build_object(
                               'id',        b.bounty_id,
                               'amount',    b.amount,
                               'expiresAt', b.expires_at
                       )
                FROM bounty b
                WHERE b.question_id = q.content_id AND b.status = 'active'
                LIMIT 1
            ) as "activeBounty",
            -- Author
            jsonb_build_object(
                    'authorId',      c.author_id,
                    'username',      u.username,
                    'firstName',     p.first_name,
                    'lastName',      p.last_name,
                    'profilePicture', p.profile_picture
            ) as "author",
            q.is_answered AS "isAnswered"
        FROM question q
                 LEFT JOIN content c ON q.content_id = c.content_id
                 LEFT JOIN profile p ON c.author_id = p.user_id
                 LEFT JOIN "user" u ON c.author_id = u.user_id
        WHERE q.content_id = $1 ${freezeFilter}
    `;
    
    const result = await withTransaction(async (client) => {
        const question = await client.query(query, [id]);
        if (question.rowCount === 0) return null;
        
        // Find out the tags related to the question
        const tags = await client.query(
            `SELECT t.tag_id, t.name FROM question_tag qt
                JOIN tag t ON qt.tag_id = t.tag_id
            WHERE qt.question_id = $1`,
            [id]
        );
        
        return { ...question.rows[0], tags: tags.rows };
    });
    
    return result;
};

// Create a new question
const createQuestion = async (userId, title, body, tags) => {
    const tagIds = tags.map(tag => tag['tag_id']);
    
    const result = await pool.query(
        `CALL create_question($1, $2, $3, $4, NULL)`,
        [title, body, userId, tagIds]
    );
    
    const questionId = result.rows[0]['p_question_id'];
    
    return await getQuestionById(questionId);
};

// Update question body, title and tags
const updateQuestion = async (questionId, title, body, tags, authorId) => {
   const result = await pool.query(
       `CALL update_question($1, $2, $3, $4, NULL)`,
       [questionId, title, body, authorId]
   );
   
   if (!result.rows[0]['p_updated_question']) return null;
   return await getQuestionById(questionId);
};

// Delete question
const deleteQuestion = async (questionId, userId) => {
    const result = await pool.query(
        `CALL delete_question($1, $2, NULL)`,
        [questionId, userId]
    );
    
    return result.rows[0]['p_deleted_question'] || null;
};

// Increment view count
const updateViewCount = async (questionId) => {
    await pool.query(
        `UPDATE question SET view_count = view_count + 1 WHERE content_id = $1`,
        [questionId]
    );
};

export default {
    getQuestions,
    getQuestionById,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    updateViewCount,
};