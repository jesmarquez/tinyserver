var express = require('express');
var bodyParser = require('body-parser');
var hash = require('pbkdf2-password');
var session = require('express-session');

var app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.use(session({
  resave: false, // don't save session if unmodified
  saveUninitialized: false, // don't create session until something stored
  secret: 'shhhh, very secret'
}));

app.use(function(req, res, next){
  var err = req.session.error;
  var msg = req.session.success;
  delete req.session.error;
  delete req.session.success;
  res.locals.message = '';
  if (err) res.locals.message = '<p class="msg error">' + err + '</p>';
  if (msg) res.locals.message = '<p class="msg success">' + msg + '</p>';
  next();
});

var users = {
  tj: { name: 'tj' }
};

hash({ password: 'foobar' }, function (err, pass, salt, hash) {
  if (err) throw err;
  // store the salt & hash in the "db"
  users.tj.salt = salt;
  users.tj.hash = hash;
});

function authenticate(name, pass, fn) {
  if (!module.parent) console.log('authenticating %s:%s', name, pass);
  var user = users[name];
  // query the db for the given username
  if (!user) return fn(new Error('cannot find user'));
  // apply the same algorithm to the POSTed password, applying
  // the hash against the pass / salt, if there is a match we
  // found the user
  hash({ password: pass, salt: user.salt }, function (err, pass, salt, hash) {
    if (err) return fn(err);
    if (hash == user.hash) return fn(null, user);
    fn(new Error('invalid password'));
  });
}

function restrict(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    req.session.error = 'Access denied!';
    res.redirect('/login');
  }
}

app.get('/', function(req, res) {
  res.send('Que hubo!');  
})

app.post('/login', function(req, res){
  authenticate(req.body.username, req.body.password, function(err, user){
    if (user) {
      // Regenerate session when signing in
      // to prevent fixation
      req.session.regenerate(function(){
        // Store the user's primary key
        // in the session store to be retrieved,
        // or in this case the entire user object
        req.session.user = user;
        req.session.success = 'Authenticated as ' + user.name
          + ' click to <a href="/logout">logout</a>. '
          + ' You may now access <a href="/restricted">/restricted</a>.';
        res.redirect('back');
      });
    } else {
      req.session.error = 'Authentication failed, please check your '
        + ' username and password.'
        + ' (use "tj" and "foobar")';
      res.redirect('/login');
    }
  });
});

app.get('/api/listservers', function(req, res){

  let servers = [
    {
      "id": "1",
      "name": "augusta",
      "ipinterna": "175.16.3.6", 
      "ipexterna": "181.118.150.145",
      "dominio": "augusta.nobit.edu.co",
    },
    {
      "id": "2",
      "name": "api",
      "ipinterna": "165.18.3.6", 
      "ipexterna": "171.118.150.145",
      "dominio": "api.nobit.edu.co",
    },
    {
      "id": "3",
      "name": "clientes",
      "ipinterna": "175.16.3.6", 
      "ipexterna": "181.118.150.145",
    },
    {
      "id": "4",
      "name": "database",
      "ipinterna": "165.18.3.6", 
      "ipexterna": "171.118.150.145",
      "dominio": "database.nobit.edu.co",
    }
  ];

  res.send(servers);
})

app.listen(5000, function () {
  console.log("Tiny server is running on port 5000!");
})
