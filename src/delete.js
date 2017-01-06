let HowhapList = require('howhap-list');
module.exports = function(req, res, urlPieces, model, config) {
	let list = new HowhapList(
		null, 
		{
			availableErrors: config.errors
		}
	);
	if(urlPieces.length < 2) {
		list.add('REQUIRES_ID', { model: urlPieces[0] });
		res.status(config.errors.REQUIRES_ID.status).json(list.toObject());
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
		let hasTimestamps = model.hasTimestamps || [];
		if(hasTimestamps.indexOf(config.deletedAttribute) >= 0 && (!req.hardDelete && !config.hardDelete || (req.hardDelete === false))) {
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
			let status = 500;
			if(err.message === 'No Rows Updated' || err.message === 'No Rows Deleted') {
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
			res.status(status).json(list.toObject());
		})
		.then(() => {
			return Promise.resolve({
				urlPieces: urlPieces,
				model: model
			});
		});
	}
};