const pool = require('../db/pool');

const getAllTags = async () => {
    let client = await pool.connect();
    let tags = await client.query('SELECT * FROM tag');
    return tags.rows;
}


module.exports = {
    getAllTags
};