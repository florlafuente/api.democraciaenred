const express = require('express')
const { getPublicaciones } = require('./medium')

require('dotenv').config()

const app = express()

app.all('/*', (req, res, next) => {
  res.header("Access-Control-Allow-Origin", process.env.ALLOW_ORIGIN)
  res.header('Access-Control-Allow-Methods', 'GET,POST')
  next()
})

app.get('/publicaciones', getPublicaciones)

var server = app.listen(process.env.PORT || 3000, function() {
  console.log('server listening on port ' + server.address().port)
})