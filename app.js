const express = require('express'),
      app = express(),
      bodyParser = require('body-parser'),
      ejs = require('ejs'),
      mongoose = require('mongoose');

let port = process.env.PORT || 3000;

mongoose.connect('mongodb://localhost:27017/code_snippets', { useMongoClient: true});
mongoose.Promise = global.Promise;

// const auth = passport.authenticate('local');

app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/', require('./routes/general'));
app.use('/', require('./routes/auth'));

app.listen(port, () => {
  console.log(`Your app is running on PORT ${ port }.`);
});
