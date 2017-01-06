'use strict';

var _ = require('lodash');
var path = require('path');
var fs = require('fs');
var Howhap = require('howhap');
var errors = require('./errors');
var getStack = require('./get-stack');
var pluralize = require('pluralize');

module.exports = function (config) {
	if (!_.isObject(config)) {
		throw new Howhap(errors.BAD_CONFIG);
	}

	var defaultConfig = {
		putBehavior: 'upsert',
		hardDelete: false,
		deletedAttribute: 'deletedAt',
		errors: errors,
		pluralEndpoints: false
	};

	config = _.extend(defaultConfig, config);

	if (!config.path) {
		throw new Howhap(config.errors.MISSING_PATH);
	}

	var originalPath = config.path;

	// Relative path
	if (!path.isAbsolute(config.path)) {
		var stack = getStack();
		stack.shift();
		var callingFilePath = stack.shift().getFileName();
		config.path = path.join(path.dirname(callingFilePath), config.path);
	}

	var files = null;
	try {
		files = fs.readdirSync(config.path);
	} catch (e) {
		if (e.code === 'ENOENT') {
			throw new Howhap(config.errors.BAD_PATH, { path: originalPath });
		}
		throw new Howhap(config.errors.UNKNOWN, { error: e.toString() });
	}

	var models = files.filter(function (file) {
		// Ignore non-javascript files and hidden files.
		return path.extname(file) === '.js' && file.charAt(0) !== '.';
	}).map(function (file) {
		var modelName = file.split('.')[0];
		return {
			model: require(path.join(config.path, file)),
			name: config.pluralEndpoints ? pluralize(modelName) : modelName
		};
	}).reduce(function (before, info) {
		before[info.name.toLowerCase()] = info.model;
		return before;
	}, {});

	return require('./middleware')(models, config);
};