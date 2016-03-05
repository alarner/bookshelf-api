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
// let knex = require('knex')({
// 	client: 'pg',
// 	useNullAsDefault: true,
// 	connection: {
// 		host: 'localhost',
// 		user: 'alarner',
// 		database: 'test'
// 	},
// 	seeds: {
// 		directory: './test/seeds'
// 	}
// });
global.bookshelf = require('bookshelf')(knex);
bookshelf.plugin('registry');
