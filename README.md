# bookshelf api

```js
config: {
	path: '/path/to/models/directory',
	putBehavior: 'update|upsert', 		// default: upsert
	hardDelete: false|true, 			// default: false
	deletedColumn: 'deletedAt', 		// default: deletedAt
	errors: {
		...
	}
}
```