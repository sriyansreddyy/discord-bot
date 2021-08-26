const got = require('got') 

const email = 'booker@booker.codes'
const CONVERT_KIT_API_SECRET = ''

function getSubscriberEndpoint() {
  const url = new URL('https://api.convertkit.com/v3/subscribers')
  url.searchParams.set('api_secret', CONVERT_KIT_API_SECRET)
  url.searchParams.set('email_address', email)
  return url.toString()
}

async function getConvertKitSubscriber(email) {
  const url = getSubscriberEndpoint(email)

  const {
    body: {
      subscribers: [subscriber = {state: 'inactive'}] = []} = {},
  } = await got(url.toString(), { 
    responseType: 'json'
  })

  return subscriber.state === 'active' ? subscriber : null
}


const foo () => {
  const discordTagId = ''
  const subscriber = answers.email
    ? await getConvertKitSubscriber(answers.email)
    : null
  if (subscriber) {
    await got.post(
      `https://api.convertkit.com/v3/tags/${discordTagId}/subscribe`,
      {
        responseType: 'json',
        json: {
          api_key: CONVERT_KIT_API_KEY,
          api_secret: CONVERT_KIT_API_SECRET,
          first_name: answers.name,
          email: answers.email,
          fields: {discord_user_id: member.id},
        },
      },
    )
  } else {
    // the main deifference in subscribing to a tag and subscribing to a
    // form is that in the form's case, the user will get a double opt-in
    // email before they're a confirmed subscriber. So we only add the
    // tag to existing subscribers who have already confirmed.
    await got.post(
      `https://api.convertkit.com/v3/forms/${discordForm}/subscribe`,
      {
        responseType: 'json',
        json: {
          api_key: CONVERT_KIT_API_KEY,
          api_secret: CONVERT_KIT_API_SECRET,
          first_name: answers.name,
          email: answers.email,
          fields: {discord_user_id: member.id},
          // It would make sense to include the tag here, however, doing this
          // will auto-confirm this new subscriber (no double-opt-in) which
          // we do not want to do. Luckily, the discordForm adds this tag
          // automatically so we don't need it anyway.
          // tags: [discordTagId],
        },
      },
    )

  }
}

const x = getSubscriberEndpoint()
console.log(x)
