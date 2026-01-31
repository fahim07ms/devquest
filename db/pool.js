const { Pool } = require("pg");
const { dotenv } = require("dotenv");

dotenv.config();

module.exports = new Pool({
    host: process.env.DB_USER,
    user: process.env.DB_USER,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT || 5432,
});
