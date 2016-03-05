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
			});
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
			});
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
			});
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
						updatedAt: null
					},
					{
						id: 2,
						name: 'Socks',
						price: 6.5,
						quantity: 38,
						createdAt: '2015-03-05 07:12:33',
						updatedAt: null
					},
					{
						id: 3,
						name: 'Shirt',
						price: 42.99,
						quantity: 74,
						createdAt: '2015-03-05 07:12:33',
						updatedAt: null
					},
					{
						id: 4,
						name: 'Hat',
						price: 22.45,
						quantity: 231,
						createdAt: '2015-03-05 07:12:33',
						updatedAt: null
					} 
				])).to.be.true;
				done();
			});
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
					updatedAt: null
				})).to.be.true;
				done();
			});
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
			});
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
			req2.url = '/product/5';
			let res2 = makeRes();

			middleware(req1, res1)
			.then(result => {
				expect(res1.status.calledWith(400)).to.be.false;
				expect(res1.json.calledWithMatch({
					name: 'Car',
					price: 37.99,
					quantity: 23,
					id: 5
				})).to.be.true;
				return middleware(req2, res2);
			})
			.then(result => {
				expect(res2.json.calledWithMatch({
					name: 'Car',
					price: 37.99,
					quantity: 23,
					id: 5
				})).to.be.true;
				done();
			});;
		});
	});

	
	
	// it('should properly process get requests with an id', function() {
	// 	let req = makeReq('get');
	// 	req.url = '/product/7';
	// 	let res = makeRes();
	// 	let result = middleware(req, res);
	// 	expect(result.urlPieces.length).to.equal(2);
	// 	expect(result.urlPieces[1]).to.equal('7');
	// 	expect(result.model instanceof Product).to.be.true;
	// });
});