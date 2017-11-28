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
            connection.query('INSERT INTO visitors (ip, referrer, date, city, region, country) values (?, ?, ?, ?, ?, ?)', [ipString, referrer, visitDate, response.geoplugin_city, response.geoplugin_region, response.geoplugin_countryName], function (err) {
                if (err) throw err;
                connection.release();
            });
        });
    });
    next();
}

function getLocInfo(ip, callback) {
    var locInfo = {
        geoplugin_city: '',
        geoplugin_region: '',
        geoplugin_countryName: ''
    };
    const url = 'http://www.geoplugin.net/json.gp?ip=' + ip;
    request(url, function (error, response, body) {
        if (response.statusCode === 200){
            const res = JSON.parse(body);
            if (res.geoplugin_status === 200){
                locInfo.geoplugin_city = res.geoplugin_city;
                locInfo.geoplugin_region = res.geoplugin_region;
                locInfo.geoplugin_countryName = res.geoplugin_countryName;
                callback(locInfo);
            } else {
                callback(locInfo);
            }
        } else {
            console.log(response.statusCode);
            console.log('error:', error);
            callback(locInfo);
        }
    });
}

module.exports = router;