exports.seed = function(knex, Promise) {
	return Promise.join(
		// Deletes ALL existing entries
		knex('products').truncate(), 

		// Inserts seed entries
		knex('products').insert({
			id: 1,
			name: 'Pants',
			price: 60,
			quantity: 108,
			createdAt: '2015-03-05 07:12:33',
			updatedAt: null
		}),
		knex('products').insert({
			id: 2,
			name: 'Socks',
			price: 6.5,
			quantity: 38,
			createdAt: '2015-03-05 07:12:33',
			updatedAt: null
		}),
		knex('products').insert({
			id: 3,
			name: 'Shirt',
			price: 42.99,
			quantity: 74,
			createdAt: '2015-03-05 07:12:33',
			updatedAt: null
		}),
		knex('products').insert({
			id: 4,
			name: 'Hat',
			price: 22.45,
			quantity: 231,
			createdAt: '2015-03-05 07:12:33',
			updatedAt: null
		})
	);
};
