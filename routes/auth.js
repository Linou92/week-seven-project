const router = require('express').Router(),
      passport = require('passport'),
      User = require('../models/users');

router.get('/login', (req, res) => {
  const flashMessages = res.locals.getMessages();
  console.log(flashMessages);
  let data = {
    person: 'Austin'
  }
  if (flashMessages.error) {
    res.render('login', {
      showErrors: true,
      errors: flashMessages.error
    });
  } else {
    res.render('login', {user: req.user, errors: []});
  }
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/profile',
  failureRedirect: '/login',
  failureFlash: true
}));

router.get('/signup', (req, res) => {
  const flashMessages = res.locals.getMessages();
  console.log('FLASH MESSAGES========================', flashMessages.error);
  let errorsArray = flashMessages.error || [];
  console.log('value to be passed in', errorsArray);
  res.render('signup', {user: req.user, errors: errorsArray});
});

router.post('/signup', (req, res, next) => {

  req.checkBody('username', 'Username is required.').notEmpty();
  req.checkBody('password', 'Password is required.').notEmpty();

  req.getValidationResult().then((result) => {
    if (result.isEmpty() === false) {
      //bad
      console.log('errors is empty', result.isEmpty());
      result.array().forEach((error) => {
        req.flash('error', error.msg);
      });
      res.redirect('/signup');
    } else {
      //good
      const user = new User({
        username: req.body.username,
        password: req.body.password
      });
      user.save((err) => {
        if(err) {
          console.log('There was an error saving the user.', err);
          if (err.message.indexOf('duplicate key error') > -1) {
            req.flash('error', 'Username already in use.');
          } else {
            req.flash('error', 'There was a problem with your registration.');
          };
          console.log(req.flash);
          res.redirect('/signup');
        } else {
          next();
        }
      });
    }
  })

}, passport.authenticate('local', {
  successRedirect: '/home',
})
);

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/login');
});

module.exports = router;
