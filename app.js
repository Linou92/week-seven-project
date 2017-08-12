const express = require('express'),
      app = express(),
      bodyParser = require('body-parser'),
      ejs = require('ejs'),
      local = require('passport-local'),
      mongoose = require('mongoose'),
      passport = require('passport'),
      session = require('express-session'),
      validator = require('express-validator');

let port = process.env.PORT || 3000;

app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/', require('./routes/general'));
app.use('/', require('./routes/auth'));

app.listen(port, () => {
  console.log(`Your app is running on PORT ${ port }.`);
});
