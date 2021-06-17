BOT: Hello, welcome to The Scrimba Discord. What should we call
you?
ONBOARDEE: Alex
BOT: Great! What is your email?
ONBOARDEE: alex@scrimba.com
BOT: Awesome. Watch this video and respond with a ✅ when
done
ONBOARDEE: <REACTS with ✅>
BOT: Welcome to the server



^^ 

- parse all messages in the channel
- if message == question, the next response could be an
  answer - more likely, the response before the next
  bot message  is a validated answer



  ----



const steps = [
  {
    question: "Welcome to the Scrimba Discord. What should
    we call you?",
    process: async (answer, member) => await
    member.setNickname(answer)
  },
  {
    question: "Great! What is your email?",
    process: (answer) => null
  },
  {
    question: "Awesome. Watch this video and respond with a ✅",
    process: () => null
  }
]

// could be message or emoji reaction (for which I bet there
is an API)
handleAnswer()
