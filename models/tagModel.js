import pool from '../db/pool.js';
import {withTransaction} from "../db/client.js";

// Get all tags
const getAllTags = async () => {
    let tags = await pool.query('SELECT tag_id, name FROM tag');
    return tags.rows;
}

// Get tags with pagination and search
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

// Get all tags followed by a specific user
const getFollowedTags = async (userId) => {
    const result = await pool.query(
        `SELECT
            t.tag_id,
            t.name,
            t.description,
            COUNT(qt.question_id) as "questionCount",
            utf.followed_at as "followedAt"
        FROM user_tag_follow utf
        JOIN tag t ON utf.tag_id = t.tag_id
        LEFT JOIN question_tag qt ON qt.tag_id = t.tag_id
        WHERE utf.user_id = $1
        GROUP BY t.tag_id, t.name, t.description, utf.followed_at
        ORDER BY utf.followed_at DESC`,
        [userId]
    );
    return result.rows;
};

// Get just the tag IDs a user follows
const getFollowedTagIds = async (userId) => {
    const result = await pool.query(
        `SELECT tag_id FROM user_tag_follow WHERE user_id = $1`,
        [userId]
    );
    return result.rows.map(r => r.tag_id);
};

// Follow a tag
const followTag = async (userId, tagId) => {
    // Verify the tag exists first
    const tagCheck = await pool.query(`SELECT tag_id FROM tag WHERE tag_id = $1`, [tagId]);
    if (tagCheck.rowCount === 0) throw new Error('TAG_NOT_FOUND');
    
    await withTransaction(async (client) => {
        await client.query(
            `INSERT INTO user_tag_follow (user_id, tag_id)
            VALUES ($1, $2)
            ON CONFLICT (user_id, tag_id) DO NOTHING`,
            [userId, tagId]
        );
    })
};

// Unfollow a tag
const unfollowTag = async (userId, tagId) => {
    await withTransaction(async (client) => {
        await client.query(
            `DELETE FROM user_tag_follow WHERE user_id = $1 AND tag_id = $2`,
            [userId, tagId]
        );
    });
};

export default {
    getAllTags,
    getDetailedTags,
    getFollowedTags,
    getFollowedTagIds,
    followTag,
    unfollowTag
};