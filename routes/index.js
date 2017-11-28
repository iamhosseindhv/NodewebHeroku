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
    var ipString = 'ip: ' + ip;
    var referrer = req.headers.referer;
    var visitDate = 'date:' + new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
    getLocInfo(ip, function (response) {
        console.log(response);
        var getConnection = require('../database');
        getConnection(function (error, connection) {
            if (error) throw error;
            connection.query('INSERT INTO visitors (ip, referrer, date) values (?, ?, ?)', [ipString, referrer, visitDate], function (err) {
                if (err) throw err;
                connection.release();
            });
        });
    });
    next();
}

function getLocInfo(ip, callback) {
    const url = 'http://www.geoplugin.net/json.gp?ip=' + ip;
    request(url, function (error, response, body) {
        if (response.statusCode === 200){
            const res = JSON.parse(body);
            if (res.geoplugin_status === 200){
                var response = {};
                response.geoplugin_city = res.geoplugin_city;
                response.geoplugin_region = res.geoplugin_region;
                response.geoplugin_countryName = res.geoplugin_countryName;
                callback(response);
            } else {
                callback(null);
            }
        } else {
            console.log(response.statusCode);
            console.log('error:', error);
            callback(null);
        }
    });
}

module.exports = router;