var express = require('express')
var app = express()

app.get('/', function(req, res, next) {
	req.getConnection(function(error, conn) {
		conn.query('SELECT * FROM radhuntgroup ORDER BY id DESC',function(err, rows, fields) {
			// Useful to see the row packet console.log(rows)
			if(err) throw err
			if (err) {
				req.flash('error', err)
				res.render('huntgroups/list', {
					title: 'Huntgroup List', 
					data: ''
				})
			} else {
				res.render('huntgroups/list', {
					title: 'Huntgroup List', 
					data: rows
				})
			}
		})
	})
})

app.get('/add', function(req, res, next){	
	// render to views/user/add.ejs
	res.render('huntgroups/add', {
		group_name: '',
		nas_ip: '',
                nas_port: ''
	})
})

app.post('/add', function(req, res, next){	

    req.assert('group_name', 'Username is required').notEmpty()           //Validate name
    req.assert('nas_ip', 'Password is required').notEmpty()             //Validate age

    var errors = req.validationErrors()

    if( !errors ) {   //No errors were found.  Passed Validation!
		var huntgroup = {
			group_name: req.sanitize('group_name').escape().trim(),
			nas_ip: req.sanitize('nas_ip').escape().trim(),
			nas_port: req.sanitize('nas_port').escape().trim()
		}

		
		req.getConnection(function(error, conn) {
			conn.query("INSERT INTO radhuntgroup (groupname, nasipaddress, nasportid) VALUES ( ?, ?, ? )", [huntgroup.group_name, huntgroup.nas_ip, huntgroup.nas_port], function(err,result) {
				//if(err) throw err
				if (err) {
					console.log('OOPS-1: ' + err)
					req.flash('error', err)
					
					res.render('huntgroups/add', {
						group_name: huntgroup.group_name,
						nas_ip: huntgroup.nas_ip,
						nas_port: huntgroup.nas_port
					})
				} else {				
					req.flash('success', 'Data added successfully!')
					res.render('huntgroups/add', {
						group_name: '',
						nas_ip: '',
						nas_port: '' })
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
		
        	res.render('user/add', { 
        	   group_name: '',
              	       nas_ip: '',
                     nas_port: ''
        })
    }
})

// SHOW EDIT USER FORM
app.get('/edit/(:id)', function(req, res, next){
        req.getConnection(function(error, conn) {
                conn.query('SELECT * FROM radhuntgroup WHERE id = ' + req.params.id, function(err, rows, fields) {

                        // if user not found
                        if (rows.length <= 0) {
                                req.flash('error', 'Huntgroup not found with id = ' + req.params.id)
                                res.redirect('huntgroups/edit')
                        }
                        else { // if user found
                                // render to views/user/edit.ejs template file
                                res.render('huntgroups/edit', {
					id: rows[0].id,
				   group_name: rows[0].groupname,
				   nas_ip: rows[0].nasipaddress,
				   nas_port: rows[0].nasportid
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
			conn.query('UPDATE radhuntgroup SET value = SHA2(?, 512) WHERE id = ?', [ user.password, req.params.id ], function(err, result) {
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
					res.render('huntgroups/edit', {
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
        var user = { id: req.params.id }
        req.getConnection(function(error, conn) {
                conn.query('DELETE FROM radhuntgroup WHERE id =' + req.params.id, function(err, result) {
                         if (err) {
                                 req.flash('error', err)
                                 res.redirect('/huntgroups')
                        } else {
                                req.flash('success', 'User deleted successfully! ' + user.username )
                                res.redirect('/huntgroups')
                         }
                })
        })
})

module.exports = app
