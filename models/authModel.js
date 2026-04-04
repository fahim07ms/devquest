import pool from '../db/pool.js';
import {withTransaction} from "../db/client.js";

const registerUser = async (username, email, passwordHash) => {
    await pool.query(
        `CALL register_user($1, $2, $3)`,
        [username, email, passwordHash]
    );
    
    return true;
}

export default {
    registerUser
}