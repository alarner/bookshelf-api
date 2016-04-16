exports.seed = function(knex, Promise) {
	return knex.schema.dropTableIfExists('products')
	.then(() => {
		return knex.schema.createTable('products', function(t) {
			t.increments('id').unsigned().primary();
			t.dateTime('createdAt').notNull();
			t.dateTime('updatedAt').nullable();
			t.dateTime('deletedAt').nullable();

			t.string('name').notNull();
			t.decimal('price', 6, 2).notNull();
			t.integer('quantity').notNull();
		});
	})
	.then(() => {
		return knex('products').insert({
			name: 'Pants',
			price: 60,
			quantity: 108,
			createdAt: '2015-03-05 07:12:33',
			updatedAt: null,
			deletedAt: null
		});
	})
	.then(() => {
		return knex('products').insert({
			name: 'Socks',
			price: 6.5,
			quantity: 38,
			createdAt: '2015-03-05 07:12:33',
			updatedAt: null,
			deletedAt: null
		});
	})
	.then(() => {
		return knex('products').insert({
			name: 'Shirt',
			price: 42.99,
			quantity: 74,
			createdAt: '2015-03-05 07:12:33',
			updatedAt: null,
			deletedAt: null
		});
	})
	.then(() => {
		return knex('products').insert({
			name: 'Hat',
			price: 22.45,
			quantity: 231,
			createdAt: '2015-03-05 07:12:33',
			updatedAt: null,
			deletedAt: null
		});
	})
	.then(() => {
		return knex('products').insert({
			name: 'Ugly Hat',
			price: 22.45,
			quantity: 231,
			createdAt: '2015-03-05 07:12:33',
			updatedAt: null,
			deletedAt: '2015-03-05 07:12:33'
		});
	});
};
