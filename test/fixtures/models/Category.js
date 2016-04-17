module.exports = bookshelf.model('Category', {
	tableName: 'categories',
	hasTimestamps: ['createdAt', 'updatedAt', 'deletedAt']
});