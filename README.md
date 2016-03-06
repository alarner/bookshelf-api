# bookshelf api

Bookshelf API is configurable Express middleware that allows you to serve a RESTful API from a directory of [Bookshelf.js](http://bookshelfjs.org/) models.

`npm install --save bookshelf-api`

Here's the basic usage:

```js
let express = require('express');
let path = require('path');
let api = require('bookshelf-api')({
	path: path.join(__dirname, 'models')
});

let app = express();
app.use('/api/v1', api);
```

This simple setup will provide you with your standard GET, POST, PUT and DELETE verbs for a RESTful API based on the Bookshelf models in your `./models` directory.

For example, imagine you have a product model that looks like this:

##### ./models/Product.js
```js
module.exports = bookshelf.Model.extend({
  tableName: 'products'
});
```

Using the setup above you will now be able to make API requests to `/api/v1/product`.

* `GET    /api/v1/product` - List all of the products.
* `GET    /api/v1/product/23` - Get the product with id 23.
* `POST   /api/v1/product` - Create a new product
* `PUT    /api/v1/product/7` - Update product with an id of 7.
* `DELETE /api/v1/product/83` - Delete the product with an id of 83.

You can find a full working example in the [example](/example) directory.

Bookshelf API provides a number of options that allow you to customize the behavior of the API. They should be passed in to the middleware:

```js
let options = {
	path: './models',
	putBehavior: 'update',
	hardDelete: true,
	deletedAttribute: 'deletedAt',
	errors: {
		...
	}
}
let api = require('bookshelf-api')(options);
```

Below you will find a list of the available options and their behavior:

## Options

##### path

A string representing the path where the bookshelf models directory is located.

```js
let path = require('path');
let options = {
	path: path.join(__dirname, 'models/bookshelf')
}
let api = require('bookshelf-api')(options);
```

##### putBehavior

*default: 'upsert'*

A string representing how PUT requests should behave. The options are *update* or *upsert*.

* update - PUT requests will only update an existing record. If that record doesn't exist then the API will return a 404 not found error.
* upsert - PUT requests will update existing records if they exist, or create new records if they do not exists, like a SQL UPSERT statement.

```js
let options = {
	putBehavior: 'update'
}
let api = require('bookshelf-api')(options);
```

##### hardDelete

*default: false*

A boolean specifying if DELETE requests should be *hard deletes*. Hard deleted permanently remove the record from the database (SQL DELETE statement) whereas soft deletes will simply update a column specifying when that record was deleted. The record will still exist in the database but it will not appear anymore when you make GET requests.

If this option is false you should specify a column name that represents the datetime that the record was deleted (see deletedAttribute below).

```js
let options = {
	hardDelete: true
}
let api = require('bookshelf-api')(options);
```

##### deletedAttribute

*default: 'deletedAt'*

This option is only relevant if the *hardDelete* option is false. This option specifies which column should keep track of when (if at all) a record was deleted.

```js
let options = {
	hardDelete: true,
	deletedAttribute: 'delete_date'
}
let api = require('bookshelf-api')(options);
```

##### errors

This option allows you to override the default error messages that bookshelf api gives when there are bad requests or records are not found. The default error messages can be found in [src/errors/js](/src/errors.js).

This option should provide overides for one or more of these errors if you want more control over the wording of your error messages.

```js
let options = {
	errors: {
		UNKNOWN: {
			message: 'Something bad happened!',
			status: 500
		},
		RECORD_NOT_FOUND: {
			message: 'The {{ model }} you are looking for doesn\'t exist. id = {{ id }}.',
			status: 404
		}
	}
}
let api = require('bookshelf-api')(options);
```