var express = require('express')
var api = express.Router()

api.get('/', function(req, res, next) {
        req.getConnection(function(error, conn) {
                conn.query('SELECT * FROM radcheck ORDER BY id DESC',function(err, results, fields) {
                        // Useful to see the row packet console.log(rows)
                        if(err) throw err
			res.send(JSON.stringify(
				{ 'status': 200, 
				   'error': null, 
				'response': results
				}))
		})
	})
})

api.post("/adduser", function(req, res) {

	req.checkBody('username', 'Username is required').notEmpty()
	req.checkBody('password', 'Password is required').notEmpty()


	var username = req.body.username
	var password = req.body.password

        var errors = req.validationErrors()
        if (errors) {
                res.send(JSON.stringify(errors))
        }
	
	// check if username doesnt exists yet
	req.getConnection(function(error,conn) {
		conn.query('SELECT 1 FROM radcheck WHERE username = ?', username, function(err, rows, result) {
		if(err) throw err
		if(rows.length) {
			res.send(JSON.stringify(
			        { 'status': 400,
                                   'error': 'already exists',
                                'response': 'Username already exists.'
                                }))
			}
		else {
			conn.query("INSERT INTO radcheck (username,attribute,op,value ) VALUES( ?,'SHA2-512-Password',':=', SHA2(?,512))", [username, password], function(err, rows, result) {
			res.send(JSON.stringify(
                                { 'status': 200,
                                   'error': 'OK',
                                'response': 'Successfully added user: ' + username
                                }))
				
			})
		}

		})
	})
	
})

api.put('/updatepass', function(req, res, next) {
        req.checkBody('username', 'Username is required').notEmpty()
        req.checkBody('password', 'Password is required').notEmpty()


        var username = req.body.username
        var password = req.body.password

        var errors = req.validationErrors()
        if (errors) {
                res.send(JSON.stringify(errors))
        }

        req.getConnection(function(error,conn) {
                conn.query('SELECT * FROM radcheck WHERE username = ?', username, function(err, rows, fields, result) {
		console.log(rows)
		//yeap we found the user therefore we can proceed
		if(rows.length) {
			conn.query('UPDATE radcheck SET value = SHA2(?, 512) WHERE username = ? ', [username, password], function(err, rows, result) {
			if(err) throw err
			res.send(JSON.stringify(
                                { 'status': 200,
                                   'error': err,
				   'result': result,
                                'response': 'Successfully updated user: ' + username,
                                }))
			})
		}
		else {
		       res.send(JSON.stringify(
                              { 'status': 400,
                                 'error': 'Username not exists',
                              'response': 'Username ' + username + ' doesnt exists.'
                              }))
			}
		})
	})
})

api.delete('/delete/(:username)', function(req, res, next) {
	var username = req.params.username
        req.getConnection(function(error, conn) {
                conn.query("DELETE FROM radcheck WHERE username = '" + username +"'" , function(err, result) {
			if(err) {
                        res.send(JSON.stringify(
                                { 'status': 400,
                                   'error': err,
                                'response': result
                                }))
			throw err } else {
                        	res.send(JSON.stringify(
                                { 'status': 200,
                                   'error': null,
                                'response': 'Successfully delete username: ' +username
				}))
        		}                 
		})
   	})
})


module.exports = api
