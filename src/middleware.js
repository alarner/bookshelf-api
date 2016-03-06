let _ = require('lodash');
let get = require('./get');
let post = require('./post');
let put = require('./put');
let del = require('./delete');

module.exports = function(models, config) {
	return function(req, res, next) {
		let url = _.trim(req.url, '/');
		let urlPieces = url.split('/');
		let method = req.method.toLowerCase();

		if(!urlPieces.length) {
			return next();
		}

		urlPieces[0] = urlPieces[0].toLowerCase();

		if(!models.hasOwnProperty(urlPieces[0])) {
			return next();
		}

		let Model = models[urlPieces[0]];
		let model = new Model();
		if(urlPieces.length > 1) {
			let params = {};
			params[model.idAttribute] = urlPieces[1];
			model = Model.forge(params);
		}

		if(method === 'get') {
			return get(req, res, urlPieces, model, config);
		}
		else if(method === 'post') {
			return post(req, res, urlPieces, model, config);
		}
		else if(method === 'put') {
			return put(req, res, urlPieces, model, config);
		}
		else if(method === 'delete') {
			return del(req, res, urlPieces, model, config);
		}
	};
};