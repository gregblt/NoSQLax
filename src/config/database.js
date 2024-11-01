const nano = require("nano");

const dbUrl = process.env.COUCHDB_URL || "http://localhost:5984";
const dbName = process.env.COUCHDB_NAME || "my_database";

const nanoInstance = nano(dbUrl);
const db = nanoInstance.db.use(dbName);

module.exports = db;
