require('dotenv').config()

const express = require('express')
const bodyParser = require('body-parser')

const { getPublicaciones } = require('./medium')
const {
  mandarConfirmacion,
  agregarEmail
} = require('./mailgun')

const app = express()

app.use(bodyParser.json())

app.all('/*', (req, res, next) => {
  res.header("Access-Control-Allow-Origin", process.env.ALLOW_ORIGIN)
  res.header('Access-Control-Allow-Methods', 'GET,POST')
  next()
})

app.get('/publicaciones', getPublicaciones)

app.post('/validar-subscripcion', mandarConfirmacion)

app.get('/subscripcion', agregarEmail)

var server = app.listen(process.env.PORT || 3000, function() {
  console.log('server listening on port ' + server.address().port)
})