import notificationModel from '../models/notificationModel.js';
import { sendErrorResponse } from '../utils/error.js';

// Get notifications for a user
export const getNotifications = async (req, res) => {
    try {
        const userId = req.userId;
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;
        const offset = (page - 1) * limit;

        const data = await notificationModel.getNotifications(userId, limit, offset);

        res.status(200).json({
            data: data,
            message: 'Notifications fetched successfully.'
        });
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error(error);
        sendErrorResponse(res, 500, 'Internal Server Error');
    }
};

// Mark a notification as read
export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const success = await notificationModel.markAsRead(id, userId);

        if (!success) {
            return sendErrorResponse(res, 404, 'Notification not found or unauthorized.');
        }

        res.status(200).json({ message: 'Notification marked as read.' });
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error(error);
        sendErrorResponse(res, 500, 'Internal Server Error');
    }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
    try {
        const userId = req.userId;
        const count = await notificationModel.markAllAsRead(userId);

        res.status(200).json({ 
            data: { count },
            message: 'All notifications marked as read.' 
        });
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error(error);
        sendErrorResponse(res, 500, 'Internal Server Error');
    }
};
