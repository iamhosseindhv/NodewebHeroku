/**
 * Created by iamhosseindhv on 02/09/2017.
 */
var mysql = require('mysql');

var pool = mysql.createPool({
    connectionLimit : 20,
    host: 'us-cdbr-iron-east-05.cleardb.net',
    user: 'b372441c3d3c7a',
    password: '589e4244',
    database : 'heroku_e3066e4346f4683'
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

// connection.connect();
//module.exports = connection;

module.exports = getConnection;