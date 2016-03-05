module.exports = bookshelf.model('Product', {
	tableName: 'products',
	hasTimestamps: ['createdAt', 'updatedAt']
});