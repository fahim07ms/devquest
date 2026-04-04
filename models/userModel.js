import {withTransaction} from "../db/client.js";
import pool from "../db/pool.js";

// Get a user by his user id
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

// Get a user by his username(public data)
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

// Update user profile data
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

// Update user profile picture
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

// Get user-asked questions
const getQuestionsByUsername = async (username) => {
    const query = `
        SELECT
            q.content_id as id,
            q.title,
            c.vote_score as "voteScore",
            c.created_at as "createdAt",
            c.updated_at as "updatedAt",
            q.answer_count as "answersCount",
            q.view_count as "viewCount",
            q.last_activity_at as "lastActivityAt",
            q.is_answered as "isAnswered",
            (
                SELECT ARRAY_AGG(jsonb_build_object('tag_id', t.tag_id, 'name', t.name))
                FROM question_tag qt
                JOIN tag t ON qt.tag_id = t.tag_id
                WHERE qt.question_id = q.content_id
            ) as tags
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

// Get user-answered answers
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

// Get user badges
const getUserBadges = async (username) => {
    const query = `
        SELECT
            ba.award_id as "badgeId",
            b.name,
            b.description,
            b.badge_tier as "tier",
            b.criteria_type as "criteriaType",
            b.criteria_threshold as "criteriaThreshold",
            b.icon_url as "iconUrl",
            ba.awarded_at as "awardedAt"
        FROM badge_award ba
        JOIN badge b ON ba.badge_id = b.badge_id
        JOIN "user" U ON ba.user_id  = u.user_id
        WHERE u.username = $1
        ORDER BY ba.awarded_at DESC
    `;
    
    try {
        const result = await pool.query(query, [username]);
        
        return result.rows;
    } catch (error) {
        console.error('Error fetching user badges:', error);
        throw error;
    }
}

// Get user reputation history
const getUserReputationHistory = async (userId, limit, offset) => {
    const query = `
    SELECT
        history_id as "historyId",
        change_amount as "changeAmount",
        reason,
        related_entity_type as "relatedEntityType",
        related_entity_id as "relatedEntityId",
        created_at as "createdAt"
    FROM reputation_history
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT $2 OFFSET $3
    `;
    
    try {
        const result = await pool.query(query, [userId, limit, offset]);
        
        const countRes = await pool.query(
            `SELECT COUNT(*) FROM reputation_history WHERE user_id = $1`,
            [userId]
        );
        
        const total = parseInt(countRes.rows[0].count, 10);
        
        const hasMore = offset + limit < total;
        
        return {
            history: result.rows,
            total,
            hasMore
        };
    } catch (error) {
        console.error('Error fetching reputation history:', error);
        throw error;
    }
}

export default {
    getUserById,
    getUserByUsername,
    updateUserProfileData,
    getQuestionsByUsername,
    getAnswersByUsername,
    updateUserProfilePicture,
    getUserBadges,
    getUserReputationHistory,
};