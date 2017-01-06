let expect = require('chai').expect;
let makeReq = require('./make-req');
let makeRes = require('./make-res');
let api = require('../src/index.js');
let products = require('./fixtures/data/products');
let path = require('path');
let middleware = null;
let pluralizedMiddleware = null;
let Product = null;

describe('middleware.js', function() {
	before(function() {
		Product = require('./fixtures/models/Product');
		middleware = api({
			path: path.join(__dirname, 'fixtures/models')
		});
		pluralizedMiddleware = api({
			path: path.join(__dirname, 'fixtures/models'),
			pluralEndpoints: true
		});
	});

	beforeEach(function(done) {
		bookshelf.knex.seed.run().then(() => {
			done();
		});
	});

	describe('processing', function() {
		it('should be a function', function() {
			expect(middleware).to.be.a.function;
		});
		
		it('should properly process get requests with no id', function(done) {
			let req = makeReq('get');
			req.originalUrl = '/product';
			let res = makeRes();
			middleware(req, res).then(result => {
				expect(result.urlPieces.length).to.equal(1);
				expect(result.model instanceof Product).to.be.true;
				done();
			})
			.catch(done);
		});

		it('should properly process get requests with no id and a url prefix', function(done) {
			let req = makeReq('get');
			req.originalUrl = '/api/v1/product';
			let res = makeRes();
			middleware(req, res).then(result => {
				expect(result.urlPieces.length).to.equal(1);
				expect(result.model instanceof Product).to.be.true;
				done();
			})
			.catch(done);
		});

		it('should properly process get requests with an id', function(done) {
			let req = makeReq('get');
			req.originalUrl = '/product/7';
			let res = makeRes();
			middleware(req, res).then(result => {
				expect(result.urlPieces.length).to.equal(2);
				expect(result.urlPieces[1]).to.equal('7');
				expect(result.model instanceof Product).to.be.true;
				done();
			})
			.catch(done);
		});

		it('should properly process get requests with an id and a url prefix', function(done) {
			let req = makeReq('get');
			req.originalUrl = '/foo/bar/product/7';
			let res = makeRes();
			middleware(req, res).then(result => {
				expect(result.urlPieces.length).to.equal(2);
				expect(result.urlPieces[1]).to.equal('7');
				expect(result.model instanceof Product).to.be.true;
				done();
			})
			.catch(done);
		});

		it('should properly process post requests with no id', function(done) {
			let req = makeReq('post');
			req.originalUrl = '/product';
			req.body = {
				name: 'Car',
				price: 37.99,
				quantity: 23,
				categoryId: 2
			};
			let res = makeRes();
			middleware(req, res).then(result => {
				expect(result.urlPieces.length, 'correct url pieces length').to.equal(1);
				expect(result.model instanceof Product, 'correct model type').to.be.true;
				expect(res.status.calledWith(400), 'not 400 status code').to.be.false;
				done();
			})
			.catch(done);
		});
	});

	describe('get', function() {
		it('should be able to get a list of all records', function(done) {
			let req = makeReq('get');
			req.originalUrl = '/product';
			let res = makeRes();
			middleware(req, res).then(result => {
				expect(res.json.args[0][0]).to.deep.equal(products);
				done();
			})
			.catch(done);
		});
		it('should work with models that don\'t have timestamps listed', function(done) {
			let req = makeReq('get');
			req.originalUrl = '/noTimestamps';
			let res = makeRes();
			middleware(req, res).then(result => {
				expect(res.json.args[0][0]).to.deep.equal([ { id: 1, name: 'Test1' } ]);
				done();
			})
			.catch(done);
		});
		it('should be able to get a list of all records when the model has no deletedAt timestamp', function(done) {
			let req = makeReq('get');
			req.originalUrl = '/authentication';
			let res = makeRes();
			middleware(req, res).then(result => {
				expect(res.json.calledWith([])).to.be.true;
				done();
			})
			.catch(done);
		});
		it('should be able to get a single record by id', function(done) {
			let req = makeReq('get');
			req.originalUrl = '/product/3';
			let res = makeRes();
			middleware(req, res).then(result => {
				expect(res.json.calledWith({
					id: 3,
					name: 'Shirt',
					price: '42.99',
					quantity: 74,
					createdAt: new Date('2015-03-05 07:12:33'),
					updatedAt: null,
					deletedAt: null,
					categoryId: 1
				})).to.be.true;
				done();
			})
			.catch(done);
		});
		it('should be able to filter by a single where clause object', function(done) {
			let req = makeReq('get');
			req.originalUrl = '/product';
			req.query = {
				where: {
					name: 'Hat'
				}
			};
			let res = makeRes();
			middleware(req, res).then(result => {
				expect(res.json.firstCall.args[0].length).to.equal(1);
				expect(res.json.firstCall.args[0][0].id).to.equal(4);
				expect(res.json.firstCall.args[0][0].name).to.equal('Hat');
				expect(res.json.firstCall.args[0][0].price).to.equal('22.45');
				expect(res.json.firstCall.args[0][0].quantity).to.equal(233);
				done();
			})
			.catch(done);
		});
		it('should be able to filter by a multi-where clause object with no results', function(done) {
			let req = makeReq('get');
			req.originalUrl = '/product';
			req.query = {
				where: {
					name: 'Hat',
					id: 3
				}
			};
			let res = makeRes();
			middleware(req, res).then(result => {
				expect(res.json.firstCall.args[0].length).to.equal(0);
				done();
			})
			.catch(done);
		});
		it('should be able to filter by a multi-where clause object with results', function(done) {
			let req = makeReq('get');
			req.originalUrl = '/product';
			req.query = {
				where: {
					name: 'Shirt',
					quantity: 74
				}
			};
			let res = makeRes();
			middleware(req, res).then(result => {
				expect(res.json.firstCall.args[0].length).to.equal(1);
				expect(res.json.firstCall.args[0][0].id).to.equal(3);
				expect(res.json.firstCall.args[0][0].name).to.equal('Shirt');
				expect(res.json.firstCall.args[0][0].price).to.equal('42.99');
				expect(res.json.firstCall.args[0][0].quantity).to.equal(74);
				done();
			})
			.catch(done);
		});
		it('should be able to filter by a where clause array', function(done) {
			let req = makeReq('get');
			req.originalUrl = '/product';
			req.query = {
				where: ['quantity', '>', 100]
			};
			let res = makeRes();
			middleware(req, res).then(result => {
				expect(res.json.firstCall.args[0].length, 'correct length').to.equal(3);
				expect(res.json.firstCall.args[0][0]).to.deep.equal({
					id: 1,
					name: 'Pants',
					price: '60.00',
					quantity: 108,
					createdAt: new Date('2015-03-05 07:12:33'),
					updatedAt: null,
					deletedAt: null,
					categoryId: 1
				}, 'correct first product');
				expect(res.json.firstCall.args[0][1]).to.deep.equal({
					id: 4,
					name: 'Hat',
					price: '22.45',
					quantity: 233,
					createdAt: new Date('2015-03-05 07:12:33'),
					updatedAt: null,
					deletedAt: null,
					categoryId: 1
				}, 'correct second product');
				expect(res.json.firstCall.args[0][2]).to.deep.equal({
					id: 6,
					name: 'Smartphone',
					price: '220.45',
					quantity: 231,
					createdAt: new Date('2015-03-05 07:12:33'),
					updatedAt: null,
					deletedAt: null,
					categoryId: 2
				}, 'correct third product');
				done();
			})
			.catch(done);
		});
		it('should be able to include related models', function(done) {
			let req = makeReq('get');
			req.originalUrl = '/product';
			req.query = {
				where: {
					name: 'Shirt',
					quantity: 74
				},
				withRelated: ['category']
			};
			let res = makeRes();
			middleware(req, res).then(result => {
				expect(res.json.firstCall.args[0].length).to.equal(1);
				expect(res.json.firstCall.args[0][0].id).to.equal(3);
				expect(res.json.firstCall.args[0][0].name).to.equal('Shirt');
				expect(res.json.firstCall.args[0][0].price).to.equal('42.99');
				expect(res.json.firstCall.args[0][0].quantity).to.equal(74);
				expect(res.json.firstCall.args[0][0].category).to.deep.equal({
					id: 1,
					name: 'Apparel',
					createdAt: new Date('2015-03-05 07:12:33'),
					updatedAt: null,
					deletedAt: null
				});
				done();
			})
			.catch(done);
		});
		it('should be able to order by a field', function(done) {
			let req = makeReq('get');
			req.originalUrl = '/product';
			req.query = {
				where: ['quantity', '>', 100],
				sort: 'name'
			};
			let res = makeRes();
			middleware(req, res).then(result => {
				expect(res.json.firstCall.args[0].length, 'correct length').to.equal(3);
				expect(res.json.firstCall.args[0][0]).to.deep.equal({
					id: 4,
					name: 'Hat',
					price: '22.45',
					quantity: 233,
					createdAt: new Date('2015-03-05 07:12:33'),
					updatedAt: null,
					deletedAt: null,
					categoryId: 1
				}, 'correct first product');
				expect(res.json.firstCall.args[0][1]).to.deep.equal({
					id: 1,
					name: 'Pants',
					price: '60.00',
					quantity: 108,
					createdAt: new Date('2015-03-05 07:12:33'),
					updatedAt: null,
					deletedAt: null,
					categoryId: 1
				}, 'correct second product');
				expect(res.json.firstCall.args[0][2]).to.deep.equal({
					id: 6,
					name: 'Smartphone',
					price: '220.45',
					quantity: 231,
					createdAt: new Date('2015-03-05 07:12:33'),
					updatedAt: null,
					deletedAt: null,
					categoryId: 2
				}, 'correct third product');
				done();
			})
			.catch(done);
		});
		it('should be able to order by a field descending', function(done) {
			let req = makeReq('get');
			req.originalUrl = '/product';
			req.query = {
				where: ['quantity', '>', 100],
				sort: 'price',
				direction: 'desc'
			};
			let res = makeRes();
			middleware(req, res).then(result => {
				expect(res.json.firstCall.args[0].length, 'correct length').to.equal(3);
				expect(res.json.firstCall.args[0][0]).to.deep.equal({
					id: 6,
					name: 'Smartphone',
					price: '220.45',
					quantity: 231,
					createdAt: new Date('2015-03-05 07:12:33'),
					updatedAt: null,
					deletedAt: null,
					categoryId: 2
				}, 'correct first product');
				expect(res.json.firstCall.args[0][1]).to.deep.equal({
					id: 1,
					name: 'Pants',
					price: '60.00',
					quantity: 108,
					createdAt: new Date('2015-03-05 07:12:33'),
					updatedAt: null,
					deletedAt: null,
					categoryId: 1
				}, 'correct second product');
				expect(res.json.firstCall.args[0][2]).to.deep.equal({
					id: 4,
					name: 'Hat',
					price: '22.45',
					quantity: 233,
					createdAt: new Date('2015-03-05 07:12:33'),
					updatedAt: null,
					deletedAt: null,
					categoryId: 1
				}, 'correct third product');
				done();
			})
			.catch(done);
		});
		it('should be able to order by a field ascending', function(done) {
			let req = makeReq('get');
			req.originalUrl = '/product';
			req.query = {
				where: ['quantity', '>', 100],
				sort: 'quantity',
				direction: 'asc'
			};
			let res = makeRes();
			middleware(req, res).then(result => {
				expect(res.json.firstCall.args[0].length, 'correct length').to.equal(3);
				expect(res.json.firstCall.args[0][0]).to.deep.equal({
					id: 1,
					name: 'Pants',
					price: '60.00',
					quantity: 108,
					createdAt: new Date('2015-03-05 07:12:33'),
					updatedAt: null,
					deletedAt: null,
					categoryId: 1
				}, 'correct first product');
				expect(res.json.firstCall.args[0][1]).to.deep.equal({
					id: 6,
					name: 'Smartphone',
					price: '220.45',
					quantity: 231,
					createdAt: new Date('2015-03-05 07:12:33'),
					updatedAt: null,
					deletedAt: null,
					categoryId: 2
				}, 'correct second product');
				expect(res.json.firstCall.args[0][2]).to.deep.equal({
					id: 4,
					name: 'Hat',
					price: '22.45',
					quantity: 233,
					createdAt: new Date('2015-03-05 07:12:33'),
					updatedAt: null,
					deletedAt: null,
					categoryId: 1
				}, 'correct third product');
				done();
			})
			.catch(done);
		});
		it('should be able to get a single record by id with related models', function(done) {
			let req = makeReq('get');
			req.originalUrl = '/product/6';
			req.query = {
				withRelated: ['category']
			};
			let res = makeRes();
			middleware(req, res).then(result => {
				expect(res.json.calledWith({
					id: 6,
					name: 'Smartphone',
					price: '220.45',
					quantity: 231,
					createdAt: new Date('2015-03-05 07:12:33'),
					updatedAt: null,
					deletedAt: null,
					categoryId: 2,
					category: {
						id: 2,
						name: 'Electronics',
						createdAt: new Date('2015-03-05 07:12:33'),
						updatedAt: null,
						deletedAt: null
					}
				})).to.be.true;
				done();
			})
			.catch(done);
		});
		it('should return an error when trying to query a record that doesn\'t exist', function(done) {
			let req = makeReq('get');
			req.originalUrl = '/product/100';
			let res = makeRes();
			middleware(req, res).then(result => {
				expect(res.status.calledWith(404)).to.be.true;
				expect(res.json.firstCall.args[0]).to.deep.equal({
					default: {
						message: 'Could not get "{{ model }}" with id {{ id }}.',
						status: 404,
						params: {
							model: 'product',
							id: '100'
						}
					}
				});
				done();
			})
			.catch(done);
		});
		it('should not work with pluralized routes when url is singular', function(done) {
			let req = makeReq('get');
			req.originalUrl = '/product';
			let res = makeRes();
			pluralizedMiddleware(req, res).then(result => {
				done('Did not throw error');
			})
			.catch(error => {
				expect(error).to.deep.equal({ error: 'No match' });
				done();
			});
		});
		it('should work with pluralized routes when url is plural', function(done) {
			let req = makeReq('get');
			req.originalUrl = '/products';
			let res = makeRes();
			pluralizedMiddleware(req, res).then(result => {
				expect(result.urlPieces.length).to.equal(1);
				expect(result.model instanceof Product).to.be.true;
				done();
			})
			.catch(done);
		});
		it('should not work with pluralized routes when url is singular with an id', function(done) {
			let req = makeReq('get');
			req.originalUrl = '/product/3';
			let res = makeRes();
			pluralizedMiddleware(req, res).then(result => {
				done('Did not throw error');
			})
			.catch(function(error) {
				expect(error).to.deep.equal({ error: 'No match' });
				done();
			});
		});
		it('should work with pluralized routes when url is plural', function(done) {
			let req = makeReq('get');
			req.originalUrl = '/products/3';
			let res = makeRes();
			pluralizedMiddleware(req, res).then(result => {
				expect(res.json.calledWith({
					id: 3,
					name: 'Shirt',
					price: '42.99',
					quantity: 74,
					createdAt: new Date('2015-03-05 07:12:33'),
					updatedAt: null,
					deletedAt: null,
					categoryId: 1
				})).to.be.true;
				done();
			})
			.catch(done);
		});
		it('should work with string ids starting with a number', function(done) {
			let req = makeReq('get');
			req.originalUrl = '/uuids/98b752bf-696a-4ae7-894f-5b9fa2b3e743';
			let res = makeRes();
			pluralizedMiddleware(req, res).then(result => {
				expect(res.json.calledWith({
					id: '98b752bf-696a-4ae7-894f-5b9fa2b3e743',
					name: 'test uuid 1',
					createdAt: new Date('2015-03-05 07:12:33'),
					updatedAt: null,
					deletedAt: null
				})).to.be.true;
				done();
			})
			.catch(done);
		});
		it('should work with string ids starting with a letter', function(done) {
			let req = makeReq('get');
			req.originalUrl = '/uuids/b561cbb3-5a9c-4ee5-a17c-6db06876249b';
			let res = makeRes();
			pluralizedMiddleware(req, res).then(result => {
				expect(res.json.calledWith({
					id: 'b561cbb3-5a9c-4ee5-a17c-6db06876249b',
					name: 'test uuid 2',
					createdAt: new Date('2015-03-05 07:12:33'),
					updatedAt: null,
					deletedAt: null
				})).to.be.true;
				done();
			})
			.catch(done);
		});
	});
	
	describe('post', function() {
		it('should properly insert records', function(done) {
			let req1 = makeReq('post');
			req1.originalUrl = '/product';
			req1.body = {
				name: 'Car',
				price: 37.99,
				quantity: 23,
				categoryId: 2
			};
			let res1 = makeRes();

			let req2 = makeReq('get');
			req2.originalUrl = '/product/7';
			let res2 = makeRes();

			middleware(req1, res1)
			.then(result => {
				expect(res1.status.calledWith(400), 'Not called with 400 status').to.be.false;
				expect(res1.json.firstCall.args[0].id, 'First json called with correct response id').to.equal(7);
				expect(res1.json.firstCall.args[0].name, 'First json called with correct response name').to.equal('Car');
				expect(res1.json.firstCall.args[0].price, 'First json called with correct response price').to.equal(37.99);
				expect(res1.json.firstCall.args[0].quantity, 'First json called with correct response quantity').to.equal(23);
				return middleware(req2, res2);
			})
			.then(result => {
				expect(res2.status.calledWith(400), 'Not called with 400 status').to.be.false;
				expect(res2.json.firstCall.args[0].id, 'Second json called with correct response id').to.equal(7);
				expect(res2.json.firstCall.args[0].name, 'Second json called with correct response name').to.equal('Car');
				expect(res2.json.firstCall.args[0].price, 'Second json called with correct response price').to.equal('37.99');
				expect(res2.json.firstCall.args[0].quantity, 'Second json called with correct response quantity').to.equal(23);
				done();
			})
			.catch(done);
		});
	});

	describe('put', function() {
		it('should return an error if no id is provided and putBehavior is set to update', function(done) {
			let mw2 = api({
				path: path.join(__dirname, 'fixtures/models'),
				putBehavior: 'update'
			});
			let req1 = makeReq('put');
			req1.originalUrl = '/product';
			req1.body = {
				name: 'Car',
				price: 37.99,
				quantity: 23
			};
			let res1 = makeRes();
			mw2(req1, res1)
			.then(result => {
				expect(res1.status.calledWith(400)).to.be.true;
				expect(res1.json.calledWith({
					default: {
						message: 'Using {{ method }} requires that you provide an id in the url. For example "/model/1"',
						status: 400,
						params: {
							model: 'product'
						}
					}
				})).to.be.true;
				done();
			})
			.catch(done);
		});

		it('should not allow putting to a soft deleted record', function(done) {
			let req1 = makeReq('put');
			req1.originalUrl = '/product/5';
			req1.body = {
				name: 'Car',
				price: 37.99,
				quantity: 23
			};
			let res1 = makeRes();
			middleware(req1, res1)
			.then(result => {
				expect(res1.status.calledWith(404)).to.be.true;
				expect(res1.json.calledWith({
					default: {
						message: 'Could not get "{{ model }}" with id {{ id }}.',
						status: 404,
						params: {
							model: 'product',
							id: '5'
						}
					}
				})).to.be.true;
				done();
			})
			.catch(done);
		});

		it('should create the record if no id is provided and putBehavior is set to upsert', function(done) {
			let req1 = makeReq('put');
			req1.originalUrl = '/product';
			req1.body = {
				name: 'Car',
				price: 37.99,
				quantity: 23,
				categoryId: 2
			};
			let res1 = makeRes();

			let req2 = makeReq('get');
			req2.originalUrl = '/product/7';
			let res2 = makeRes();

			middleware(req1, res1)
			.then(result => {
				expect(res1.status.calledWith(400), 'Status not 400').to.be.false;
				expect(res1.json.calledWithMatch({
					id: 7,
					name: 'Car',
					price: 37.99,
					quantity: 23
				}), 'First json call').to.be.true;
				return middleware(req2, res2);
			})
			.then(result => {
				expect(res2.json.calledWithMatch({
					name: 'Car',
					price: '37.99',
					quantity: 23,
					id: 7
				}), 'Second json call').to.be.true;
				done();
			})
			.catch(done);
		});

		it('should return an error if the putBehavior is set to update and the record doesn\'t exist', function(done) {
			let mw2 = api({
				path: path.join(__dirname, 'fixtures/models'),
				putBehavior: 'update'
			});
			let req1 = makeReq('put');
			req1.originalUrl = '/product/100';
			req1.body = {
				name: 'Car',
				price: 37.99,
				quantity: 23
			};
			let res1 = makeRes();
			mw2(req1, res1)
			.then(result => {
				expect(res1.status.calledWith(404)).to.be.true;
				expect(res1.json.calledWithMatch({
					default: {
						message: 'Could not get "{{ model }}" with id {{ id }}.',
						status: 404,
						params: {
							model: 'product',
							id: '100'
						}
					}
				})).to.be.true;
				done();
			})
			.catch(done);;
		});

		it('should properly update records', function(done) {
			let req1 = makeReq('put');
			req1.originalUrl = '/product/1';
			req1.body = {
				name: 'Car',
				price: 37.99,
				quantity: 23
			};
			let res1 = makeRes();

			let req2 = makeReq('get');
			req2.originalUrl = '/product/1';
			let res2 = makeRes();

			middleware(req1, res1)
			.then(result => {
				expect(res1.status.calledWith(400)).to.be.false;
				expect(res1.status.calledWith(404)).to.be.false;
				expect(res1.json.calledWithMatch({
					name: 'Car',
					price: 37.99,
					quantity: 23,
					id: '1'
				})).to.be.true;
				return middleware(req2, res2);
			})
			.then(result => {
				expect(res2.json.calledWithMatch({
					name: 'Car',
					price: '37.99',
					quantity: 23,
					id: 1
				})).to.be.true;
				done();
			})
			.catch(done);
		});

		it('should work with models that don\'t have timestamps listed', function(done) {
			let req = makeReq('put');
			req.body = { name: 'Test2' };
			req.originalUrl = '/noTimestamps/1';
			let res = makeRes();
			middleware(req, res).then(result => {
				expect(res.json.args[0][0]).to.deep.equal({ id: '1', name: 'Test2' });
				done();
			})
			.catch(done);
		});
	});

	describe('delete', function() {
		it('should return an error if no id is provided', function(done) {
			let req1 = makeReq('delete');
			req1.originalUrl = '/product';
			let res1 = makeRes();
			middleware(req1, res1)
			.then(result => {
				expect(res1.status.calledWith(400)).to.be.true;
				expect(res1.json.calledWith({
					default: {
						message: 'Using {{ method }} requires that you provide an id in the url. For example "/model/1"',
						status: 400,
						params: {
							model: 'product'
						}
					}
				})).to.be.true;
				done();
			})
			.catch(done);
		});

		it('should work with models that don\'t have timestamps listed', function(done) {
			let req = makeReq('delete');
			req.originalUrl = '/noTimestamps/1';
			let res = makeRes();
			middleware(req, res).then(result => {
				expect(res.json.args[0][0]).to.deep.equal({ id: '1' });
				done();
			})
			.catch(done);
		});

		it('should return an error if the record doesn\'t exist and we are soft deleting', function(done) {
			let req1 = makeReq('delete');
			req1.originalUrl = '/product/100';
			let res1 = makeRes();
			middleware(req1, res1)
			.then(result => {
				expect(res1.status.calledWith(404)).to.be.true;
				expect(res1.json.calledWith({
					default: {
						message: 'Could not get "{{ model }}" with id {{ id }}.',
						status: 404,
						params: {
							model: 'product',
							id: '100'
						}
					}
				})).to.be.true;
				done();
			})
			.catch(done);
		});

		it('should return an error if the record doesn\'t exist and we are hard deleting', function(done) {
			let req1 = makeReq('delete');
			req1.originalUrl = '/product/100';
			req1.hardDelete = true;
			let res1 = makeRes();
			middleware(req1, res1)
			.then(result => {
				expect(res1.status.calledWith(404)).to.be.true;
				expect(res1.json.calledWith({
					default: {
						message: 'Could not get "{{ model }}" with id {{ id }}.',
						status: 404,
						params: {
							model: 'product',
							id: '100'
						}
					}
				})).to.be.true;
				done();
			})
			.catch(done);
		});

		it('should soft delete the record if req.hardDelete is falsey and config.hardDelete is false', function(done) {
			let req1 = makeReq('delete');
			req1.originalUrl = '/product/1';
			let res1 = makeRes();
			middleware(req1, res1)
			.then(result => {
				expect(res1.status.calledWith(404)).to.be.false;
				expect(res1.json.calledWith({
					id: '1'
				})).to.be.true;
				return Product.forge({id: 1}).fetch();
			})
			.then(product => {
				expect(product).to.not.be.null;
				expect(product.toJSON().id).to.equal(1);
				done();
			})
			.catch(done);
		});

		it('should soft delete the record if req.hardDelete is false and config.hardDelete is true', function(done) {
			let mw2 = api({
				path: path.join(__dirname, 'fixtures/models'),
				hardDelete: true
			});
			
			let req1 = makeReq('delete');
			req1.originalUrl = '/product/1';
			req1.hardDelete = false;
			let res1 = makeRes();
			mw2(req1, res1)
			.then(result => {
				expect(res1.status.calledWith(404)).to.be.false;
				expect(res1.json.calledWith({
					id: '1'
				})).to.be.true;
				return Product.forge({id: 1}).fetch();
			})
			.then(product => {
				expect(product).to.not.be.null;
				expect(product.toJSON().id).to.equal(1);
				done();
			})
			.catch(done);
		});

		it('should permanently delete the record if req.hardDelete is true', function(done) {
			let req1 = makeReq('delete');
			req1.originalUrl = '/product/1';
			req1.hardDelete = true;
			let res1 = makeRes();
			middleware(req1, res1)
			.then(result => {
				expect(res1.status.calledWith(404)).to.be.false;
				expect(res1.json.calledWith({
					id: '1'
				})).to.be.true;
				return Product.forge({id: 1}).fetch();
			})
			.then(product => {
				expect(product).to.be.null;
				done();
			})
			.catch(done);
		});

		it('should permanently delete the record if config.hardDelete is true', function(done) {
			let mw2 = api({
				path: path.join(__dirname, 'fixtures/models'),
				hardDelete: true
			});
			let req1 = makeReq('delete');
			req1.originalUrl = '/product/1';
			let res1 = makeRes();
			mw2(req1, res1)
			.then(result => {
				expect(res1.status.calledWith(404)).to.be.false;
				expect(res1.json.calledWith({
					id: '1'
				})).to.be.true;
				return Product.forge({id: 1}).fetch();
			})
			.then(product => {
				expect(product).to.be.null;
				done();
			})
			.catch(done);
		});
	});

	describe('named models', function() {
		it('should return a middleware function', function() {
			expect(middleware('Product')).to.be.a('function');
		});
		it('should used the named model regardless of the request url', function(done) {
			let m = middleware('Product');
			let req = makeReq('get');
			req.originalUrl = '/authentication';
			let res = makeRes();
			m(req, res).then(result => {
				expect(res.json.calledWith(products)).to.be.true;
				done();
			})
			.catch(done);
		});
		it('should look for req.params.id to find the model id', function(done) {
			let m = middleware('Product');
			let req = makeReq('get');
			req.params = { id: 6 };
			req.originalUrl = '/authentication';
			let res = makeRes();
			m(req, res).then(result => {
				expect(res.json.calledWith(products[4])).to.be.true;
				done();
			})
			.catch(done);
		});
	});
});