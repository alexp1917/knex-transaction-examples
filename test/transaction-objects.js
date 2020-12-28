var { expect } = require('chai');
var { testDb } = require('./testingUtils');

// await knex.schema.createTable('comment');
// await knex.schema.createTable('post');
// await knex.schema.createTable('author');
// await knex.schema.createTable('organization');

describe('transaction objects', () => {
  describe('to: behaviour examples', () => {
    [0, 1].forEach(i => {
      it('to: be: should run and ' + (i ? 'commit' : 'rollback'), async () => {
        var db = await testDb();
        // db.on('query', (obj) => console.log(obj));

        var transaction;
        var executed = new Array(10).fill(false);
        var exePointer = 0;

        try {
          transaction = await db.transaction();
          var [ orgId ] = await transaction('organization').insert({ name: 'someorg' });
          executed[exePointer++] = true;
          var [ authorId ] = await transaction('author').insert({ name: 'someauthor', organization: orgId });
          executed[exePointer++] = true;
          var [ postId ] = await transaction('post').insert({ title: 'somepost', author: authorId + i });
          executed[exePointer++] = true;
          var [ commentId ] = await transaction('comment').insert({ text: 'somecomment', post: postId });
          executed[exePointer++] = true;
          await transaction.commit();
        } catch (e) {
          // console.error(e);
          await transaction.rollback();
        }

        // show contents
        // require('child_process').execSync('sqlite3 dev.sqlite3 .dump', {
        //   stdio: 'inherit', cwd: require('path').join(__dirname, '..')
        // });

        var organizationQuery = await db('organization').select();
        var authorQuery = await db('author').select();
        var postQuery = await db('post').select();
        var commentQuery = await db('comment').select();

        await db.migrate.down();
        await db.destroy();


        var [
          organizationDidExecute,
          authorDidExecute,
          postDidExecute,
          commentDidExecute,
        ] = executed;

        // expect(organizationDidExecute).to.be.ok;
        // expect(authorDidExecute).to.be.ok;
        // expect(postDidExecute).to.not.be.ok;
        // expect(commentDidExecute).to.not.be.ok;

        // 1 - i is just the opposite (add 0 = dont mess up foriegn key = have length 1)
        expect(organizationQuery).to.have.length(1 - i);
        expect(authorQuery).to.have.length(1 - i);
        expect(postQuery).to.have.length(1 - i);
        expect(commentQuery).to.have.length(1 - i);
      });
    });
  });
});