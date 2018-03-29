'use strict'

const express = require('express')
const mongo = require('mongodb')
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
.get('/', start)
.post('/', add)
// Port
.listen(port)

function start(req, res) {
  res.render('login.ejs', {title: 'Horeca Dating'})
}

function add(req, res) {
dbUsers = db.collection('users').find()

  if (/* user doesn't exist yet */true) {
    db.add(user)
    res.redirect(`/${/**/}`)
  } else {
    console.log('User already exists')
    // error
  }
}
