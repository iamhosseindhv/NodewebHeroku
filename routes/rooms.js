/**
 * Created by iamhosseindhv on 21/06/2017.
 */
var express = require('express');
var mysql = require('mysql');
var router = express.Router();


/* GET home page. */
router.get('/:id', function(req, res, next) {
    //find listing and render related page
    var listing_id = req.params.id;
    var properties = {};
    properties.title = 'Rooms';
    properties.isAuthenticated = req.isAuthenticated;
    properties.user = req.user;

    // since not all of the listings have sufficient data,
    // for the purpose of demonstration, we redirect to one of these random pages
    const min = 0, max = 2;
    const randomPageAmoung3 = Math.floor(Math.random() * (max - min + 1)) + min;
    const possibleListingIds = [10, 7, 4];
    listing_id = possibleListingIds[randomPageAmoung3];
    console.log('listing id: ', listing_id);

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
                        registration_year: '2012',
                        bio: 'Well this is a sample bio or my profile on NodeWeb and its just for the purpose of demonstration. Well this is a sample bio or my profile on NodeWeb and its just for the purpose of demonstration. <br> Well this is a sample bio or my profile on NodeWeb and its just for the purpose of demonstration. Well this is a sample bio or my profile on NodeWeb and its just for the purpose of demonstration. Well this is a sample bio or my profile on NodeWeb and its just for the purpose of demonstration. Well this is a sample bio or my profile on NodeWeb and its just for the purpose of demonstration. Well this is a sample bio or my profile on NodeWeb and its just for the purpose of demonstration. Well this is a sample bio or my profile on NodeWeb and its just for the purpose of demonstration.'
                    };
                }
                connection.release();
                resolve(properties)
            });
        });
    });
}



module.exports = router;

