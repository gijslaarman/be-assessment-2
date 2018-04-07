'use strict'

var express = require('express'),
  mongo = require('mongodb'),
  bodyparser = require('body-parser'),
  session = require('express-session'),
  argon2 = require('argon2'),
  multer = require('multer'),
  upload = multer({ dest: 'db/profilepictures'}),
  port = 3000

require('dotenv').config()

// Create connection
var db = null
var url = `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}`

mongo.MongoClient.connect(url, function(err, client) {
  if (err) throw err
  db = client.db(process.env.DB_NAME)
})

express()
.set('view engine', 'ejs')
.set('views', 'view')
.use(express.static('assets'))
.use('/image', express.static('assets/images'))
.use(bodyparser.urlencoded({extended: true}))
.use(session({
  resave: false,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET
}))

.get('/', start) // Go to start or dashboard if the user is logged in.
.post('/log-in', login) // User logs in and goes to his dashboard.

.get('/sign-up', signupForm) //redirect to signupForm
.post('/sign-up', upload.single('photo'), signup) // Adds data from the registration form
.get('/log-out', logout)

.get('/myaccount', myAccount)
.get('/all', matches) // See list of all the users currently added
.get('/:id', getDetail) // Go to the detail page of the user
// Port
.listen(port)

// Title "template"

function myAccount(req, res) {
  var result = {
    title: undefined,
    user: undefined,
    error: undefined
  }

  if (req.session.user) {
    // Check if the user is logged in.
    result.title = 'Horeca Dating - Mijn Account'
    result.user = req.session.user

    renderPage(res, 'myaccount.ejs', result)
  } else {
    // No access to myAccount when you're not logged in.
    result.title = 'Horeca Dating - Verboden'
    result.error = {
        code: 401,
        details: 'Geen toegang'
      }

    renderPage(res, 'error.ejs', result)
  }

}

function start(req, res) {
  var result = {
    title: undefined,
    user: undefined,
    error: undefined
  }

  if (req.session.user) {
    // User is logged in
    result.title = 'Horeca Dating - Dashboard'
    result.user = (req.session.user)

    renderPage(res, 'dashboard.ejs', result)
  } else {
    // User is not logged in.
    result.title = 'Horeca Dating - Login'

    renderPage(res, 'login.ejs', result)
  }
}

function login(req, res) {
  var result = {
    title: undefined,
    user: undefined,
    error: undefined
  },
    email = req.body.email,
    password = req.body.password

  if (!email || !password) {
    // Email and password are not given
    result.title = 'Horeca Dating - login'
    result.error = 'Email of wachtwoord mist'

    renderPage(res, 'login.ejs', result)

  } else {
    db.collection('users').findOne({email: email}, done)
  }

  function done(err, user) {
    // All details of the user will be put into the user parameter
    if (user) {
      // Check if the hashed password matches the entered password, if true then it will continue to the onverify function.
      argon2.verify(user.password, password).then(onverify)
    } else if (err){
      throw err
    } else {
      // If the email cannot be found than it will display this error
      result.title = 'Horeca Dating - 401'
      result.error = 'Email bestaat niet'

      res.status(400)
      renderPage(res, 'login.ejs', result)
    }

    function onverify(match) {
      if (match) {
        // If the password matches the hashed password user logs in and starts his session.
        req.session.user = user
        res.redirect('/')
      } else {
        // If it's not a match that means the password is incorrect
        result.title = 'Horeca Dating - 401'
        result.error = 'Wachtwoord is niet correct'

        res
          .status(401)
          renderPage(res, 'login.ejs', result)
      }
    }
  }
}

function logout(req, res) {
  req.session.destroy(function (err) {
    if (err) {
      throw err
    } else {
      res.redirect('/')
    }
  })
}

function getDetail(req, res) {
  var id = req.params.id,
    result = {
      title: undefined,
      user: undefined,
      error: undefined
    }

  if (req.session.user) {

    if(id.length === 12 || id.length === 24) {
      db.collection('users').findOne({_id: mongo.ObjectId(id)}, done)

      function done(err, data) {
        if (data) {
          // When the db finds the user it will display the data
          result.title = 'Horeca Dating - Details'
          result.user = data

          renderPage(res, 'detail.ejs', result)
        } else if (err) {
          // Unknown error
          throw err
        } else {
          // if the id is the correct length but doesn't exist in MongoDb it will display the 404 error.
          result.title = 'Horeca Dating - Niet Gevonden'
          result.error = {
            code: 404,
            details: 'Pagina niet gevonden'
          }

          res.status(404)
          renderPage(res, 'error.ejs', result)
        }
      }

    } else {
      // If the user is logged in but the id is not correct send a 404 error.
      result.title = 'Horeca Dating - Niet Gevonden'
      result.error = {
        code: 404,
        details: 'Pagina niet gevonden'
      }

      res.status(404)
      renderPage(res, 'error.ejs', result)
    }

  } else {
    // If the user is not logged in, he/she will not have permission to view this page. The user will be redirected to the login screen and a message shows up saying that the user has to log in to view the information.
    result.title = 'Horeca Dating - Verboden'
    result.error = {
      code: 401,
      details: 'Pagina is niet bereikbaar, log in om deze pagina te bekijken.'
    }

    res.status(401)
    renderPage(res, 'error.ejs', result)
  }
}

