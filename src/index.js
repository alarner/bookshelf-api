let _ = require('lodash');
let path = require('path');
let fs = require('fs');
let Howhap = require('howhap');
let errors = require('./errors');
let getStack = require('./get-stack');
let pluralize = require('pluralize');

module.exports = function(config) {
	if(!_.isObject(config)) {
		throw new Howhap(errors.BAD_CONFIG);
	}

	let defaultConfig = {
		putBehavior: 'upsert',
		hardDelete: false,
		deletedAttribute: 'deletedAt',
		errors: errors,
		pluralEndpoints: false,
	};

	config = _.extend(defaultConfig, config);

	if(!config.path) {
		throw new Howhap(config.errors.MISSING_PATH);
	}

	const originalPath = config.path;

	// Relative path
	if(!path.isAbsolute(config.path)) {
		let stack = getStack();
		stack.shift();
		let callingFilePath = stack.shift().getFileName();
		config.path = path.join(path.dirname(callingFilePath), config.path);
	}

	let files = null;
	try {
		files = fs.readdirSync(config.path);
	}
	catch(e) {
		if(e.code === 'ENOENT') {
			throw new Howhap(config.errors.BAD_PATH, {path: originalPath});
		}
		throw new Howhap(config.errors.UNKNOWN, {error: e.toString()});
	}

	let models = files
	.filter(function(file) {
		// Ignore non-javascript files and hidden files.
		return (path.extname(file) === '.js' && file.charAt(0) !== '.');
	})
	.map(function(file) {
		let modelName = file.split('.')[0];
		return {
			model: require(path.join(config.path, file)),
			name: config.pluralEndpoints ? pluralize(modelName) : modelName,
		};
	})
	.reduce(function(before, info) {
		before[info.name.toLowerCase()] = info.model;
		return before;
	}, {});

	return require('./middleware')(models, config);
};