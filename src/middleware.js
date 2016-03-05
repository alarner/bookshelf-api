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
			if(urlPieces.length < 2) {
				res.status(404).json({
					message: 'Record not found',
					status: 404
				});
			}
			else {
				let updatedData = req.body;
				model.save(updatedData).then(
					function(savedModel) {
						res.json(savedModel.toJSON());
					},
					function(err) {
						res.status(500).json({
							message: err.toString(),
							status: 500
						});
					}
				);
			}
		}
		else if(method === 'delete') {
			return delete(req, res, urlPieces, model, config);
			if(urlPieces.length < 2) {
				res.status(404).json({
					message: 'Record not found',
					status: 404
				});
			}
			else {
				if(model.hasTimestamps.length >= 3 && !req.body.hard) {
					let updatedData = {};
					updatedData[model.hasTimestamps[2]] = new Date();
					model.save(updatedData).then(
						function(savedModel) {
							res.json(savedModel.toJSON());
						},
						function(err) {
							res.status(500).json({
								message: err.toString(),
								status: 500
							});
						}
					);
				}
				else {
					model.destroy().then(
						function(destroyedModel) {
							res.json(destroyedModel.toJSON());
						},
						function(err) {
							res.status(500).json({
								message: err.toString(),
								status: 500
							});
						}
					);
				}
			}
		}
	};
};