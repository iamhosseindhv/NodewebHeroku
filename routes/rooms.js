/**
 * Created by iamhosseindhv on 21/06/2017.
 */
var express = require('express');
var mysql = require('mysql');
var router = express.Router();


/* GET home page. */
router.get('/:id', function(req, res, next) {
    //find listing and render related page
    const listing_id = req.params.id;
    var properties = {};
    properties.title = 'Rooms';
    properties.isAuthenticated = req.isAuthenticated;
    properties.user = req.user;

    findListing(listing_id, properties)
        .then(findHost)
        .then(function (updatedProperties) {
            if (updatedProperties.listing){
                res.render('rooms', updatedProperties);
            } else {
                res.render('error-rooms');
            }
        });
});



function findListing(id, properties) {
    return new Promise(function(resolve, reject) {
        var getConnection = require('../database');
        getConnection(function (err, connection) {
            if (err) throw err;
            const statement = 'SELECT * FROM listing WHERE id = ?';
            connection.query(statement, [id], function (e, results) {
                if (e) reject(e);
                const result = results[0];
                //there exist NO listing with the given id
                if (!result){
                    properties.listing = null;
                    resolve(properties);
                } else {
                    properties.listing = result;
                    getConnection(function (error, con) {
                       if (error) throw error;
                       con.query('SELECT * FROM comments WHERE listing_id = ?', [result.id], function (er, comments) {
                           if (er) reject(er);
                           properties.comments = comments;
                           con.release();
                           connection.release();
                           resolve(properties);
                       });
                    });
                }
            });
        });
    });
}


function findHost(properties) {
    return new Promise(function(resolve, reject) {
        var getConnection = require('../database');
        const statement = 'SELECT *, ' +
            'DATE_FORMAT(registration_date, \'%Y\') AS registration_year, ' +
            'DATE_FORMAT(registration_date, \'%M\') AS registration_month ' +
            'FROM users WHERE id = ?';
        getConnection(function (err, connection) {
            if (err) throw err;
            connection.query(statement, [properties.listing.user_id], function (err, host) {
                if (err) reject(err);
                if (host[0]){
                    properties.host = host[0];
                } else {
                    //TO BE REMOVED
                    properties.host = {
                        firstname: 'John',
                        surname: 'Snow',
                        registration_month: 'April',
                        registration_year: '2012'
                    };
                }
                connection.release();
                resolve(properties)
            });
        });
    });
}



module.exports = router;

