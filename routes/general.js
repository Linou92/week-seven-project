const router = require('express').Router();
const mongoose = require('mongoose');
const { Client } = mongoose;

const User = require('../models/users');
const Snippet = require('../models/snippets');

router.get('/', (req, res) => {
  console.log(req.user);
  res.redirect('/login');
});

function authRequired(req, res, next) {
  if (req.user) {
    next();
  } else {
    res.redirect('/login');
  };
};

router.get('/home', authRequired, (req, res) => {
  console.log('the user', req.user);
  let data = req.user;
  data.userid = req.user._id;
  res.render('home', data);
});

router.get('/profile', authRequired, (req, res) => {
  let userInfo = req.user;
  Snippet.find({ creator: userInfo.username }, (err, snippets) => {
    if (err) {
      console.log(err);
      res.redirect('/');
    } else {
      console.log(snippets);
      function compare(a, b) {
        if (a.createdAt < b.createdAt) {
          return -1;
        } else if (a.createdAt > b.createdAt) {
          return 1;
        } else {
          return 0;
        }
      }

      snippets.sort(compare);

      let data = {
        snippets,
        userid: req.user._id,
        user: req.user.username
      }

      res.render('profile', data);
    }
  })
});

module.exports = router;
