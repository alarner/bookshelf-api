"use strict";

module.exports = function (req, res, urlPieces, model, config) {
	model.set(req.body);
	return model.save().then(function (savedModel) {
		res.json(savedModel.toJSON());
	}).catch(function (err) {
		res.status(400).json({
			message: err.toString(),
			status: 400
		});
	}).then(function () {
		return Promise.resolve({
			urlPieces: urlPieces,
			model: model
		});
	});
};