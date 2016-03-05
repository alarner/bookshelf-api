let Howhap = require('howhap');
module.exports = function(res, urlPieces, model, errors) {
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
			let err = new Howhap(errors.RECORD_NOT_FOUND, {
				// model: 'fake',
				// id: 
			});
			res.status(404).json({
				message: 'Record not found',
				status: 404
			});
		}
		else {
			res.json(results.toJSON());
		}
	})
	.catch(function(err) {
		let error = new Howhap(errors.UNKNOWN, {
			// model: 'fake',
			// id: 
		});
		res.status(500).json({
			message: 'Unknown error...',
			status: 500
		});
	});
};