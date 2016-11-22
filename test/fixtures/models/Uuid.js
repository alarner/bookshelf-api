module.exports = bookshelf.model('Uuid', {
    tableName: 'uuids',
    hasTimestamps: ['createdAt', 'updatedAt', 'deletedAt']
});