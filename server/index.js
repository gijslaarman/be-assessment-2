'use strict'

const express = require('express')
const mongo = require('mongodb')

const bodyparser = require('body-parser')
const session = require('express-session')

const argon2 = require('argon2')
const mime = require('mime-types')

const port = 3000

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

.get('/', start) // Go to start
.post('/log-in', login) // User logs in and goes to his dashboard.

.get('/sign-up', signupForm) //redirect to signupForm
.post('/sign-up', signup) // Adds data from the registration form
.get('/log-out', logout)

.get('/dashboard', start)
.get('/myaccount', myAccount)
.get('/all', all) // See list of all the users currently added
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

    res.render('myaccount.ejs', result)
  } else {
    // No access to myAccount when you're not logged in.
    result
      .title = 'Horeca Dating - Verboden'
      .error = {
        code: 401,
        details: 'Geen toegang'
      }
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

    res.render('dashboard.ejs', result)
  } else {
    // User is not logged in.
    result.title = 'Horeca Dating - Login'

    res.render('login.ejs', result)
  }
}

function login(req, res) {
  var result = {
    title: undefined,
    user: undefined,
    error: undefined
  }
  var email = req.body.email
  var password = req.body.password

  if (!email || !password) {
    // Email and password are not given
    result.title = 'Horeca Dating - 400'
    result.error = 'Email of wachtwoord mist'

    res
      .status(400)
      .render('login.ejs', result)

    return
  }

  db.collection('users').findOne({email: email}, function (err, user) {
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

      res
        .status(401)
        .render('login.ejs', result)
      return
    }

    function onverify(match) {
      if (match) {
        console.log('Logged in ' + user.email)
        console.log(user)
        req.session.user = user
        console.log(req.session.user)
        res.redirect('/dashboard')
      } else {
        // If it's not a match that means the password is incorrect
        result.title = 'Horeca Dating - 401'
        result.error = 'Wachtwoord is niet correct'

        res
          .status(401)
          .render('login.ejs', result)
      }
    }
  })
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
  var id = req.params.id
  var result = {
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

          res.render('detail.ejs', result)
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

          res
            .status(404)
            .render('error.ejs', result)
        }
      }

    } else {
      // If the user is logged in but the id is not correct send a 404 error.
      result.title = 'Horeca Dating - Niet Gevonden'
      result.error = {
        code: 404,
        details: 'Pagina niet gevonden'
      }

      res
        .status(404)
        .render('error.ejs', result)
    }

  } else {
    // If the user is not logged in, he/she will not have permission to view this page. The user will be redirected to the login screen and a message shows up saying that the user has to log in to view the information.
    res
      .status(401)
      .send('401 not authorized')
  }
}

function all(req, res, next) {
  var result = {
    title: undefined,
    user: undefined,
    error: undefined
  }

  db.collection('users').find().toArray(done)

  function done(err, data) {
    if (err) {
      next(err)
    } else {
      result.title = 'Horeca Dating - Users'
      result.user = data

      res.render('list.ejs', result)
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
  }

  db.collection('users').find({email: req.body.email}).count(check)

  function check(err, emailCount) {
    if (emailCount > 0) {
      //Check if the email is already in the database
      result.user = {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        age: req.body.age
      }
      result.error = 'Email is al in gebruik'

      res
        .status(409)
        .render('registration.ejs', result)
      return
    }
    else if (req.body.password !== req.body.passwordConfirm) {
      // Check if the passwords match.
      result.error = 'Wachtwoorden komen niet overeen'
      result.user = {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        age: req.body.age,
        email: req.body.email
      }

      res
        .status(422)
        .render('registration.ejs', result)
      return
    }
    else {
      // If email is not already taken and passwords are correct, hash the password and insert data into database.
      argon2.hash(req.body.password).then(hash => {
        db.collection('users').insertOne({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        age: req.body.age,
        email: req.body.email,
        password: hash
        }, done)
      }).catch(function (err) {
        console.log(err)
      })
    }

    function done(err, data) {
      if (err) {
        next(err)
      } else {
        // No errors, so create a new session for the user and redirect the user to the dashboard
        db.collection('users').findOne({_id: data.insertedId}, function(err, user) {
          user.password = null
          req.session.user = user
          res.redirect('/myaccount')
        })
      }
    }
  }
}

function showErrorPage(err, code) {

  data = {
    img: code + '.png',
    code: code
  }
  res.format({
    json: () => res.json(result),
    html: () => res.render('error.ejs', {title: code, data: data})
  })
}
