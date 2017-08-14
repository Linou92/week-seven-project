const router = require('express').Router();
const mongoose = require('mongoose');

const User = require('../models/users');
const Snippet = require('../models/snippets');

router.get('/', (req, res) => {
  console.log(req.user);
  res.render('index');
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
  res.render('home', req.user);
});

router.get('/add_snippet', authRequired, (req, res) => {
  res.render('add_snippet', req.user);
});

router.post('/add_snippet', (req, res) => {
  console.log('no array', req.body);
  let tagsArr = req.body.tags.split(';');

  // eliminate any white space at the beginning or end of each element in the array
  function clearSpace(arr) {
    let newArr = [];
    arr.forEach((item) => {
      while (item[0] === ' ') {
        let newItem = item.slice(1, item.length);
        item = newItem;
      }
      while (item[item.length - 1] === ' ') {
        let newItem = item.slice(0, item.length - 1);
        item = newItem;
      }
      if (item !== '') {
        newArr.push(item);
      }
    });
    return newArr;
  };

  req.body.tags = clearSpace(tagsArr);
  req.body.creator = req.user.username;
  let d = new Date();
  req.body.createdAt = d.toDateString();
  const snippet = req.body;

  console.log('with array', snippet);

  let newSnippet = Snippet.create(snippet, (err) => {
    if (err) {
      console.log(err);
      res.redirect('/add_snippet');
    } else {
      User.findById(req.user._id, (err, user) => {
        if (err) {
          console.log(err);
          res.redirect('/add_snippet');
        } else {
          user.snippets.push(snippet);
          user.save((err) => {
            if (err) {
              console.log(err);
              res.redirect('/add_snippet');
            } else {
              res.redirect('/home');
            }
          })
        }
      })
    }
  });


});

router.get('/snippets/all', authRequired, (req, res) => {
  res.render('all_snippets');
});

router.get('/profile', authRequired, (req, res) => {
  let userInfo = req.user;
  res.render('profile', userInfo);
});

module.exports = router;
