import pool from '../db/pool.js';
import {withTransaction} from "../db/client.js";

const getUserByUsername = async (username) => {
    const query = `
        SELECT
            user_id as id,
            username,
            email,
            role,
            password_hash as "passwordHash",
            is_active as "isActive",
            reputation_points as "reputationPoints",
            badge_count as "badgeCount"
        FROM "user"
        WHERE username = $1
    `;
    
    const result = await pool.query(
        query,
        [username]
    );

    return result.rows[0] || null;
}

const getUserByEmail = async (email) => {
    const result = await pool.query(
        'SELECT * FROM "user" WHERE email = $1',
        [email]
    );
    
    return result.rows[0] || null;
}

const getUserById = async (id) => {
    const query = `
        SELECT
            u.user_id as id,
            username,
            email,
            role,
            password_hash as "passwordHash",
            is_active as "isActive",
            reputation_points as "reputationPoints",
            badge_count as "badgeCount",
            p.first_name as "firstName",
            p.last_name as "lastName",
            p.bio as bio,
            p.profile_picture as "profilePicture"
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

const registerUser = async (username, email, passwordHash) => {
    try {
        const result = await withTransaction(async (client) => {
            // Create the user
            const userResult = await client.query(
                `INSERT INTO "user" (username, email, password_hash)
                VALUES ($1, $2, $3)
                RETURNING user_id as id, username, email, role`,
                [username, email, passwordHash]
            );
            
            // Create a profile for the user
            await client.query(
                'INSERT INTO profile (user_id) VALUES ($1)',
                [userResult.rows[0]["id"]]
            );
            
            return userResult;
        });
        
        return result.rows[0] || null;
        
    } catch (error) {
        throw error;
    }
}

export default {
    getUserById,
    getUserByUsername,
    getUserByEmail,
    registerUser
}