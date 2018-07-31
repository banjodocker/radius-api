var config = {
	database: {
		host:	  'localhost', 	// database host
		user: 	  'root', 		// your database username
		password: 'my_password', 		// your database password
		port: 	  3306, 		// default MySQL port
		db: 	  'radius' 		// your database name
	},
	server: {
		host: '0.0.0.0',
		port: '3000'
	}
}

module.exports = config
