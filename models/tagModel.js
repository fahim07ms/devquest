import pool from '../db/pool.js';

const getAllTags = async () => {
    let client = await pool.connect();
    let tags = await client.query('SELECT * FROM tag');
    return tags.rows;
}

export default {
    getAllTags
};