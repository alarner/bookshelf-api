let sinon = require('sinon');
module.exports = function() {
	let req = {};
	req.status = sinon.stub().returns(req);
	req.json = sinon.stub().returns(req);
	return req;
};