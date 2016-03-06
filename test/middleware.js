let expect = require('chai').expect;
let makeReq = require('./make-req');
let makeRes = require('./make-res');
let api = require('../src/index.js');
let path = require('path');
let middleware = null;
let Product = null;

describe('middleware.js', function() {
	before(function() {
		Product = require('./fixtures/models/Product');
		middleware = api({
			path: path.join(__dirname, 'fixtures/models')
		});
	});

	beforeEach(function(done) {
		bookshelf.knex.seed.run().then(() => done());
	});

	describe('processing', function() {
		it('should be a function', function() {
			expect(middleware).to.be.a.function;
		});
		
		it('should properly process get requests with no id', function(done) {
			let req = makeReq('get');
			req.url = '/product';
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
			req.url = '/product/7';
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
			req.url = '/product';
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
			req.url = '/product';
			let res = makeRes();
			middleware(req, res).then(result => {
				expect(res.json.calledWith([
					{
						id: 1,
						name: 'Pants',
						price: 60,
						quantity: 108,
						createdAt: '2015-03-05 07:12:33',
						updatedAt: null,
						deletedAt: null
					},
					{
						id: 2,
						name: 'Socks',
						price: 6.5,
						quantity: 38,
						createdAt: '2015-03-05 07:12:33',
						updatedAt: null,
						deletedAt: null
					},
					{
						id: 3,
						name: 'Shirt',
						price: 42.99,
						quantity: 74,
						createdAt: '2015-03-05 07:12:33',
						updatedAt: null,
						deletedAt: null
					},
					{
						id: 4,
						name: 'Hat',
						price: 22.45,
						quantity: 231,
						createdAt: '2015-03-05 07:12:33',
						updatedAt: null,
						deletedAt: null
					} 
				])).to.be.true;
				done();
			})
			.catch(done);
		});
		it('should be able to get a single record by id', function(done) {
			let req = makeReq('get');
			req.url = '/product/3';
			let res = makeRes();
			middleware(req, res).then(result => {
				expect(res.json.calledWith({
					id: 3,
					name: 'Shirt',
					price: 42.99,
					quantity: 74,
					createdAt: '2015-03-05 07:12:33',
					updatedAt: null,
					deletedAt: null
				})).to.be.true;
				done();
			})
			.catch(done);
		});
		it('should return an error when trying to query a record that doesn\'t exist', function(done) {
			let req = makeReq('get');
			req.url = '/product/100';
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
			req1.url = '/product';
			req1.body = {
				name: 'Car',
				price: 37.99,
				quantity: 23
			};
			let res1 = makeRes();

			let req2 = makeReq('get');
			req2.url = '/product/6';
			let res2 = makeRes();

			middleware(req1, res1)
			.then(result => {
				expect(res1.status.calledWith(400)).to.be.false;
				expect(res1.json.calledWithMatch({
					name: 'Car',
					price: 37.99,
					quantity: 23,
					id: 6
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
	});

	describe('put', function() {
		it('should return an error if no id is provided and putBehavior is set to update', function(done) {
			let mw2 = api({
				path: path.join(__dirname, 'fixtures/models'),
				putBehavior: 'update'
			});
			let req1 = makeReq('put');
			req1.url = '/product';
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
			req1.url = '/product/5';
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
			req1.url = '/product';
			req1.body = {
				name: 'Car',
				price: 37.99,
				quantity: 23
			};
			let res1 = makeRes();

			let req2 = makeReq('get');
			req2.url = '/product/6';
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
			req1.url = '/product/100';
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
			req1.url = '/product/1';
			req1.body = {
				name: 'Car',
				price: 37.99,
				quantity: 23
			};
			let res1 = makeRes();

			let req2 = makeReq('get');
			req2.url = '/product/1';
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
			req1.url = '/product';
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
			req1.url = '/product/100';
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
			req1.url = '/product/100';
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
			req1.url = '/product/1';
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
			req1.url = '/product/1';
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
			req1.url = '/product/1';
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
			req1.url = '/product/1';
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