const { Pool } = require("pg");

module.exports = new Pool({
    host: "localhost", // or wherever the db is hosted
    user: "<role_name>",
    database: "top_users",
    password: "<role_password>",
    port: 5432 // The default port
});
