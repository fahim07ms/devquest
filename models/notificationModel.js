import pool from "../db/pool.js";

const getNotifications = async (userId, limit = 20, offset = 0) => {
    // Get notifications for a specific user with actor info (if any)
    const query = `
        SELECT
            n.notification_id as "id",
            n.notification_type as "type",
            n.related_entity_id as "entityId",
            n.is_read as "isRead",
            n.action_url as "actionUrl",
            n.created_at as "createdAt",
            CASE WHEN n.actor_user_id IS NOT NULL THEN
                jsonb_build_object(
                    'id', u.user_id,
                    'username', u.username,
                    'profilePicture', p.profile_picture
                )
            ELSE NULL END as "actor"
        FROM notification n
        LEFT JOIN "user" u ON n.actor_user_id = u.user_id
        LEFT JOIN profile p ON u.user_id = p.user_id
        WHERE n.recipient_user_id = $1
        ORDER BY n.created_at DESC
        LIMIT $2 OFFSET $3
    `;

    // Count total notifications and unread notifications
    const countQuery = `SELECT COUNT(*) FROM notification WHERE recipient_user_id = $1`;
    const unreadCountQuery = `SELECT COUNT(*) FROM notification WHERE recipient_user_id = $1 AND is_read = false`;

    try {
        const result = await pool.query(query, [userId, limit, offset]);
        const totalResult = await pool.query(countQuery, [userId]);
        const unreadResult = await pool.query(unreadCountQuery, [userId]);

        const total = parseInt(totalResult.rows[0].count, 10);
        const unreadCount = parseInt(unreadResult.rows[0].count, 10);
        
        return {
            notifications: result.rows,
            total,
            unreadCount,
            hasMore: offset + limit < total
        };
    } catch (error) {
        throw error;
    }
};

// Mark a specific notification as read
const markAsRead = async (notificationId, userId) => {
    const query = `
        UPDATE notification 
        SET is_read = true 
        WHERE notification_id = $1 AND recipient_user_id = $2
        RETURNING *
    `;
    const result = await pool.query(query, [notificationId, userId]);
    return result.rowCount > 0;
};

// Mark all notifications as read for a specific user
const markAllAsRead = async (userId) => {
    const query = `
        UPDATE notification 
        SET is_read = true 
        WHERE recipient_user_id = $1 AND is_read = false
    `;
    const result = await pool.query(query, [userId]);
    return result.rowCount;
};

export default {
    getNotifications,
    markAsRead,
    markAllAsRead
};
