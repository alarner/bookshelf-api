let Howhap = require('howhap');
module.exports = function(req, res, urlPieces, model, config) {
	let promise = null;

	// Get individual record
	if(urlPieces.length > 1) {
		promise = model.fetch();
	}
	// Get all records
	else {
		promise = model.fetchAll();
	}

	return promise.then(function(results) {
		if(!results) {
			let err = new Howhap(config.errors.RECORD_NOT_FOUND, {
				model: urlPieces[0],
				id: urlPieces[1]
			});
			res.status(404).json(err.toJSON());
		}
		else {
			res.json(results.toJSON());
		}
	})
	.catch(function(err) {
		let error = new Howhap(config.errors.UNKNOWN, {
			error: err.toString()
		});
		res.status(500).json(error.toJSON());
	})
	.then(function() {
		return Promise.resolve({
			urlPieces: urlPieces,
			model: model
		});
	});
};