'use strict';

var _ = require('lodash');
var path = require('path');
var fs = require('fs');
var Howhap = require('howhap');
var errors = require('./errors');

module.exports = function (config) {
	if (!_.isObject(config)) {
		throw new Howhap(errors.BAD_CONFIG);
	}

	var defaultConfig = {
		putBehavior: 'upsert',
		hardDelete: false,
		deletedAttribute: 'deletedAt',
		errors: errors
	};

	config = _.extend(defaultConfig, config);

	if (!config.path) {
		throw new Howhap(config.errors.MISSING_PATH);
	}

	var files = null;
	try {
		files = fs.readdirSync(config.path);
	} catch (e) {
		if (e.code === 'ENOENT') {
			throw new Howhap(config.errors.BAD_PATH, { path: config.path });
		}
		throw new Howhap(config.errors.UNKNOWN, { error: e.toString() });
	}

	var models = files.map(function (file) {
		return {
			model: require(path.join(config.path, file)),
			name: file.split('.')[0]
		};
	}).reduce(function (before, info) {
		before[info.name.toLowerCase()] = info.model;
		return before;
	}, {});

	return require('./middleware')(models, config);
};