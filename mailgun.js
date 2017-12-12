const mailgun = require('mailgun.js')
// const request = require('request')
const jwt = require('jsonwebtoken')
const cache = require('memory-cache')

const mg = mailgun.client({
  domain: process.env.MAILGUN_DOMAIN,
  username: 'api',
  key: process.env.MAILGUN_API_KEY,
  public_key: process.env.MAILGUN_PUBLIC_KEY
})

function mandarMailConfirmacion (req, res) {
  mg.validate.get(req.body.mail)
    .then(validation => {
      if (!validation.is_valid) throw new Error('invalid-email')

      const token = jwt.sign({ mail: validation.address }, process.env.JWT_SECRET, { expiresIn: 60 * 60 * 24 * 2 })
      cache.put(validation.address, token, 1000 * 60 * 60 * 24 * 2)

      return mg.messages.create('mg.octa.digital', {
        from: "Test <test@mg.octa.digital>",
        to: [validation.address],
        subject: "Confirma tu email",
        text: `Valida tu mail yendo a localhost:3000/validar-email?token=${token}`,
        html: `<a href="localhost:3000/validar-email?token=${token}">validar mail</a>`
      })
    })
    .then(msg => {
      console.log(msg)
      res.status(200).end()
    })
    .catch(err => {
      console.log(err)
      let error = 'internal-error'
      switch (err) {
        case 'invalid-error':
          error = err
          break
      }
      res.status(500).json({ error })
    })
}

module.exports = { mandarMailConfirmacion }