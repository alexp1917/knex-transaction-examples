var knex = require('knex');

var knexfile = require('../knexfile');
async function testDb() {
  var env = process.env['NODE_ENV'] || 'development';
  var db = knex(knexfile[env]);
  await db.migrate.latest();
  if (/sqlite/.test(knex.client.config.client)) {
    await db.raw('PRAGMA foreign_keys = ON;');
  }

  return db;
}

module.exports = {
  testDb,
};
