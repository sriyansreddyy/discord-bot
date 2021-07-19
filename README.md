# Scrimba Discord Bot

## Setup

- Head to the [Discord Developer Portal](https://discord.com/developers/applications) and click **New
Application**. Name the application whatever you like (for example, `Scrimba Onboarding Bot`) then click **Create**
- From the left-hand side menu, click **Bot** then **Add Bot**. 
- For the newly-created bot,
  - Turn **Public bot** off
  - Turn **Presence intent** on 
  - Turn **Server members intent** on 
  - Click **Save changes**
  - From the same left-hand side menu, click **OAuth2**. 
  - Using the **OAuth2 URL Generator**, check **bot** from the "SCOPES" list. Scroll down a little and check **administrator** from the "BOT PERMISSIONS" list. Finally, **Copy** the generated OAuth2 URL and navigate there  
  - When promoted to "ADD TO SERVER", choose the server you wish to add the bot to (for example, "Test Server"). Click **Continue** then **Authorize**. If went well, Discord will inform you
  that the bot has been authorized and you can safely close the window/tab

- Reccomended 💡: [Enable Developer Mode in Discord](https://discord.com/developers/docs/game-sdk/store#:~:text=Open%20up%20the%20Discord%20app,and%20enter%20your%20application%20ID) to expose helpful context
  menu items
- Create a role called **Regular Member**
- Create a channel category for onboarding channels
- Update `.env` with the Regular member role ID, onboarding
  channel category ID, and @everyone role ID (this one is
  created by Discord and cannot be renamed or removed)

## Example .env

```
DISCORD_BOT_TOKEN=
PG_URI=
ONBOARDING_CATEGORY_ID=
EVERYONE_ROLE_ID=
REGULAR_MEMBER_ROLE_ID=
```
