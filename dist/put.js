'use strict';

var HowhapList = require('howhap-list');
module.exports = function (req, res, urlPieces, model, config) {
	var list = new HowhapList(null, {
		availableErrors: config.errors
	});
	if (config.putBehavior && config.putBehavior.toLowerCase() === 'update' && urlPieces.length < 2) {
		list.add('REQUIRES_ID', { model: urlPieces[0] });
		res.status(config.errors.REQUIRES_ID.status).json(list.toObject());
		return new Promise(function (resolve, reject) {
			resolve({
				urlPieces: urlPieces,
				model: model
			});
		});
	} else {
		var options = {};
		if (config.putBehavior && config.putBehavior.toLowerCase() === 'update') {
			options.method = 'update';
		}
		var promise = model;
		var hasTimestamps = model.hasTimestamps || [];
		if (hasTimestamps.indexOf(config.deletedAttribute) >= 0) {
			promise = promise.where(config.deletedAttribute, null);
		}
		return promise.save(req.body, options).then(function (savedModel) {
			res.json(savedModel.toJSON());
		}).catch(function (err) {
			var status = 500;
			if (err.message === 'No Rows Updated') {
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
		});
	}
};