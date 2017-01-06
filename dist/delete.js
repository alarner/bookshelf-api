'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var HowhapList = require('howhap-list');
module.exports = function (req, res, urlPieces, model, config) {
	var list = new HowhapList(null, {
		availableErrors: config.errors
	});
	if (urlPieces.length < 2) {
		list.add('REQUIRES_ID', { model: urlPieces[0] });
		res.status(config.errors.REQUIRES_ID.status).json(list.toObject());
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
			var hasTimestamps = model.hasTimestamps || [];
			if (hasTimestamps.indexOf(config.deletedAttribute) >= 0 && (!req.hardDelete && !config.hardDelete || req.hardDelete === false)) {
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
					var status = 500;
					if (err.message === 'No Rows Updated' || err.message === 'No Rows Deleted') {
						list.add('RECORD_NOT_FOUND', {
							model: urlPieces[0],
							id: urlPieces[1]
						});
						status = config.errors.RECORD_NOT_FOUND.status;
					} else {
						list.add('UNKNOWN', { error: err.toString() });
						status = config.errors.UNKNOWN.status;
					}
					res.status(status).json(list.toObject());
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