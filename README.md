# Scrimba Discord Bot

## Setup
This section outlines how to run the Scrimba Discord Onboarding bot locally for development purposes. This happens in two steps.
- Step one, Discord app
  - Head to the [Discord Developer Portal](https://discord.com/developers/applications) and click **New
  Application**. Name the application whatever you like (for example, `Scrimba Onboarding Bot`) then click **Create**
  - From the left-hand side menu, click **Bot** then **Add Bot**
  - For the newly-created bot, set the following options:
    - Toggle **Public bot** OFF
    - Toggle **Presence intent** ON
    - Toggle **Server members intent** ON
    - ℹ️ Remember to **Save changes**
  - From the same left-hand side menu, click **OAuth2**. On this page, you will find an **OAuth2 URL Generator**. To generate an OAuth2 URL:
    - From the "Scopes" list, check **bot** 
    - From the "Bot permissions" list, check **administrator**
    - As you check these options, the OAuth2 URL will dynamically generate. **Copy** the generated OAuth2 URL and navigate there. When promoted to "Add to server", choose the server you wish to add the bot to (for example, "Test Server"). Click **Continue** then **Authorize**
- Step two, Setup .env
  - _Optional and reccomended 💡: [Enable Developer Mode in Discord](https://discord.com/developers/docs/game-sdk/store#:~:text=Open%20up%20the%20Discord%20app,and%20enter%20your%20application%20ID) to expose helpful context_
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
