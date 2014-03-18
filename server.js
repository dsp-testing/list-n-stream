#! /usr/bin/env node

var http = require('http');
var fs = require("fs");
var pathHelpers = require('path');
var beeline = require('beeline');
var packageJson = require('./package');
var program = require('commander');
var querystring = require('querystring');


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
            return '<a href="' + fileName + '/?view">' + fileName + '</a>';
        }).join('<br>'));
    });
}

var mimeTypes = {
    'avi': 'video/x-msvideo',
    'mpg': 'video/mpeg',
    'mpeg': 'video/mpeg',
    'mp4': 'video/mpeg'
}

var router = beeline.route({
    '/`path...`': function(request, response, details){
        var path = process.cwd() + '/' + details.path;
        fs.stat(path, function(error, info){
            if(error){
                serverError(response, error);
                return;
            }
            
            if(info.isDirectory()){
                serveDir(request, response, path);
            }else{
                var urlBits = request.url.split('?');
                if('view' in querystring.parse(urlBits[1])){
                    response.end('<video src="' + urlBits[0] + '" autoplay></video>')
                    return;
                }
                response.writeHead(200, {"Content-Type": mimeTypes[path.split('.').pop()] || 'text/plain'});
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
