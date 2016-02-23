let _ = require('lodash');
let path = require('path');
let fs = require('fs');
let Howhap = require('howhap');
let errors = require('./errors');

module.exports = function(config) {
	if(!_.isObject(config)) {
		throw new Howhap(errors.BAD_CONFIG);
	}

	config.errors = _.extend(config.errors || {}, errors);

	if(!config.path) {
		throw new Howhap(config.errors.MISSING_PATH);
	}

	let files = null;
	try {
		files = fs.readdirSync(config.path);
	}
	catch(e) {
		if(e.code === 'ENOENT') {
			throw new Howhap(config.errors.BAD_PATH, {path: config.path});
		}
		throw new Howhap(config.errors.UNKNOWN, {error: e.toString()});
	}

	// let m = files
	// .map(function(file) {
	// 	return {
	// 		model: require(path.join(config.path, file)),
	// 		name: file.split('.')[0]
	// 	};
	// })
	// .reduce(function(before, info) {
	// 	before[info.name] = info.model;
	// 	return before;
	// }, {});

	// let models = {};

	// for(let i in m) {
	// 	models[i.toLowerCase()] = m[i];
	// }

	// return require('./middleware')(models);
};