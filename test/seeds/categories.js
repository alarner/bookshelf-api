exports.seed = function(knex, Promise) {
	// return knex.schema.dropTableIfExists('categories')
	// .then(() => {
	// 	return knex.schema.createTable('categories', function(t) {
	// 		t.increments('id').unsigned().primary();
	// 		t.dateTime('createdAt').notNull();
	// 		t.dateTime('updatedAt').nullable();
	// 		t.dateTime('deletedAt').nullable();

	// 		t.string('name').notNull();
	// 	});
	// })
	// .then(() => {
	// 	return knex('categories').insert({
	// 		name: 'Apparel',
	// 		createdAt: '2015-03-05 07:12:33',
	// 		updatedAt: null,
	// 		deletedAt: null
	// 	});
	// })
	// .then(() => {
	// 	return knex('categories').insert({
	// 		name: 'Electronics',
	// 		createdAt: '2015-03-05 07:12:33',
	// 		updatedAt: null,
	// 		deletedAt: null
	// 	});
	// });
};
