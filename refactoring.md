# Refactoring
- Input validaion
  - ~It's not working~
  - ~Look at form validation libraries for syntax inpsiration~
  - ~Need to return specific error message~
- Channel creation
  - Name should include more than just the discriminator
  - First step logic is OK as long as it doesn't need
    processing instantly which won't ever? be true
- Handle event
  - feel like it needs to be abstracted into a method like
    handleInput or handleResponse
  - honestly, the processImmedaitely logic is gross - it might
    be better just to add an edge-case for the specific step
- Handle emoji
  - look into partials and what it means
- need to skip some steps if criteria is met

- Database code
  - Need to paramaterize argument
  - worried if too many setTimeeouts start that could cause
    trouble
  - not sure if Pool is best
  
- Error handing
  - logging
  - try and catch here and there


- Last step should block message input too (could be part of
  steps)
