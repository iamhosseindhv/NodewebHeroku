/**
 * Created by iamhosseindhv on 02/09/2017.
 */
var mysql = require('mysql');

var pool = mysql.createPool({
    connectionLimit : 20,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database : process.env.DB_DATABASE
});

var getConnection = function (cb) {
    pool.getConnection(function (err, connection) {
        //pass the error to the cb instead of throwing it
        if(err) {
            return cb(err);
        }
        cb(null, connection);
    });
};

module.exports = getConnection;