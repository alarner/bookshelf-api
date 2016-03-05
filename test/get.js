let expect = require('chai').expect;
let get = require('../src/get.js');
let fs = require('fs-extra');
let path = require('path');

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
});