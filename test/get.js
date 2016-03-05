let expect = require('chai').expect;
let get = require('../src/get.js');
let fs = require('fs-extra');
let path = require('path');
let makeRes = require('./make-res');

describe('get.js', function() {
	beforeEach(function() {
		fs.copySync(
			path.join(__dirname, 'starter.db'),
			path.join(__dirname, 'test.db')
		);
	});

	it('should be a function', function() {
		expect(get).to.be.a.function;
	});

	// it('should return an error if an individual record is not found', function() {
	// 	let res = makeRes();
	// 	get(res, [10], )
	// });
});