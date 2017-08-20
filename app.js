const express = require('express'),
      app = express(),
      bodyParser = require('body-parser'),
      ejs = require('ejs'),
      expressValidator = require('express-validator'),
      flash = require('express-flash-messages'),
      mongoose = require('mongoose'),
      passport = require('passport'),
      session = require('express-session');

require('dotenv').config();

let port = process.env.PORT || 3000;
let url = process.env.MONGODB_URI;

mongoose.connect(url, { useMongoClient: true});
mongoose.Promise = global.Promise;

// const auth = passport.authenticate('local');

app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(session({
  secret: 'asdfqwerty',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
require('./passportconfig').configure(passport);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(expressValidator());
app.use('/', require('./routes/general'));
app.use('/', require('./routes/auth'));
app.use('/', require('./routes/snippets'));

app.listen(port, () => {
  console.log(`Your app is running on PORT ${ port }.`);
});
