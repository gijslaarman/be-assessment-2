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
const htmltitle = 'Horeca Dating - '

function myAccount(req, res) {
  console.log(req.session.user)
  res.render('myaccount.ejs', {title: htmltitle + 'my Account'})
}

function start(req, res) {
  if (req.session.user) {
    res.render('dashboard.ejs'), {title: htmltitle + 'dashboard'}
  } else {
    // User is not logged in.
    res.render('login.ejs'), {title: htmltitle + 'Login'}
  }
}

function login(req, res) {
  var email = req.body.email
  var password = req.body.password

  if (!email || !password) {
    // Email and password are not given
    res
      .status(400)
      .send('Username or password are missing')

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
      // If the email cannot be found than it will
      res
        .status(401)
        .send('Username does not exist')
      return
    }

    function onverify(match) {
      if (match) {
        console.log('Logged in ' + user.email)
        req.session.user = {username: user.email}
        res.redirect(301, '/dashboard')
      } else {
        res
          .status(401)
          .send('Password incorrect')
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

  if (/* id doesn't exist */ false) {
    db.collection('users').findOne({
      $contains:{id}
    })
  } else {
    db.collection('users').findOne({
      _id: mongo.ObjectId(id)
    }, done)
  }


  function done(err, data) {
    var result = {title: htmltitle + 'details', data: data}

    if (err) {
      throw err
    } else {
      res.render('detail.ejs', result)
    }
  }
}

function all(req, res, next) {
  db.collection('users').find().toArray(done)

  function done(err, data) {
    if (err) {
      next(err)
    } else {
      res.render('list.ejs', {data: data, title: htmltitle + 'lijst'})
    }
  }
}

function signupForm(req, res) {
  res.render('registration.ejs', {title: htmltitle + 'registration'})
}

function signup(req, res, next) {
  // Find the email in database and return a callback when found.
  db.collection('users').find({email: req.body.email}).count(check)

  function check(err, emailCount) {
    console.log(emailCount)
    if (emailCount > 0) {
      res
        .status(409)
        .send('Email already taken.')
      return
    }
    else if (req.body.password !== req.body.passwordConfirm) {
      // Check if the passwords match.
      res
        .status(400)
        .send('Passwords do not match.')
      return
    }
    else {
      // If email is not already taken and passwords are correct, hash the password and insert data into database.
      var pwd = req.body.password
      argon2.hash(pwd).then(hash => {
        db.collection('users').insertOne({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        age: req.body.age,
        email: req.body.email,
        password: hash
        }, done)
      }).catch(err => {
        console.log(err)
      })
    }
    function done(err, data) {
      if (err) {
        next(err)
      } else {
        // req.session.user = {username: username}
        res.redirect('/' + data.insertedId)
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
