const got = require('got') 
require('dotenv').config()

const { CONVERT_KIT_API_KEY, CONVERT_KIT_API_SECRET, CONVERT_KIT_TAG_ID, CONVERT_KIT_FORM_ID } = process.env

const fetchSubscriber = async email => {
  const url = new URL('https://api.convertkit.com/v3/subscribers')
  url.searchParams.set('api_secret', CONVERT_KIT_API_SECRET)
  url.searchParams.set('email_address', email)

  const { body } = await got(url.toString(), {
    responseType: 'json'
  })

  return body.subscribers.shift()
}

const addTag = async email => {
  const subscriber = await fetchSubscriber(email)
  console.log("subscriber", subscriber)
  if (subscriber) {
    const response = await got.post(
      `https://api.convertkit.com/v3/tags/${CONVERT_KIT_TAG_ID}/subscribe`,
      {
        responseType: 'json',
        json: {
          api_key: CONVERT_KIT_API_KEY,
          api_secret: CONVERT_KIT_API_SECRET,
          email: email
        },
      },
    )
    console.log("addTag response", response.body)
  } else {
    await got.post(
      `https://api.convertkit.com/v3/forms/${CONVERT_KIT_FORM_ID}/subscribe`,
      {
        responseType: 'json',
        json: {
          api_key: CONVERT_KIT_API_KEY,
          api_secret: CONVERT_KIT_API_SECRET,
          email: email
        },
      },
    )
  }
}

(async () => {
  await addTag("booker+4@booker.codes")
})()
