# Onboarding

- When a user joins: Create a channel
  like `welcome-${discriminator}` and make it accessible
  **only** to that user (and administrators)
- Channel needs to be in a Discord category like "Onboarding"
- Send them a series of welcome messages (steps) and read their
  response
- Should the bot fail, what happens then? I feel like
  storing state in memory is a bit dodgey; but then again, I
  can just reset the onboarding process


- Considerations
  - Input validation
  - Need to connect to the Scrimba database
  - Environment variables
  - Run as background process
  - Error logging
