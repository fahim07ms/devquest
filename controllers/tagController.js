import Tag from '../models/tagModel.js';

const getTags = async (req, res) => {
    const tags = await Tag.getAllTags();
    return res.status(200).json(tags);
}

export default {
    getTags
};