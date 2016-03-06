'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var Howhap = require('howhap');
module.exports = function (req, res, urlPieces, model, config) {
	if (urlPieces.length < 2) {
		var err = new Howhap(config.errors.REQUIRES_ID, {
			model: urlPieces[0]
		});
		res.status(err.status).json(err.toJSON());
		return new Promise(function (resolve, reject) {
			resolve({
				urlPieces: urlPieces,
				model: model
			});
		});
	} else {
		var _ret = function () {
			var result = {};
			result[model.idAttribute] = model.id;
			var promise = null;
			if (model.hasTimestamps.indexOf(config.deletedAttribute) >= 0 && (!req.hardDelete && !config.hardDelete || req.hardDelete === false)) {
				var updatedData = {};
				updatedData[model.hasTimestamps[2]] = new Date();
				promise = model.save(updatedData, { method: 'update' }).then(function (savedModel) {
					res.json(result);
				});
			} else {
				promise = model.destroy({ require: true }).then(function (destroyedModel) {
					res.json(result);
				});
			}

			return {
				v: promise.catch(function (err) {
					var error = null;
					if (err.message === 'No Rows Updated' || err.message === 'No Rows Deleted') {
						error = new Howhap(config.errors.RECORD_NOT_FOUND, {
							model: urlPieces[0],
							id: urlPieces[1]
						});
					} else {
						error = new Howhap(config.errors.UNKNOWN, {
							error: err.toString()
						});
					}
					res.status(error.status).json(error.toJSON());
				}).then(function () {
					return Promise.resolve({
						urlPieces: urlPieces,
						model: model
					});
				})
			};
		}();

		if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
	}
};