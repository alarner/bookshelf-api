let HowhapList = require('howhap-list');
module.exports = function(req, res, urlPieces, model, config) {
	let list = new HowhapList(
		null, 
		{
			availableErrors: config.errors
		}
	);
	if(config.putBehavior && config.putBehavior.toLowerCase() === 'update' && urlPieces.length < 2) {
		list.add('REQUIRES_ID', { model: urlPieces[0] });
		res.status(config.errors.REQUIRES_ID.status).json(list.toJSON());
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
			let status = 500;
			if(err.message === 'No Rows Updated') {
				list.add('RECORD_NOT_FOUND', {
					model: urlPieces[0],
					id: urlPieces[1]
				});
				status = config.errors.RECORD_NOT_FOUND.status;
			}
			else {
				list.add('UNKNOWN', { error: err.toString() });
				status = config.errors.UNKNOWN.status;
			}
			res.status(status).json(list.toJSON());
		})
		.then(() => {
			return Promise.resolve({
				urlPieces: urlPieces,
				model: model
			});
		});
	}	
};