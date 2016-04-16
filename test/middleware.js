let expect = require('chai').expect;
let makeReq = require('./make-req');
let makeRes = require('./make-res');
let api = require('../src/index.js');
let path = require('path');
let middleware = null;
let Product = null;

// bookshelf.knex.client.on('start', function listen(builder) {
// 	var startTime = process.hrtime();
// 	var group = []; // captured for this builder

// 	builder.on('query', function(query) {
// 		group.push(query);
// 	});
// 	builder.on('end', function() {
// 		// all queries are completed at this point.
// 		// in the future, it'd be good to separate out each individual query,
// 		// but for now, this isn't something that knex supports. see the
// 		// discussion here for details:
// 		// https://github.com/tgriesser/knex/pull/335#issuecomment-46787879
// 		var diff = process.hrtime(startTime);
// 		var ms = diff[0] * 1e3 + diff[1] * 1e-6;
// 		group.forEach(function(query) {
// 			query.duration = ms.toFixed(3);
// 		});
// 		// console.log(group);
// 		bookshelf.knex.client.removeListener('start', listen);
// 	});
// });

describe('middleware.js', function() {
	before(function() {
		Product = require('./fixtures/models/Product');
		middleware = api({
			path: path.join(__dirname, 'fixtures/models')
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
				quantity: 23
			};
			let res = makeRes();
			middleware(req, res).then(result => {
				expect(result.urlPieces.length).to.equal(1);
				expect(result.model instanceof Product).to.be.true;
				expect(res.status.calledWith(400)).to.be.false;
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
				expect(res.json.calledWith([
					{
						id: 1,
						name: 'Pants',
						price: '60.00',
						quantity: 108,
						createdAt: new Date('2015-03-05 07:12:33'),
						updatedAt: null,
						deletedAt: null
					},
					{
						id: 2,
						name: 'Socks',
						price: '6.50',
						quantity: 38,
						createdAt: new Date('2015-03-05 07:12:33'),
						updatedAt: null,
						deletedAt: null
					},
					{
						id: 3,
						name: 'Shirt',
						price: '42.99',
						quantity: 74,
						createdAt: new Date('2015-03-05 07:12:33'),
						updatedAt: null,
						deletedAt: null
					},
					{
						id: 4,
						name: 'Hat',
						price: '22.45',
						quantity: 231,
						createdAt: new Date('2015-03-05 07:12:33'),
						updatedAt: null,
						deletedAt: null
					} 
				])).to.be.true;
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
					deletedAt: null
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
				expect(res.json.firstCall.args[0][0].quantity).to.equal(231);
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
				expect(res.json.firstCall.args[0].length).to.equal(2);
				expect(res.json.firstCall.args[0][0]).to.deep.equal({
					id: 1,
					name: 'Pants',
					price: '60.00',
					quantity: 108,
					createdAt: new Date('2015-03-05 07:12:33'),
					updatedAt: null,
					deletedAt: null
				});
				expect(res.json.firstCall.args[0][1]).to.deep.equal({
					id: 4,
					name: 'Hat',
					price: '22.45',
					quantity: 231,
					createdAt: new Date('2015-03-05 07:12:33'),
					updatedAt: null,
					deletedAt: null
				});
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
				expect(res.json.calledWith({
					message: 'Could not get "{{ model }}" with id {{ id }}.',
					status: 404,
					params: {
						model: 'product',
						id: '100'
					}
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
				quantity: 23
			};
			let res1 = makeRes();

			let req2 = makeReq('get');
			req2.originalUrl = '/product/6';
			let res2 = makeRes();

			middleware(req1, res1)
			.then(result => {
				expect(res1.status.calledWith(400), 'Not called with 400 status').to.be.false;
				expect(res1.json.firstCall.args[0].id, 'First json called with correct response id').to.equal(6);
				expect(res1.json.firstCall.args[0].name, 'First json called with correct response name').to.equal('Car');
				expect(res1.json.firstCall.args[0].price, 'First json called with correct response price').to.equal(37.99);
				expect(res1.json.firstCall.args[0].quantity, 'First json called with correct response quantity').to.equal(23);
				return middleware(req2, res2);
			})
			.then(result => {
				expect(res2.status.calledWith(400), 'Not called with 400 status').to.be.false;
				expect(res2.json.firstCall.args[0].id, 'Second json called with correct response id').to.equal(6);
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
					message: 'Using {{ method }} requires that you provide an id in the url. For example "/model/1"',
					status: 400,
					params: {
						model: 'product'
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
					message: 'Could not get "{{ model }}" with id {{ id }}.',
					status: 404,
					params: {
						model: 'product',
						id: '5'
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
				quantity: 23
			};
			let res1 = makeRes();

			let req2 = makeReq('get');
			req2.originalUrl = '/product/6';
			let res2 = makeRes();

			middleware(req1, res1)
			.then(result => {
				expect(res1.status.calledWith(400)).to.be.false;
				expect(res1.json.calledWithMatch({
					id: 6,
					name: 'Car',
					price: 37.99,
					quantity: 23
				})).to.be.true;
				return middleware(req2, res2);
			})
			.then(result => {
				expect(res2.json.calledWithMatch({
					name: 'Car',
					price: 37.99,
					quantity: 23,
					id: 6
				})).to.be.true;
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
					message: 'Could not get "{{ model }}" with id {{ id }}.',
					status: 404,
					params: {
						model: 'product',
						id: '100'
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
					price: 37.99,
					quantity: 23,
					id: 1
				})).to.be.true;
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
					message: 'Using {{ method }} requires that you provide an id in the url. For example "/model/1"',
					status: 400,
					params: {
						model: 'product'
					}
				})).to.be.true;
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
					message: 'Could not get "{{ model }}" with id {{ id }}.',
					status: 404,
					params: {
						model: 'product',
						id: '100'
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
					message: 'Could not get "{{ model }}" with id {{ id }}.',
					status: 404,
					params: {
						model: 'product',
						id: '100'
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
});