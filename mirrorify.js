/*
  Mirrorify, Sankha Narayan Guria <sankha93@gmail.com>
  Original site, well and good until server goes down
  https://github.com/sankha93/mirrorify
*/

var redis = require('redis');
var http = require('http');
var url = require('url');

var client = redis.createClient();

// error handler on connecting to Redis
client.on("error", function(err) {
    console.log(err);
});

// random URL generator
function generateId(length) {
    var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
    var id = '';
    for(i = 0; i < length; i++) {
        var rnum = Math.floor(Math.random() * chars.length);
        id += chars.substring(rnum, rnum + 1);
    }
    return id;
}

// checks and provides an unique URL everytime
function checkExists(id) {
    client.exists(id, function(err, reply) {
        if(reply == 0) checkExists(generateId(6));
    });
    return id;
}

// function to register the mirrors in the database
function createMirror(req, res) {
    var id = checkExists(generateId(6));
    var fullReq = '';
    
    // fetches the full JSON string from the request
    req.on('data', function(chunk) {
        fullReq += chunk;
    });
    
    // register the URLs in the database as mirrors
    req.on('end', function() {
        var body = require('querystring').parse(fullReq);
        client.set(id + ".time", body.timeout);
        client.set(id + ".url1", body.url1);
        client.set(id + ".url2", body.url2, function(err, reply) {
            var response = {};
            response.url = id;            
            res.writeHead(200, "OK", {'Content-Type': 'application/json'});
            res.write(JSON.stringify(response));
            res.end();
            console.log("Added a mirror at /" + id + " for " + body.url1);
        });
    });
}

// finally returns back the URL as a JSON string
function doFinal(res, first, url1, url2) {
    var response = {};
    if(first) response.url = url1;
    else response.url = url2;
    res.writeHead(200, "OK", {'Content-Type': 'application/json'});
    res.write(JSON.stringify(response));
    res.end();
}

// checks the first URL if it is responding
function tryFirstURL(res, key, url1, timeout) {
    var outReq = http.get(url.parse(url1, true))
    
    // if error in connection, provide the 2nd URL
    outReq.on('error', function(e) {
        outReq.abort();
        client.get(key + ".url2", function(err, reply) {
            doFinal(res, false, url1, reply);
        });
    });
    // in case of time out provide the 2nd URL
    outReq.on('socket', function(socket) {
        socket.setTimeout(timeout);
        socket.on('timeout', function() {
            outReq.abort();
            client.get(key + ".url2", function(err, reply) {
                doFinal(res, false, url1, reply);
            });
        });
    });
    outReq.end();
}

// fetches the first URL for the mirror and then tries it
function fetchMirror(req, res) {
    var key = req.url.substring(1);
    client.get(key + ".time", function(err, time) {
        client.get(key + ".url1", function(err, reply) {
            tryFirstURL(res, key, reply, time);
        });
    });
}

// creates a server socket to listen and process incoming connections
var server = http.createServer(function(req, res) {
    switch(req.url) {
        case '/create':
            createMirror(req, res);
            break;
        default:
            fetchMirror(req, res);
    }
});

// server listens on port 8000
server.listen(8000);
console.log("Server running on http://localhost:8000");