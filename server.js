var express = require('express');

var app = express();

app.get('/', function(req, res) {
  res.send('Que hubo!');  
})

app.post('/auth', function(req, res) {
  res.json({username});
})

app.listen(5000, function () {
  console.log("Tiny server is running on port 5000!");
})
