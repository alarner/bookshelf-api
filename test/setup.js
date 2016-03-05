let knex = require('knex')({
	client: 'sqlite3',
	useNullAsDefault: true,
	connection: {
		filename: './test/test.sqlite3'
	},
	seeds: {
		directory: './test/seeds'
	}
});
global.bookshelf = require('bookshelf')(knex);
bookshelf.plugin('registry');
