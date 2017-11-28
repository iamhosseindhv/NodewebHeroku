var express = require('express');
var request = require('request');
var router = express.Router();

/* GET home page. */
router.get('/', storeWhoCameIn, function(req, res, next) {
    // properties = {};
    // properties.title = 'Home';
    // properties.activeTab = 'all';
    // properties.isAuthenticated = req.isAuthenticated;
    // res.render('index', properties);
    res.redirect('/s');
});


function storeWhoCameIn(req, res, next) {
    var ip = req.headers['x-forwarded-for'].split(',').pop() ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
    var referrer = req.headers.referer;
    const url = 'http://www.geoplugin.net/json.gp?ip=' + ip;
    request(url, function (error, response, body) {
        if (response.statusCode === 200){
            const res = JSON.parse(body);
            console.log(res);
        } else {
            console.log(response.statusCode);
            console.log('error:', error);
        }
    });
    var ipString = 'ip: ' + ip;
    var visitDate = 'date:' + new Date().toISOString()
            .replace(/T/, ' ')
            .replace(/\..+/, '') ;
    var getConnection = require('../database');
    getConnection(function (error, connection) {
        if (error) throw error;
        connection.query('INSERT INTO visitors (ip, referrer, date) values (?, ?, ?)', [ipString, referrer, visitDate], function (err) {
            if (err) throw err;
            connection.release();
        });
    });
    next();
}

module.exports = router;