let Howhap = require('howhap');
module.exports = function(req, res, urlPieces, model, config) {
	let promise = model;

	if(model.hasTimestamps.indexOf(config.deletedAttribute) !== -1) {
		promise = promise.where(config.deletedAttribute, null);
	}

	// Get individual record
	if(urlPieces.length > 1) {
		promise = promise.fetch();
	}
	// Get all records
	else {
		if(req.query.where) {
			if(Array.isArray(req.query.where)) {
				promise = promise.where.apply(promise, req.query.where);
			}
			else if(Object.prototype.toString.call(req.query.where) == '[object Object]') {
				promise = promise.where(req.query.where);
			}
		}
		promise = promise.fetchAll();
	}
	return promise.then(function(results) {
		if(!results) {
			let err = new Howhap(config.errors.RECORD_NOT_FOUND, {
				model: urlPieces[0],
				id: urlPieces[1]
			});
			res.status(err.status).json(err.toJSON());
		}
		else {
			res.json(results.toJSON());
		}
	})
	.catch(function(err) {
		let error = new Howhap(config.errors.UNKNOWN, {
			error: err.toString()
		});
		res.status(error.status).json(error.toJSON());
	})
	.then(function() {
		return Promise.resolve({
			urlPieces: urlPieces,
			model: model
		});
	});
};