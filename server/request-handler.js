/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/

var requestHandler = function(request, response) {

  console.log("Serving request type " + request.method + " for url " + request.url);
  if (request.method === 'OPTIONS') serveOptions(request,response);
  else var data = assembleData(request, response);

};

// var _urls = {};
var storage = {'/classes/room1':[], '/classes/messages':[]};

var assembleData = function (request, response){
  var data = '';
  request.on('data', function(chunk){
    data += chunk;
  });

  request.on('end', function(){
    if (request.method === 'GET'){
      serveGet(request,response,data);
    } else if (request.method === 'POST'){
      servePost(request,response,data);
    }

  });
};

var serveGet = function (request, response, data){
  var statusCode;
  var reply = {results: []};
  var key = request.url;
  if(!storage.hasOwnProperty(key)) {
    statusCode = 404;
  } else {
    statusCode = 200;
    for(var i = 0; i < storage[key].length; i++) {
      reply.results.push(storage[key][i]);
    }
  }
  var headers = defaultCorsHeaders;
  response.writeHead(statusCode,headers);
  console.log(reply);
  response.end(JSON.stringify(reply));
};

var servePost = function (request, response, data){

  var parsedData = JSON.parse(data);
  var key = request.url;
  storage[key] = storage[key] || [];
  storage[key].push(parsedData);
  var statusCode = 201;
  var headers = defaultCorsHeaders;
  response.writeHead(statusCode,headers);
  response.end();
};

var serveOptions = function (request, response){
  var statusCode = 200;
  var headers = defaultCorsHeaders;
  headers['Content-Type'] = "text/plain";
  response.writeHead(statusCode, headers);
  response.end();
};

// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.
var defaultCorsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10, // Seconds.
};

exports.requestHandler = requestHandler;

