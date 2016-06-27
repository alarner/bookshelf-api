let expect = require('chai').expect;
let getStack = require('../src/get-stack.js');
let path = require('path');

describe('get-stack.js', function() {
	it('should exist', function() {
		expect(getStack).to.be.a('function');
	});
	it('should return the stack trace', function() {
		let x = getStack();
		let first = x.shift().getFileName();
		let pieces = first.split(path.sep);
		expect(pieces.pop()).to.equal('get-stack.js');
		expect(pieces.pop()).to.equal('test');
	});
});