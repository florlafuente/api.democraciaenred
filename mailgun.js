const mailgun = require('mailgun.js')
const request = require('request')
const jwt = require('jsonwebtoken')
const cache = require('memory-cache')
const emailTemplate = require('./confirm-email-html')

const mg = mailgun.client({
  domain: process.env.MAILGUN_DOMAIN,
  username: 'api',
  key: process.env.MAILGUN_API_KEY,
  public_key: process.env.MAILGUN_PUBLIC_KEY
})

function mandarConfirmacion (req, res) {
  mg.validate.get(req.body.mail)
    .then(validation => {
      if (!validation.is_valid) return Promise.reject('invalid-email')
      return notInList(validation.address)
    })
    .then(mail => {
      const token = jwt.sign({ mail }, process.env.JWT_SECRET, { expiresIn: 60 * 60 * 24 * 2 })
      cache.put(mail, token, 1000 * 60 * 60 * 24 * 2)

      return mg.messages.create(process.env.MAILGUN_DOMAIN, {
          from: "Democracia en Red <no-reply@democraciaenred.org>",
          to: [ mail ],
          subject: "Confirma tu email",
          text: `Valida tu mail ingresando a ${process.env.HOST}/validar-email?token=${token}`,
          html: emailTemplate(token)
        })
      })
    .then(msg => {
      res.status(200).end()
    })
    .catch(err => {
      let error = 'internal-error'
      switch (err) {
        case 'invalid-email':
          error = err
          break
        case 'is-in-list':
          error = err
          break
      }

      res.status(error === 'internal-error' ? 500 : 400).json({ error })
    })
}

function notInList (mail) {
  return new Promise(function (resolve, reject) {
    request({
      url: `https://api.mailgun.net/v3/lists/test-encuesta@mg.octa.digital/members/${mail}`,
      json: true
    }, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        reject('is-in-list')
      } else {
        if (response.statusCode === 404) {
          return resolve(mail)
        }
        reject(error || response.statusCode)
      }
    }).auth('api', process.env.MAILGUN_API_KEY, false)
  })
}

function agregarEmail (req, res) {
  jwt.verify(req.query.token, process.env.JWT_SECRET, function(err, decoded) {
    if (err) return res.status(400).end()
    
    const savedToken = cache.get(decoded.mail)
    if (!savedToken || savedToken !== req.query.token) return res.status(400).end()

    request({
      url: `https://api.mailgun.net/v3/lists/test-encuesta@mg.octa.digital/members`,
      method: 'POST',
      form: { address: decoded.mail }
    }, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        cache.del(decoded.mail)
        res.status(200).end()
      } else {
        res.status(400).end()
      }
    }).auth('api', process.env.MAILGUN_API_KEY, false)
  })
}

module.exports = {
  mandarConfirmacion,
  agregarEmail
}