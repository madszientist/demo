var http = require('http');
var port = process.env.PORT || 3000;
//var port = 8080;   //uncomment to run local
console.log("This goes to the console window");
http.createServer(function (req, res) 
{
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write ("Success!  This app is deployed online");
  res.write("<h2>This is my hello application</h2>");
  res.end();
  console.log('the end!')
}).listen(port);
