require('dotenv').config()

const express = require('express')

const { getPublicaciones } = require('./medium')
const {
  mandarConfirmacion,
  agregarEmail,
  mailSpeak
} = require('./mailgun')

const app = express()

app.use(express.json())

app.all('/*', (req, res, next) => {
  res.header("Access-Control-Allow-Origin", process.env.ALLOW_ORIGIN)
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  next()
})


app.get('/publicaciones', getPublicaciones)

app.post('/validar-subscripcion', mandarConfirmacion)

app.get('/subscripcion', agregarEmail)

app.post('/contacto', mailSpeak)

var server = app.listen(process.env.PORT || 3000, function() {
  console.log('server listening on port ' + server.address().port)
})