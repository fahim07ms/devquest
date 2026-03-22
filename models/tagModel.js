import pool from '../db/pool.js';

const getAllTags = async () => {
    let tags = await pool.query('SELECT tag_id, name FROM tag');
    return tags.rows;
}

const getDetailedTags = async ({ offset, limit, search }) => {
    let tags = await pool.query(`
        SELECT t.tag_id,
            t.name,
            t.description,
            COUNT(question_id) as "questionCount"
        FROM tag t
        LEFT JOIN question_tag qt ON qt.tag_id = t.tag_id
        WHERE LOWER(t.name) ILIKE LOWER('%' || $1 || '%')
        GROUP BY t.tag_id, name, description
        ORDER BY t.name
        LIMIT $2 OFFSET $3
    `, [search, limit, offset]);
    
    let totalTags = await pool.query('SELECT COUNT(*) FROM tag WHERE LOWER(name) ILIKE LOWER($1) ', ['%' + search + '%']);
    let tagsCount = totalTags.rows[0].count;
    let totalPages = Math.ceil(tagsCount / limit);
    let currentPage = Math.floor(offset / limit) + 1;
    
    return {
        tags: tags.rows,
        totalTags: tagsCount,
        totalPages: totalPages,
        currentPage: currentPage
    }
}

export default {
    getAllTags,
    getDetailedTags
};