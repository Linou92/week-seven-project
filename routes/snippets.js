const router = require('express').Router();
const mongoose = require('mongoose');
const { Client } = mongoose;

const User = require('../models/users');
const Snippet = require('../models/snippets');

function authRequired(req, res, next) {
  if (req.user) {
    next();
  } else {
    res.redirect('/login');
  };
};

function sortArrByDate(arr) {
  function compare(a, b) {
    if (a.createdAt < b.createdAt) {
      return -1;
    } else if (a.createdAt > b.createdAt) {
      return 1;
    } else {
      return 0;
    }
  }
  arr.sort(compare);
}

function sortArrByTitle(arr) {
  function compare(a, b) {
    if (a.title < b.title) {
      return -1;
    } else if (a.title > b.title) {
      return 1;
    } else {
      return 0;
    }
  }
  arr.sort(compare);
}

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

router.get('/snippet/add', authRequired, (req, res) => {
  data = {
    userid: req.user._id
  }
  res.render('add_snippet', data);
});

router.post('/snippet/add', (req, res) => {
  let tagsArr = req.body.tags.split(';');

  req.body.tags = clearSpace(tagsArr);
  req.body.creator = req.user.username;
  let d = new Date();
  req.body.createdAt = d.toDateString();
  const snippet = req.body;

  Snippet.create(snippet, (err, snippet) => {
    if (err) {
      throw err;
    } else {
      res.redirect('/profile');
    }
  });
});

router.get('/snippets/all', authRequired, (req, res) => {

  Snippet.find({}, (err, snippets) => {
    if (err) {
      console.log(err);
      res.redirect('/');
    } else {

      sortArrByDate(snippets);

      let data = {
        snippets,
        user: req.user.username,
        userid: req.user._id,
        favs: req.user.favs
      }
      res.render('all_snippets', data);
    }
  })
});

router.get('/snippets/favs', authRequired, (req, res) => {

  User.findById(req.user._id, (err, user) => {
    if (err) {
      throw err;
    } else {

      sortArrByTitle(req.user.favs);

      let data = {
        snippets: req.user.favs,
        user: req.user.username,
        userid: req.user._id,
        favs: req.user.favs
      }
      res.render('fav_snippets', data);
    }
  });

});

router.post('/search_snippets/:username?', authRequired, (req, res) => {
  let userInfo = req.user;
  let searchTerm = req.body.search;
  let searchBy = req.body.search_type;
  let updateObj = {};
  if (req.params.username) {
    updateObj.creator = req.params.username;
  }
  Snippet.find(updateObj, (err, snippets) => {
    if (err) {
      throw err;
      res.redirect('/');
    } else {

      sortArrByTitle(snippets);

      let username = '';

      if (req.params.username) {
        username = req.params.username;
      }

      let data = {
        snippets,
        searchTerm,
        searchBy,
        username,
        user: req.user.username,
        userid: req.user._id
      }

      res.render('search_snippets', data);
    }
  })
})

router.get('/tags/:searchterm', authRequired, (req, res) => {
  let searchTerm = req.params.searchterm;
  let username = req.user.username;
  let searchBy = 'tag';
  Snippet.find({}, (err, snippets) => {
    if (err) {
      console.log(err);
      res.redirect('/');
    } else {
      sortArrByTitle(snippets);
      let data = {
        snippets,
        searchTerm,
        searchBy,
        username,
        user: req.user.username,
        userid: req.user._id
      }

      res.render('search_snippets', data);
    }
  })
});

router.get('/snippets/user/:user', authRequired, (req, res) => {
  let searchBy = 'creator';
  let searchTerm = req.params.user;
  let username = searchTerm;
  Snippet.find({}, (err, snippets) => {
    if (err) {
      console.log(err);
      res.redirect('/');
    } else {
      sortArrByDate(snippets);
      let data = {
        snippets,
        searchTerm,
        username,
        searchBy,
        user: req.user.username,
        userid: req.user._id
      }

      res.render('search_snippets', data);
    }
  })
});

router.get('/edit/:snippetid', authRequired, (req, res) => {
  let snippetID = req.params.snippetid;
  Snippet.findById(snippetID, (err, snippet) => {
    if (err) {
      console.log(err);
      res.redirect('/profile');
    } else {

      let optionsArr = ['C', 'C#', 'C++', 'CSS', 'HTML', 'Java', 'Javascript', 'Less', 'Objective-C', 'Objective-C++', 'Perl', 'PHP', 'Python', 'Ruby', 'Sass', 'SCSS'];

      function makeOptions(arr, val) {
        let str = '';

        arr.forEach((item) => {
          if (val === item) {
            str += `<option value="${ item }" selected>${ item }</option>`;
          } else {
            str += `<option value="${ item }">${ item }</option>`;
          }
        })

        return str;
      }

      let data = {
        snippet,
        options: makeOptions(optionsArr, snippet.language),
        userid: req.user._id
      };

      res.render('edit_snippet', data);
    };
  });
});

router.post('/edit/:snippetid', (req, res) => {
  let snippetID = req.params.snippetid;
  let tagsArr = req.body.tags.split(';');

  req.body.tags = clearSpace(tagsArr);
  req.body.creator = req.user.username;
  let d = new Date();
  req.body.createdAt = d.toDateString();
  const snippet = req.body;

  Snippet.findByIdAndUpdate(snippetID, { $set: snippet }, (err, snippet) => {
    if (err) {
      throw err;
    } else {
      res.redirect('/profile');
    };

  });
});

router.post('/delete/:snippetid', (req, res) => {
  let snippetID = req.params.snippetid;
  Snippet.remove({ _id: snippetID }, (err) => {
    if (err) {
      throw err;
    } else {
      let data = {
        userid: req.user._id,
        username: req.user.username
      }
      res.redirect('/profile');
    }
  });
});

router.get('/api/codesnippets', (req, res) => {
  Snippet.find({}).then((results) => {
    res.json(results);
  });
});

router.post('/updatefavs/:action', (req, res) => {
  const action = req.params.action;
  const snippetID = req.body.id;
  const userID = req.body.userID;
  let updateObject;
  Snippet.findById(req.body.id, (err, favSnippet) => {
    if (err) {
      throw err;
    } else {
      if (action === 'pull') {
        updateObject = { $pull: { favs: favSnippet } };
      } else if (action === 'push') {
        updateObject = { $push: { favs: favSnippet } };
      }
      User.findByIdAndUpdate(userID, updateObject, (err, user) => {
        if (err) {
          throw err;
        } else {
          res.json(user);
        };
      });
    };
  });
});

module.exports = router;
