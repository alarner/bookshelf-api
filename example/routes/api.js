var path = require('path');
var express = require('express');
var router = express.Router();
var api = require('../../src/index.js')({
  path: path.join(__dirname, '../models')
});

router.use('/product', function(req, res, next) {
	console.log('hit middleware');
	next();
}, api);

module.exports = router;
