let Howhap = require('howhap');
module.exports = function(req, res, urlPieces, model, config) {
	if(config.putBehavior && config.putBehavior.toLowerCase() === 'update' && urlPieces.length < 2) {
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
		let options = {};
		if(config.putBehavior && config.putBehavior.toLowerCase() === 'update') {
			options.method = 'update';
		}
		let promise = model;
		if(model.hasTimestamps.indexOf(config.deletedAttribute) >= 0) {
			promise = promise.where(config.deletedAttribute, null);
		}
		return promise.save(req.body, options).then(savedModel => {
			res.json(savedModel.toJSON());
		})
		.catch(err => {
			let error = null;
			if(err.message === 'No Rows Updated') {
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