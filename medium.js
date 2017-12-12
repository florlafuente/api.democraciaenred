const request = require('request')
const moment = require('moment')

function getPublicaciones (req, res) {
  getMedium('serverless')
    .then(mediumResponse => {
      res.json(parsePublicaciones(mediumResponse, req.query.lang))
    })
    .catch(err => {
      console.log(err)
      res.status(500).end()
    })
}

function getMedium (tag) {
  var url = `https://medium.com/statuscode/tagged/${tag}?format=json&limit=4`
  return new Promise(function (resolve, reject) {
    request({
      url: url,
      json: true
    }, function (error, response, body) {
      if (!error && response.statusCode === 200) {
      jsonBody = JSON.parse(body.replace('])}while(1);</x>', ''))
        resolve(jsonBody)
      } else {
        reject(error || response)
      }
    })
  })
}

function parsePublicaciones (mediumResponse, lang) {
  const posts = Object.values(mediumResponse.payload.references.Post)
  let locale = 'es'

  if (lang === 'en') locale = 'en'
  moment.locale(locale)
  
  return posts.map(p => ({
    title: p.title,
    claps: p.virtuals.totalClapCount,
    createdAt: moment(p.createdAt).format('LT, dddd'),
    image: `https://cdn-images-1.medium.com/fit/t/370/300/${p.virtuals.previewImage.imageId}`
  }))
}

module.exports = { getPublicaciones }