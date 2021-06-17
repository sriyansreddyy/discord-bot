# Steps

When onboarding, there are a series of steps

1. Enter name
2. Enter email
2. Confirm bio

An ability to add more steps is desirable also.

The program cannot just run sequentially:

step1()
step2()
step3()

This is because the response is received through an event
called `message`.

When `message` is fired, we must determine which step the
message is in response to.

1. Could maintain state in-memory to keep track of each step
2. Could read Discord message history to determine the step 


Neither approach is bullet-proof. I thought if we use an
in-memory representation, that could be fragile if the bot
fails.

By reading the Discord message history to determine the
step, we solve that problem. We also add a bit more 
logic/processing and I think it will be fragile if I add
more questions or change the question text in the future.

So it's decided, we'll use in-state memory.

This will require us to keep track of users and their step.


How will I represent a step? ... must be a design pattern
for this lol


- function for each step with input validation and action

the consequence if the app crashes and there is someone
stuck in th onboarding channel is kind of dire. whereas if
the bot can learn it's own state, when the bot resumes all
will be well in the world.
