/*
 * @package jsDAV
 * @subpackage DAV
 * @copyright Copyright(c) 2011 Ajax.org B.V. <info AT ajax.org>
 * @author Mike de Boer <info AT mikedeboer DOT nl>
 * @author Wouter Vroege <wouter AT woutervroege DOT nl>
 * @license http://github.com/mikedeboer/jsDAV/blob/master/LICENSE MIT License
 */
"use strict";

/*

Addressbook/CardDAV server example

This server features CardDAV support

*/

// Database driver to use. 'redis' is the default, but feel free to use anything 
// else supported by jsDAV
var DB_DRIVER = "mongo";

var jsDAV = require("./../lib/jsdav");
jsDAV.debugMode = true;
var jsDAV_Auth_Backend = require("./../lib/DAV/plugins/auth/" + DB_DRIVER);
var jsDAVACL_PrincipalBackend = require("./../lib/DAVACL/backends/" + DB_DRIVER);
var jsCardDAV_Backend = require("./../lib/CardDAV/backends/" + DB_DRIVER);
// node classes:
var jsDAVACL_PrincipalCollection = require("./../lib/DAVACL/principalCollection");
var jsCardDAV_AddressBookRoot = require("./../lib/CardDAV/addressBookRoot");
// plugins:
var jsDAV_Auth_Plugin = require("./../lib/DAV/plugins/auth");
var jsDAV_Browser_Plugin = require("./../lib/DAV/plugins/browser");
var jsCardDAV_Plugin = require("./../lib/CardDAV/plugin");
var jsDAVACL_Plugin = require("./../lib/DAVACL/plugin");

var Db = require("./../lib/shared/backends/" + DB_DRIVER);
var DB_INIT = require("./data/addressbook/" + DB_DRIVER);

// Make sure this setting is turned on and reflect the root url for your WebDAV server.
// This can be for example the root / or a complete path to your server script
var baseUri = "/";

// Arguments to be passed to the function that establishes a connection with the db
var DB_ARGS = {
    host: "localhost",
    db: "jsdav",
    port: 27017
};

// Database connection
Db.getConnection(DB_ARGS, function (err, conn) {
    if (err)
    	throw err;
    
    var db = conn;

    DB_INIT.init(db, false, function (err) {
        if (err) throw err;

        var authBackend = jsDAV_Auth_Backend.new(db);
        var principalBackend = jsDAVACL_PrincipalBackend.new(db);
        var carddavBackend = jsCardDAV_Backend.new(db);

        var nodes = [
        jsDAVACL_PrincipalCollection.new(principalBackend),
        jsCardDAV_AddressBookRoot.new(principalBackend, carddavBackend)];


        // Setting up the directory tree

        jsDAV.createServer({
            node: nodes,
            baseUri: baseUri,
            authBackend: authBackend,
            realm: "jsDAV",
            plugins: [jsDAV_Auth_Plugin, jsDAV_Browser_Plugin, jsCardDAV_Plugin, jsDAVACL_Plugin]
        }, 8000);

    })
});