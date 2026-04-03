import Dashboard from '../models/dashboardModel.js';
import { sendErrorResponse } from '../utils/error.js';

// Get stats of the user for dashboard
export const getDashboardStats = async (req, res) => {
    const userId = req.userId;
    try {
        const stats = await Dashboard.getUserStats(userId);
        if (!stats) return sendErrorResponse(res, 404, 'User not found.');
        
        return res.status(200).json({
            data: { stats },
            message: 'Dashboard stats retrieved successfully.'
        });
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error(error);
        return sendErrorResponse(res, 500, 'Internal Server Error');
    }
};

// Get user feed
export const getDashboardFeed = async (req, res) => {
    const userId = req.userId;
    let { page, limit } = req.query;
    
    if (isNaN(page) || page <= 0) page = 1;
    if (isNaN(limit) || limit <= 0) limit = 15;
    
    const limitValue = parseInt(limit, 10) || 15;
    const offset     = (page - 1) * limitValue;
    
    try {
        const data = await Dashboard.getFeedQuestions({ userId, limit: limitValue, offset });
        return res.status(200).json({
            data,
            message: 'Dashboard feed retrieved successfully.'
        });
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error(error);
        return sendErrorResponse(res, 500, 'Internal Server Error');
    }
};