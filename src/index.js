let _ = require('lodash');
let path = require('path');
let fs = require('fs');
let Howhap = require('howhap');
let errors = require('./errors');

module.exports = function(config) {
	if(!_.isObject(config)) {
		throw new Howhap(errors.BAD_CONFIG);
	}

	let defaultConfig = {
		putBehavior: 'upsert',
		hardDelete: false,
		deletedAttribute: 'deletedAt',
		errors: errors
	};

	config = _.extend(defaultConfig, config);

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

	let models = files
	.map(function(file) {
		return {
			model: require(path.join(config.path, file)),
			name: file.split('.')[0]
		};
	})
	.reduce(function(before, info) {
		before[info.name.toLowerCase()] = info.model;
		return before;
	}, {});

	return require('./middleware')(models, config);
};