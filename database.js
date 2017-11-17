/**
 * Created by iamhosseindhv on 02/09/2017.
 */
var mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'us-cdbr-iron-east-05.cleardb.net',
    user: 'b372441c3d3c7a',
    password: '589e4244',
    database : 'heroku_e3066e4346f4683'
});
connection.connect();


module.exports = connection;