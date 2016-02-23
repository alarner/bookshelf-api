let expect = require('chai').expect;
let api = require('../src/index.js');

describe('index.js', function() {
	it('should not accept number arguments', function() {
		expect(function() { api(5); }).to.throw('Bookshelf API requires a config object.');
	});
	it('should not accept string arguments', function() {
		expect(function() { api('test'); }).to.throw('Bookshelf API requires a config object.');
	});
	it('should not accept boolean arguments', function() {
		expect(function() { api(false); }).to.throw('Bookshelf API requires a config object.');
	});
	it('should not accept object arguments without a path property', function() {
		expect(function() { api({}); }).to.throw('Bookshelf API configuration object requires a path property specifying where your models directory is located.');
		expect(function() { api({foo: 'test'}); }).to.throw('Bookshelf API configuration object requires a path property specifying where your models directory is located.');
	});
	it('should throw an error if the path is invalid', function() {
		expect(function() { api({path: 'foo'}); }).to.throw('Could not find the model path foo.');
	});
	it('should work if the path is valid', function() {
		expect(function(){ api({path: 'test/models'}); }).to.not.throw();
	});
});