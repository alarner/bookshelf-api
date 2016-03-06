let Howhap = require('howhap');
module.exports = function(req, res, urlPieces, model, config) {
	if(urlPieces.length < 2) {
		let err = new Howhap(config.errors.REQUIRES_ID, {
			model: urlPieces[0]
		});
		res.status(err.status).json(err.toJSON());
		return new Promise((resolve, reject) => {
			resolve({
				urlPieces: urlPieces,
				model: model
			});
		});
	}
	else {
		let result = {};
		result[model.idAttribute] = model.id;
		let promise = null;
		if(model.hasTimestamps.indexOf(config.deletedAttribute) >= 0 && (!req.hardDelete && !config.hardDelete || (req.hardDelete === false))) {
			let updatedData = {};
			updatedData[model.hasTimestamps[2]] = new Date();
			promise = model.save(updatedData, {method: 'update'})
			.then(savedModel => {
				res.json(result);
			});
		}
		else {
			promise = model.destroy({require: true})
			.then(destroyedModel => {
				res.json(result);
			});
		}

		return promise.catch(err => {
			let error = null;
			if(err.message === 'No Rows Updated' || err.message === 'No Rows Deleted') {
				error = new Howhap(config.errors.RECORD_NOT_FOUND, {
					model: urlPieces[0],
					id: urlPieces[1]
				});
			}
			else {
				error = new Howhap(config.errors.UNKNOWN, {
					error: err.toString()
				});
			}
			res.status(error.status).json(error.toJSON());
		})
		.then(() => {
			return Promise.resolve({
				urlPieces: urlPieces,
				model: model
			});
		});
	}
};