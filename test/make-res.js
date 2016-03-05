let sinon = require('sinon');
module.exports = function() {
	let res = {};
	res.status = sinon.stub().returns(res);
	res.json = sinon.stub().returns(res);
	return res;
};