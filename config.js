var config = {
	database: {
		host:	  'radius-mysql', 	// database host
		user: 	  'radius', 		// your database username
		password: 'badam', 		// your database password
		port: 	  '3306', 		// default MySQL port
		db: 	  'radius' 		// your database name
	},
	server: {
		host: '0.0.0.0',
		port: '4001'
	}
}

module.exports = config
