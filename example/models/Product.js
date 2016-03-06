var bookshelf = require('bookshelf')(knex);
var Product = bookshelf.Model.extend({
	tableName: 'products',
	hasTimestamps: ['createdAt', 'updatedAt', 'deletedAt']
});

module.exports = Product;