exports.seed = function(knex, Promise) {
	return knex.schema.dropTableIfExists('products')
	.then(() => {
		return knex.schema.dropTableIfExists('categories');
	})
	.then(() => {
		return knex.schema.dropTableIfExists('authentication');
	})
	.then(() => {
		return knex.schema.dropTableIfExists('users');
	})
	.then(() => {
		return knex.schema.dropTableIfExists('noTimestamps');
	})
	.then(() => {
		return knex.schema.createTable('categories', function(t) {
			t.increments('id').unsigned().primary();
			t.dateTime('createdAt').notNull();
			t.dateTime('updatedAt').nullable();
			t.dateTime('deletedAt').nullable();

			t.string('name').notNull();
		});
	})
	.then(() => {
		return knex.schema.createTable('products', function(t) {
			t.increments('id').unsigned().primary();
			t.dateTime('createdAt').notNull();
			t.dateTime('updatedAt').nullable();
			t.dateTime('deletedAt').nullable();

			t.string('name').notNull();
			t.decimal('price', 6, 2).notNull();
			t.integer('quantity').notNull();
			t.integer('categoryId')
				.unsigned()
				.notNull()
				.references('id')
				.inTable('categories')
				.onDelete('CASCADE');
		});
	})
	.then(() => {
		return knex.schema.createTable('users', function(t) {
			t.increments('id').unsigned().primary();
			t.dateTime('createdAt').notNull();
			t.dateTime('updatedAt').nullable();
			t.dateTime('deletedAt').nullable();

			t.string('firstName').nullable();
			t.string('lastName').nullable();
			t.string('email').nullable();
		});
	})
	.then(() => {
		return knex.schema.createTable('authentication', function(t) {
			t.increments('id').unsigned().primary();
			t.dateTime('createdAt').notNull();
			t.dateTime('updatedAt').nullable();

			t.string('type').notNull();
			t.string('identifier').notNull();
			t.string('password').nullable();
			t.json('data').nullable();
			t.integer('userId')
				.unsigned()
				.notNull()
				.references('id')
				.inTable('users')
				.onDelete('CASCADE');
		});
	})
	.then(() => {
		return knex.schema.createTable('noTimestamps', function(t) {
			t.increments('id').unsigned().primary();
			t.string('name').notNull();
		});
	})
	.then(() => {
		return knex('categories').insert({
			name: 'Apparel',
			createdAt: new Date('2015-03-05 07:12:33'),
			updatedAt: null,
			deletedAt: null
		});
	})
	.then(() => {
		return knex('categories').insert({
			name: 'Electronics',
			createdAt: new Date('2015-03-05 07:12:33'),
			updatedAt: null,
			deletedAt: null
		});
	})
	.then(() => {
		return knex('products').insert({
			name: 'Pants',
			price: 60,
			quantity: 108,
			createdAt: new Date('2015-03-05 07:12:33'),
			updatedAt: null,
			deletedAt: null,
			categoryId: 1
		});
	})
	.then(() => {
		return knex('products').insert({
			name: 'Socks',
			price: 6.5,
			quantity: 38,
			createdAt: new Date('2015-03-05 07:12:33'),
			updatedAt: null,
			deletedAt: null,
			categoryId: 1
		});
	})
	.then(() => {
		return knex('products').insert({
			name: 'Shirt',
			price: 42.99,
			quantity: 74,
			createdAt: new Date('2015-03-05 07:12:33'),
			updatedAt: null,
			deletedAt: null,
			categoryId: 1
		});
	})
	.then(() => {
		return knex('products').insert({
			name: 'Hat',
			price: 22.45,
			quantity: 233,
			createdAt: new Date('2015-03-05 07:12:33'),
			updatedAt: null,
			deletedAt: null,
			categoryId: 1
		});
	})
	.then(() => {
		return knex('products').insert({
			name: 'Ugly Hat',
			price: 22.45,
			quantity: 231,
			createdAt: new Date('2015-03-05 07:12:33'),
			updatedAt: null,
			deletedAt: new Date('2015-03-05 07:12:33'),
			categoryId: 1
		});
	})
	.then(() => {
		return knex('products').insert({
			name: 'Smartphone',
			price: 220.45,
			quantity: 231,
			createdAt: new Date('2015-03-05 07:12:33'),
			updatedAt: null,
			deletedAt: null,
			categoryId: 2
		});
	})
	.then(() => {
		return knex('noTimestamps').insert({
			name: 'Test1'
		});
	});
};
