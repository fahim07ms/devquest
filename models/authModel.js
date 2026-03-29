import pool from '../db/pool.js';
import {withTransaction} from "../db/client.js";

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
    registerUser
}