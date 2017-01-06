'use strict';

var _ = require('lodash');
var get = require('./get');
var post = require('./post');
var put = require('./put');
var del = require('./delete');
var url = require('url');
var path = require('path');

module.exports = function (models, config) {
	function middleware(req, res, next) {

		function error(message) {
			if (next && _.isFunction(next)) {
				next();
			}
			return Promise.reject({ error: message });
		}

		var parsed = url.parse(_.trim(req.originalUrl, path.sep));
		var urlPieces = parsed.pathname.split(path.sep);
		var method = req.method.toLowerCase();

		if (!urlPieces.length) {
			return error('Unknown path');
		}

		var modelName = null;
		var modelId = null;

		// Named model
		if (this && this.modelName) {
			modelName = this.modelName.toLowerCase();
			if (req.params && req.params.id) {
				modelId = req.params.id;
			}
		}
		// Model from URL
		else if (!models.hasOwnProperty(urlPieces[urlPieces.length - 1].toLowerCase())) {
				if (urlPieces.length < 2 || !models.hasOwnProperty(urlPieces[urlPieces.length - 2].toLowerCase())) {
					return error('No match');
				} else {
					modelName = urlPieces[urlPieces.length - 2].toLowerCase();
					modelId = urlPieces[urlPieces.length - 1];
				}
			} else {
				modelName = urlPieces[urlPieces.length - 1].toLowerCase();
			}

		var filteredUrlPieces = [modelName];
		var Model = models[modelName];
		var model = new Model();
		if (modelId !== null) {
			var params = {};
			params[model.idAttribute] = modelId;
			model = Model.forge(params);
			filteredUrlPieces.push(modelId);
		}

		if (method === 'get') {
			return get(req, res, filteredUrlPieces, model, config);
		} else if (method === 'post') {
			return post(req, res, filteredUrlPieces, model, config);
		} else if (method === 'put') {
			return put(req, res, filteredUrlPieces, model, config);
		} else if (method === 'delete') {
			return del(req, res, filteredUrlPieces, model, config);
		}
	};

	return function (req, res, next) {
		// Specifically calling out a named model
		if (typeof req === 'string') {
			return middleware.bind({ modelName: req });
		}
		return middleware(req, res, next);
	};
};