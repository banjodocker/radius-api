var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var mysql = require('mysql'),
myConnection = require('express-myconnection');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

var config = require('./config')
var dbOptions = {
        host:     config.database.host,
        user:     config.database.user,
        password: config.database.password,
        port:     config.database.port,
        database: config.database.db
}

app.use(app.router);

app.get('/', routes.index);

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});

exports.index = function (req, res, next) {

    req.getConnection(function (err, connection) {
        connection.query('SELECT ? AS RESULT', ['Hello World!'], function (err, results) {
            if (err) return next(err);

            res.render('index', {
                title: 'express-myconnection',
                result: results[0].RESULT
            });
        });
    });

};
