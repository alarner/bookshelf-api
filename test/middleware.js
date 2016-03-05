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

	it('should be a function', function() {
		expect(middleware).to.be.a.function;
	});
	
	it('should properly process get requests with no id', function() {
		let req = makeReq('get');
		req.url = '/product';
		let res = makeRes();
		let result = middleware(req, res);
		expect(result.urlPieces.length).to.equal(1);
		expect(result.model instanceof Product).to.be.true;
	});
	it('should properly process get requests with an id', function() {
		let req = makeReq('get');
		req.url = '/product/7';
		let res = makeRes();
		let result = middleware(req, res);
		expect(result.urlPieces.length).to.equal(2);
		expect(result.urlPieces[1]).to.equal('7');
		expect(result.model instanceof Product).to.be.true;
	});
});