const router = require('express').Router(),
      passport = require('passport'),
      LocalStrategy = require('passport-local').Strategy,
      User = require('../models/users');

router.get('/login', (req, res) => {
  res.render('login');
});

router.post('/login', (req, res) => {
  User.authenticate(req.body.username, req.body.password, (err, user) => {
    if (err || user === false) {
      console.log('Problem logging in', err);
      res.redirect('/login');
    } else {
      console.log('Successful login');
      res.redirect('/');
    }
  });
});

router.get('/signup', (req, res) => {
  res.render('signup');
});

router.post('/signup', (req, res) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });
  user.save((err) => {
    if(err) {
      console.log('There was an error saving the user.', err);
    }
    res.redirect('/');
  });
});

module.exports = router;
