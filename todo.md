- Add avatar reminder step
- Implement shouldSkip properly
- Need to move category, role ids, etc. into environment
  variables
- Add example .env 
- Add documentation on how to get started

- Need to clean up channels somehow
- Could detect if someone is stuck and send them a message
  (needing timer - could be combined with cleanup function)
- Look into Postgres events and if I can subscribe to it
  instead of looping over and over again
  can also reason this module won't change all that much)

- (good first issue) Need to create new group if channels in group > 50

- Testing (this would really benefit from being mocked but I


## Refactoring
- should refactor all arguments to take an arguments object
  since many are optional depending on the curcumstance
