var refs = (t, col) => t.integer(col).unsigned().notNullable()
  .references('id').inTable(col);

var unique = (t, col) => { t.string(col).notNullable(); t.unique(col); };

exports.up = async knex => {
  await knex.schema.createTable('organization', t => {
    t.increments();
    unique(t, 'name');
  });
  await knex.schema.createTable('author', t => {
    t.increments();
    unique(t, 'name');
    refs(t, 'organization');
  });
  await knex.schema.createTable('post', t => {
    t.increments();
    unique(t, 'title');
    refs(t, 'author');
  });
  await knex.schema.createTable('comment', t => {
    t.increments();
    t.string('text');
    refs(t, 'post');
  });
};

exports.down = async knex => {
  await knex.schema.dropTable('comment');
  await knex.schema.dropTable('post');
  await knex.schema.dropTable('author');
  await knex.schema.dropTable('organization');
};
