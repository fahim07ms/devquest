const Tag = require('../models/tagModel');

const getTags = async (req, res) => {
    const tags = await Tag.getAllTags();
    return res.status(200).json(tags);
}

module.exports = {
    getTags
}