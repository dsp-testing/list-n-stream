#! /usr/bin/env node

var http = require('http');
var fs = require("fs");
var pathHelpers = require('path');
var beeline = require('beeline');
var packageJson = require('./package');
var program = require('commander');


program
  .version(packageJson.version)
  .option('-p, --port [port]', 'Run on a custom port')
  .parse(process.argv);

function serverError(response, error){
    console.log(error);
    response.statusCode = 500;
    response.end();
}

function serveDir(request, response, path){
    fs.readdir(path, function(error, files){
        if(error){
            serverError(response, error);
            return;
        }
        
        response.writeHead(200, {"Content-Type": "text/html"});
        response.end(
            '<a href="../">../</a><br>' +
            files.map(function(fileName){
            return '<a href="' + fileName + '">' + fileName + '</a>';
        }).join('<br>'));
    });
}

var router = beeline.route({
    '/`path...`': function(request, response, details){
        var path = __dirname + '/' + details.path;
        fs.stat(path, function(error, info){
            if(info.isDirectory()){
                serveDir(request, response, path);
            }else{
                fs.createReadStream(path)
                .pipe(response);
            }
        });
    }    
});

var server = http.createServer(router);

var port = program.port || process.env.PORT || 8080;

server.listen(port);

console.log('serving ' + __dirname + ' on ' + port);
