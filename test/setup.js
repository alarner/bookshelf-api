let knex = require('knex')({
	client: 'sqlite3',
	useNullAsDefault: true,
	connection: {
		filename: './test/test.db'
	}
});
global.bookshelf = require('bookshelf')(knex);
bookshelf.plugin('registry');
