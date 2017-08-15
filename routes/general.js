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
  res.render('add_snippet');
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
  Snippet.find({}, (err, snippets) => {
    if (err) {
      console.log(err);
      res.redirect('/');
    } else {
      console.log(snippets);
      function compare(a, b) {
        if (a.title < b.title) {
          return -1;
        } else if (a.title > b.title) {
          return 1;
        } else {
          return 0;
        }
      }

      snippets.sort(compare);
      let data = {
        snippets,
        user: req.user.username
      }
      res.render('all_snippets', data);
    }
  })
});

router.get('/profile', authRequired, (req, res) => {
  let userInfo = req.user;
  console.log('PROFILE INFO====================================', userInfo);
  Snippet.find({ creator: userInfo.username }, (err, snippets) => {
    if (err) {
      console.log(err);
      res.redirect('/');
    } else {
      console.log(snippets);
      function compare(a, b) {
        if (a.title < b.title) {
          return -1;
        } else if (a.title > b.title) {
          return 1;
        } else {
          return 0;
        }
      }

      snippets.sort(compare);

      res.render('profile', { snippets });
    }
  })
});

router.post('/search_snippets', authRequired, (req, res) => {
  let searchTerm = req.body.search;
  let searchBy = req.body.search_type;
  Snippet.find({}, (err, snippets) => {
    if (err) {
      console.log(err);
      res.redirect('/');
    } else {
      console.log(snippets);
      function compare(a, b) {
        if (a.title < b.title) {
          return -1;
        } else if (a.title > b.title) {
          return 1;
        } else {
          return 0;
        }
      }

      snippets.sort(compare);
      console.log('SEARCH BY=====================', searchBy);

      let data = {
        snippets,
        searchTerm,
        searchBy,
        user: req.user.username
      }

      res.render('search_snippets', data);
    }
  })
})

router.get('/tags/:searchterm', authRequired, (req, res) => {
  let searchTerm = req.params.searchterm;
  let searchBy = 'tag';
  Snippet.find({}, (err, snippets) => {
    if (err) {
      console.log(err);
      res.redirect('/');
    } else {
      console.log(snippets);
      function compare(a, b) {
        if (a.title < b.title) {
          return -1;
        } else if (a.title > b.title) {
          return 1;
        } else {
          return 0;
        }
      }
      snippets.sort(compare);

      let data = {
        snippets,
        searchTerm,
        searchBy,
        user: req.user.username
      }

      console.log('SEARCH BY=====================', searchBy);
      res.render('search_snippets', data);
    }
  })
});

router.get('/snippets/:user', authRequired, (req, res) => {
  let searchBy = 'creator';
  let searchTerm = req.params.user;
  Snippet.find({}, (err, snippets) => {
    if (err) {
      console.log(err);
      res.redirect('/');
    } else {
      console.log(snippets);
      function compare(a, b) {
        if (a.title < b.title) {
          return -1;
        } else if (a.title > b.title) {
          return 1;
        } else {
          return 0;
        }
      }

      snippets.sort(compare);
      console.log('SEARCH BY=====================', searchBy);
      res.render('search_snippets', {snippets, searchTerm, searchBy});
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
        options: makeOptions(optionsArr, snippet.language)
      };

      console.log('SNIPPET TO BE EDITED', snippet);
      res.render('edit_snippet', data);
    };
  });
});

router.get('/delete/:snippetid', authRequired, (req, res) => {
  let snippetID = req.params.snippetid;
  Snippet.findById(snippetID, (err, snippet) => {
    if (err) {
      console.log(err);
      res.redirect('/profile');
    } else {

      let data = {
        snippet,
      };

      console.log('SNIPPET TO BE DELETED', snippet);
      res.render('delete_snippet', data);
    };
  });
});

router.post('/delete/:snippetid', (req, res) => {
  let snippetID = req.params.snippetid;
  Snippet.remove({ _id: snippetID }, (err) => {
    if (err) {
      console.log(err);
    };
    res.redirect('/profile');
  });
});

module.exports = router;
