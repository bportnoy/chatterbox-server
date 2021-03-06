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

var prevID;

if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./storage');
  var prevID = -1;
  localStorage.setItem('prevID',prevID);
}

localStorage.setItem('/classes/room1', []);
localStorage.setItem('classes/messages', []);
prevID = localStorage.getItem('prevID');

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
  // !storage.hasOwnProperty(key)
  var item = localStorage.getItem(key);
  if(item === null) {
    statusCode = 404;
  } else {
    item = JSON.parse(item);
    statusCode = 200;
    for(var i = 0; i < item.length; i++) {
      reply.results.push(item[i]);
    }
  }
  var headers = defaultCorsHeaders;
  response.writeHead(statusCode,headers);
  // console.log('Sending GET response: \n' + JSON.stringify(reply));
  response.end(JSON.stringify(reply));
};

var servePost = function (request, response, data){

  var parsedData = JSON.parse(data);
  var key = request.url;
  item = localStorage.getItem(key);
  if (item === null) item = [];
  else item = JSON.parse(item);
  parsedData.objectId = ++prevID;
  localStorage.setItem('prevID',prevID);
  item.push(parsedData);
  localStorage.setItem(key, JSON.stringify(item));
  var statusCode = 201;
  var headers = defaultCorsHeaders;
  response.writeHead(statusCode,headers);
  console.log('POST created: \n' + data + '\n at URL' + key
    + 'with ID: ' + parsedData.objectId);
  response.end();
};

var serveOptions = function (request, response){
  var statusCode = 200;
  var headers = defaultCorsHeaders;
  headers['Content-Type'] = "text/plain";
  response.writeHead(statusCode, headers);
  response.end();
};

var defaultCorsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10, // Seconds.
};

exports.requestHandler = requestHandler;

