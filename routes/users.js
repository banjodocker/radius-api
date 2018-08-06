var express = require('express')
var app = express()

// SHOW LIST OF USERS
app.get('/', function(req, res, next) {
	req.getConnection(function(error, conn) {
		conn.query('SELECT * FROM radcheck ORDER BY id DESC',function(err, rows, fields) {
			// Useful to see the row packet console.log(rows)
			if(err) throw err
			if (err) {
				req.flash('error', err)
				res.render('user/list', {
					title: 'User List', 
					data: ''
				})
			} else {
				// render to views/user/list.ejs template file
				res.render('user/list', {
					title: 'User List', 
					data: rows
				})
			}
		})
	})
})

// SHOW ADD USER FORM
app.get('/add', function(req, res, next){	
	// render to views/user/add.ejs
	res.render('user/add', {
		title: 'Add New User',
		username: '',
		password: ''
	})
})

// ADD NEW USER POST ACTION
app.post('/add', function(req, res, next){	

    req.assert('username', 'Username is required').notEmpty()           //Validate name
    req.assert('password', 'Password is required').notEmpty()             //Validate age

    var errors = req.validationErrors()

    if( !errors ) {   //No errors were found.  Passed Validation!
		
		/********************************************
		 * Express-validator module
		 
		req.body.comment = 'a <span>comment</span>';
		req.body.username = '   a user    ';

		req.sanitize('comment').escape(); // returns 'a &lt;span&gt;comment&lt;/span&gt;'
		req.sanitize('username').trim(); // returns 'a user'
		********************************************/
		var user = {
			username: req.sanitize('username').escape().trim(),
			password: req.sanitize('password').escape().trim()
		}

		
		req.getConnection(function(error, conn) {
			sql = `INSERT INTO radcheck (username,attribute,op,value ) VALUES ('${user.username}','SHA2-512-Password', ':=', SHA2('${user.password}',512))`
			conn.query(sql, user, function(err,result) {
				//if(err) throw err
				if (err) {
					console.log('OOPS-1: ' + err)
					req.flash('error', err)
					
					// render to views/user/add.ejs
					res.render('user/add', {
						title: 'Add New User',
						username: user.username,
						password: user.password
					})
				} else {				
					req.flash('success', 'Data added successfully!')
					
					// render to views/user/add.ejs
					res.render('user/add', {
						title: 'Add New User',
						username: '',
						password: ''					
					})
				}
			})
		})
	}
	else {   //Display errors to user
		var error_msg = ''
		errors.forEach(function(error) {
			error_msg += error.msg + '<br>'
		})				
		req.flash('error', error_msg)		
		
		/**
		 * Using req.body.name 
		 * because req.param('name') is deprecated
		 */ 
        res.render('user/add', { 
            title: 'Add New User',
            username: req.body.username,
            username: req.body.password
        })
    }
})

// SHOW EDIT USER FORM
app.get('/edit/(:id)', function(req, res, next){
        req.getConnection(function(error, conn) {
                conn.query('SELECT * FROM radcheck WHERE id = ' + req.params.id, function(err, rows, fields) {
                        if(err) throw err

                        // if user not found
                        if (rows.length <= 0) {
                                req.flash('error', 'User not found with id = ' + req.params.id)
                                res.redirect('user', {
					id: '',
				    username: '', 
				    password: '' })
                        }
                        else { // if user found
                                // render to views/user/edit.ejs template file
                                res.render('user/edit', {
                                        title: 'Edit User',
                                        id: rows[0].id,
                                        username: rows[0].username,
                                        password: rows[0].value
                                })
                        }
                })
        })
})



// EDIT USER POST ACTION
app.put('/edit/(:id)', function(req, res, next) {
	req.assert('username', 'Username is required').notEmpty()           //Validate name
	req.assert('password', 'Password is required').notEmpty()             //Validate age

    var errors = req.validationErrors()
    
    if( !errors ) {   //No errors were found.  Passed Validation!
		
		/********************************************
		 * Express-validator module
		 
		req.body.comment = 'a <span>comment</span>';
		req.body.username = '   a user    ';

		req.sanitize('username').trim(); // returns 'a user'
		********************************************/
		var user = {
			username: req.sanitize('username').escape().trim(),
			password: req.sanitize('password').escape().trim()
		}
		
		req.getConnection(function(error, conn) {
			conn.query('UPDATE radcheck SET value = SHA2(?, 512) WHERE id = ?', [ user.password, req.params.id ], function(err, result) {
				//if(err) throw err
				if (err) {
					req.flash('error', err)
					console.log(err)
					
					// render to views/user/add.ejs
					res.render('user/edit', {
						title: 'Edit User',
						id: req.params.id,
						username: req.body.username,
						password: req.body.password
					})
				} else {
					req.flash('success', 'Data updated successfully!')
					
					// render to views/user/add.ejs
					res.render('user/edit', {
						title: 'Edit User',
						      id: req.params.id,
						username: req.body.username,
						password: req.body.password
					})
				}
			})
		})
	}
	else {   //Display errors to user
		var error_msg = ''
		errors.forEach(function(error) {
			error_msg += error.msg + '<br>'
		})
		req.flash('error', error_msg)
		
		/**
		 * Using req.body.name 
		 * because req.param('name') is deprecated
		 */ 
        res.render('user/edit', { 
            title: 'Edit User',            
			id: req.body.id,
			username: req.body.username,
			password: req.body.password
        })
    }
})

// DELETE USER
app.delete('/delete/(:id)', function(req, res, next) {
	console.log('HIT')
        var user = { id: req.params.id }
        req.getConnection(function(error, conn) {
                conn.query('DELETE FROM radcheck WHERE id =' + req.params.id, function(err, result) {
                         if (err) {
                                 req.flash('error', err)
                                 res.redirect('/user')
                        } else {
                                req.flash('success', 'User deleted successfully! ' + user.username )
                                res.redirect('/user')
                         }
                })
        })
})

module.exports = app
