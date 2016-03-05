module.exports = {
	UNKNOWN: {
		message: 'An unknown error occurred: {{ error }}.',
		status: 500
	},
	RECORD_NOT_FOUND: {
		message: 'Could not get "{{ model }}" with id {{ id }}.',
		status: 404
	},
	REQUIRES_ID: {
		message: 'Using {{ method }} requires that you provide an id in the url. For example "/model/1"',
		status: 400
	},
	MISSING_PATH: {
		message: 'Bookshelf API configuration object requires a path property specifying where your models directory is located.',
		status: 500
	},
	BAD_CONFIG: {
		message: 'Bookshelf API requires a config object.',
		status: 500
	},
	BAD_PATH: {
		message: 'Could not find the model path {{ path }}.',
		status: 500
	}
};