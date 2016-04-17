require('./Category');
module.exports = bookshelf.model('Product', {
	tableName: 'products',
	hasTimestamps: ['createdAt', 'updatedAt', 'deletedAt'],
	category: function() {
		return this.belongsTo('Category', 'categoryId');
	}
});