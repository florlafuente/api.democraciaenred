require('dotenv').config()

const express = require('express')
const multer = require('multer')

const {
  mandarConfirmacion,
  agregarEmail,
  mailContacto,
  mailTrabajo,
  mailTrabajoError
} = require('./lib/mailgun')

const {
  getPublicaciones
} = require('./lib/medium')

const {
  ALLOW_ORIGIN
} = process.env

const app = express()
const upload = multer({ limits: { fileSize: 5000000, files: 1 } }) // 1 file 5MB max

app.use(express.json())


app.all('/*', (req, res, next) => {
  res.header("Access-Control-Allow-Origin", ALLOW_ORIGIN)
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  next()
})

app.get('/publicaciones', getPublicaciones)

app.post('/validar-subscripcion', mandarConfirmacion)

app.get('/subscripcion', agregarEmail)

app.post('/contacto', mailContacto)

app.post('/trabajo', upload.single('cv'), mailTrabajo, mailTrabajoError)

app.use(function (err, req, res, next) {
  if (err.stack && err.code) {
    console.log('----------------------')
    console.error(err.code)
    console.log('**********************')
    console.error(err.stack)
  }
  if (!err.stack || !err.code) console.log(err)
  res.status(500).json({ error: 'internal-error' })
})

app.all('/*', (req, res) => res.status(404).end())

app.listen(3000)
