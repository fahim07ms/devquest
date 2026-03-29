import {withTransaction} from "../db/client.js";
import pool from "../db/pool.js";

const getUserById = async (id) => {
    
    const query = `
        SELECT
            u.user_id as id,
            username,
            email,
            role,
            is_active as "isActive",
            reputation_points as "reputationPoints",
            badge_count as "badgeCount",
            p.first_name as "firstName",
            p.last_name as "lastName",
            p.bio as bio,
            p.profile_picture as "profilePicture",
            p.website as "website",
            p.birth_date as "birthDate",
            u.created_at as "createdAt"
        FROM "user" u
        JOIN profile p ON u.user_id = p.user_id
        WHERE u.user_id = $1
    `;
    
    const result = await pool.query(
        query,
        [id]
    );

    return result.rows[0] || null;
}

const getUserByUsername = async (username) => {
    const query = `
        SELECT
            u.user_id as id,
            username,
            role,
            reputation_points as "reputationPoints",
            badge_count as "badgeCount",
            password_hash as "passwordHash",
            p.first_name as "firstName",
            p.last_name as "lastName",
            p.bio as bio,
            p.profile_picture as "profilePicture",
            p.website as "website",
            p.birth_date as "birthDate",
            u.created_at as "createdAt"
        FROM "user" u
        JOIN profile p ON u.user_id = p.user_id
        WHERE username = $1
    `;
    
    const result = await pool.query(
        query,
        [username]
    );
    
    return result.rows[0] || null;
}

const updateUserProfileData = async (userId, { firstName, lastName, birthDate, bio, website }) => {
    const query = `
        UPDATE profile p
        SET first_name = $1, last_name = $2, birth_date = $3, bio = $4, website = $5
        WHERE p.user_id = $6
        RETURNING
            first_name as "firstName",
            last_name as "lastName",
            birth_date as "birthDate",
            profile_picture as "profilePicture",
            bio as "bio",
            website as "website"
    `;
    
    const result = await withTransaction(async (client) => {
        const updateResult = await client.query(
            query,
            [firstName, lastName, birthDate, bio, website, userId]
        );
        
        if (updateResult.rowCount === 0) {
            throw new Error('NOT_FOUND');
        }
        
        return updateResult.rows[0];
    });
    
    return result || null;
}

const updateUserProfilePicture = async (userId, profilePicture) => {
    const query = `
        UPDATE profile p
        SET profile_picture = $1
        WHERE p.user_id = $2
        RETURNING
            first_name as "firstName",
            last_name as "lastName",
            birth_date as "birthDate",
            profile_picture as "profilePicture",
            bio as "bio",
            website as "website"
    `;
    
    const result = await withTransaction(async (client) => {
        const updateResult = await client.query(
            query,
            [profilePicture, userId]
        );
        
        if (updateResult.rowCount === 0) {
            throw new Error('NOT_FOUND');
        }
        
        return updateResult.rows[0];
    })
    
    return result || null;
}

const getQuestionsByUsername = async (username) => {
    const query = `
        SELECT
            q.content_id as id,
            q.title,
            c.vote_score as "voteScore",
            c.created_at as "createdAt",
            c.updated_at as "updatedAt",
            q.answer_count as "answerCount",
            q.view_count as "viewCount",
            q.last_activity_at as "lastActivityAt",
            q.is_answered as "isAnswered",
            (
                SELECT ARRAY_AGG(jsonb_build_object('tag_id', t.tag_id, 'name', t.name))
                FROM question_tag qt
                JOIN tag t ON qt.tag_id = t.tag_id
                WHERE qt.question_id = q.content_id
            ) AS tags
        FROM question q
            JOIN content c ON c.content_id = q.content_id
            JOIN "user" u ON u.user_id = c.author_id
        WHERE u.username = $1
        ORDER BY c.created_at DESC
    `;
    
    try {
        const result = await pool.query(query, [username]);
        return result.rows;
    } catch (error) {
        console.error('Error fetching questions:', error);
        throw error;
    }
}

const getAnswersByUsername = async (username) => {
    const query = `
        SELECT
            a.content_id  as id,
            a.question_id as "questionId",
            q.title as "questionTitle",
            c.vote_score as "voteScore",
            c.created_at as "createdAt",
            c.updated_at as "updatedAt",
            a.is_accepted as "isAccepted"
        FROM answer a
                 JOIN content c ON c.content_id = a.content_id
                 JOIN question q ON q.content_id = a.question_id
                 JOIN "user" u ON u.user_id = c.author_id
        WHERE u.username = $1
        ORDER BY c.created_at DESC
    `;
    
    try {
        const result = await pool.query(query, [username]);
        return result.rows;
    } catch (error) {
        console.error('Error fetching answers:', error);
        throw error;
    }
}

export default {
    getUserById,
    getUserByUsername,
    updateUserProfileData,
    getQuestionsByUsername,
    getAnswersByUsername,
    updateUserProfilePicture
};