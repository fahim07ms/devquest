import Tag from '../models/tagModel.js';

const getTags = async (req, res) => {
    try {
        const tags = await Tag.getAllTags();
        return res.status(200).json({
            data: {
                tags: tags
            },
            message: "Tags retrieved successfully."
        });
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.log(error);
        return res.status(500).json({
            message: "Internal server error."
        });
    }
}

const getDetailedTags = async (req, res) => {
    let { page, limit, search } = req.query;
    
    if (isNaN(page) || page <= 0) {
        page = 1;
    }
    
    if (isNaN(limit) || limit <= 0) {
        limit = 10;
    }
    
    const limitValue = parseInt(limit, 10) || 10;
    const offset = (page - 1) * limitValue;
    const searchValue = search || '';
    const { tags, currentPage, totalPages, totalTags } = await Tag.getDetailedTags({
        offset,
        limit: limitValue,
        search: searchValue,
    });
    return res.status(200).json({
        data: {
            tags,
            currentPage,
            totalPages,
            totalTags,
        },
        message: "Tags retrieved successfully."
    });
}

export default {
    getTags,
    getDetailedTags,
};