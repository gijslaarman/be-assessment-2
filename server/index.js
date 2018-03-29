'use strict'

const express = require('express')
const mongo = require('mongodb')
const bodyparser = require('body-parser')
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
.use(bodyparser.urlencoded({extended: true}))
.get('/', start)
.get('/all', all)
.get('/registration', registration)
.get('/:id', getdetail)
.post('/', add)
// Port
.listen(port)

// Title "template"
const htmltitle = 'Horeca Dating - '

function start(req, res) {
  res.render('login.ejs', {title: htmltitle + 'Login'})
}

function registration(req, res) {
  res.render('registration.ejs', {title: htmltitle + 'registration'})
}

function getdetail(req, res) {
  var id = req.params.id
  db.collection('users').findOne({
    _id: mongo.ObjectID(id)
  }, done)

  function done(err, data) {
    var result = {title: htmltitle + 'details', data: data}

    if (err) {
      next(err)
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

function add(req, res, next) {
  db.collection('users').insertOne({
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    age: req.body.age,
    email: req.body.email,
    password: req.body.password
  }, done)

  function done(err, data) {
    if (err) {
      next(err)
    } else {
      res.redirect('/' + data.insertedId)
    }
  }
}