function matches(req, res, next) {
  var result = {
    title: undefined,
    user: undefined,
    currentUser: undefined,
    error: undefined
  },
    currentUser = req.session.user

  if (currentUser) {
    db.collection('users').find({
      'gender': currentUser.preference.genderPref,
      'preference.genderPref': currentUser.gender,
      'age': { $gte: currentUser.preference.minAge, $lte: currentUser.preference.maxAge},
      'preference.days': {$in: currentUser.preference.days}
    }).toArray(done)
  } else {
    result.title = 'Horeca Dating - Geen Toegang'
    result.error = {
      code: 401,
      details: 'Geen toegang'
    }

    res.status(401)
    renderPage(res, 'error.ejs', result)
    return
  }


  function done(err, data) {
    if (err) {
      next(err)
    } else {
      result.title = 'Horeca Dating - Matches'
      result.currentUser = currentUser

      if (data.length === 0) {
        result.error = 'Er zijn geen matches gevonden.'
      } else {
        result.user = data
        var index = data.indexOf(currentUser._id)
        if (index !== -1) {
          data.splice(index, 1)
        }
      }

      renderPage(res, 'list.ejs', result)
    }
  }

}

function signupForm(req, res) {
  var result = {
    title: 'Horeca Dating - Registratie',
    user: undefined,
    error: undefined
  }

  res.render('registration.ejs', result)
}

function signup(req, res, next) {
  // Find the email in database and return a callback when found.
  var result = {
    title: 'Horeca Dating - Registratie',
    user: undefined,
    error: undefined
  },
    form = req.body
    form.file = req.file

  // Count the amount of emails with the same email adress
  db.collection('users').find({email: req.body.email}).count(check)

  function check(err, emailCount) {
    // RegExp from https://codereview.stackexchange.com/questions/65190/email-validation-using-javascript
    var regex = /^([0-9a-zA-Z]([-_\\.]*[0-9a-zA-Z]+)*)@([0-9a-zA-Z]([-_\\.]*[0-9a-zA-Z]+)*)[\\.]([a-zA-Z]{2,9})$/
    result.user = {
      firstname: form.firstname,
      lastname: form.lastname,
      age: form.age,
      email: form.email,
      place: form.place,
      preference: {
        minAge: form.minAge,
        maxAge: form.maxAge
      },
      bio: form.bio
    }

    if (emailCount > 0) {
      //Check if the email is already in the database
      result.error = 'Email is al in gebruik'

      res.status(409)
      renderPage(res, 'registration.ejs', result)
      return
    }
    else if (form.password !== form.passwordConfirm) {
      // Check if the passwords match.
      result.error = 'Wachtwoorden komen niet overeen'

      res.status(422)
      renderPage(res, 'registration.ejs', result)
      return
    } else if (!regex.test(form.email)) {
      // Checks the regex if the email entered is a valid email adres format
      result.error = 'Geen geldig email adres'

      res.status(422)
      renderPage(res, 'registration.ejs', result)
      return
    } else if (form.minAge > form.maxAge) {
      // Checks if the minimum age is not higher than the maximum age, if it is send back an error.
      result.error = 'De minimale leeftijd kan niet hoger zijn dan de maximale leeftijd'

      res.status(422)
      renderPage(res, 'registration.ejs', result)
      return
    } else {
      // If email is not already taken and passwords are correct, hash the password and insert data into database.
      argon2.hash(form.password).then(insertUser).catch(catchErr)
    }
  }
    function insertUser(hash) {
      db.collection('users').insertOne({
        firstname: form.firstname,
        lastname: form.lastname,
        age: form.age,
        gender: form.gender,
        place: form.place,
        email: form.email,
        password: hash,
        preference: {
          genderPref: form.preference,
          minAge: form.minAge,
          maxAge: form.maxAge,
          drink: form.drink,
          person: form.morningEvening,
          days: form.days
        },
        photo: form.photo,
        bio: form.bio
      }, done)
    }

    function catchErr(err) {
      result.title = 'Horeca Dating - Error'
      result.error = {
        code: null,
        details: err
      }

      renderPage(res, 'error.ejs', result)
    }

    function done(err, data) {
      if (err) {
        throw err
      } else {
        // No errors, so create a new session for the user and redirect the user to the dashboard
        db.collection('users').findOne({_id: data.insertedId}, setUpSession)
        }
      }

    function setUpSession(err, user) {
      user.password = null
      req.session.user = user

      res.redirect('/myaccount')
    }

  }



function renderPage(res, path, result) {
  res.format({
    json: function() {
      res.json(result)
    },
    html: function() {
      res.render(path, result)
    }
  })
}
