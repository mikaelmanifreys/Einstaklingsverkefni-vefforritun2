const { Pool } = require('pg');

const isRender = process.env.DATABASE_URL.includes('render.com');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isRender
    ? {
        rejectUnauthorized: false,
      }
    : false,
});

module.exports = pool;