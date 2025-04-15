var http = require('http');
var url = require('url');
var port = process.env.PORT || 3000;
//var port = 8080;   //uncomment to run local
console.log("This goes to the console window");
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  urlObj = url.parse(req.url,true)
  if (urlObj.pathname == "/") 
  {
     res.write ("Success!  This app is deployed online");
     res.write("<h2>This is my hello application</h2>");
     s = "<form method='get' action='/process'>" +
         "Enter the secret ID <input type='text' name='id'><br /><input type='submit'></form>"
     res.write(s)
     res.end()
  }
  else if (urlObj.pathname == "/process") {
  id = urlObj.query.id
  
  res.write ("The id is: " + id)
  res.end();
  console.log('hey')
  }
}).listen(port);
