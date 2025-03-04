# Scrimba Discord Bot

## Setup
This section outlines how to run the Scrimba Discord Onboarding bot locally for development purposes. This happens in three distinct steps.
- Step one, create and configure your Discord app
  - Head to the [Discord Developer Portal](https://discord.com/developers/applications) and click **New
  Application**. Name the application whatever you like (for example, "Scrimba Onboarding Bot") then click **Create**
  - From the left-hand side menu, click **Bot** then **Add Bot**
  - For the newly-created bot, set the following options:
    - Toggle **Public bot** OFF
    - Toggle **Server members intent** ON (allows the bot to subscribe to member-related events like `guildMemberAdd`)
    - ℹ️ Remember to click **Save changes**
  - From the same left-hand side menu, click **OAuth2**. On this page, you will find an **OAuth2 URL Generator**. To generate an OAuth2 URL:
    - From the "Scopes" list, check **bot** 
    - From the "Bot permissions" list, check the following permissions:
      - **Manage Roles** (allows bot to `overwritePermissions` and assign roles )
      - **Manage Channels** (allows bot to create and delete channels)
      - **Kick Members** (allows bot to kick members if inactive)
      - **Manage Nicknames** (allows bot to set onboardee nickname)
    - As you check these options, the OAuth2 URL will dynamically generate. **Copy** the generated OAuth2 URL and navigate there. 
    - When promoted to "Add to server", choose the server you wish to add the bot to (for example, "Test Server"). Click **Continue** then **Authorize**
    - You should now see your bot under the Integrations page and a new role by the same name as your bot will have been created. 
- Step two, configure your local environment variables
  - Before going further, enable [Developer Mode in Discord](https://discord.com/developers/docs/game-sdk/store#:~:text=Open%20up%20the%20Discord%20app,and%20enter%20your%20application%20ID) to expose an otherwise hidden (and super handy) "Copy ID" context menu item
  - If you have not already, create a role to be assigned to members who complete the onboarding (for example, "Onboarded member"). Once you have created the role (and enabled developer mode), right click the role and click **Copy ID**
  - Now you've created a role to be assigned to members who complete the onboarding, make sure the bot's role (for example, "Scrimba Onboarding Bot") is higher up in the list (by dragging it) - the bot cannot assign roles higher in the list than it's own
  - Using the same context menu item, copy the "@everyone" role ID
  - Create a [channel category](https://support.discord.com/hc/en-us/articles/115001580171-Channel-Categories-101), under which new onboarding channels will be created by the bot (for example, "Onboarding channels"). Using the same context menu item, copy the channel category ID
  - Head to the [Discord Developer Portal](https://discord.com/developers/applications) and find the bot you created in step one. **Copy** the token
  - IMPORTANT: This documentation should still be helpful
    but the following environment variables are
    undocumented: `UNLOCKED_INTRODUCTIONS_CHANNEL_ROLE_ID`,
    `KARMA_NOTIFICATIONS_CHANNEL_ID` and `CONVERT_KIT_*`
  - Update .env:
    ```
    DISCORD_BOT_TOKEN=
    PG_URI=
    ONBOARDING_CATEGORY_ID=
    EVERYONE_ROLE_ID=
    REGULAR_MEMBER_ROLE_ID=
    PRO_ROLE_ID=
    CONVERT_KIT_API_KEY=
    CONVERT_KIT_API_SECRET=
    CONVERT_KIT_TAG_ID=
    CONVERT_KIT_FORM_ID=
    UNLOCKED_INTRODUCTIONS_CHANNEL_ROLE_ID=
    KARMA_NOTIFICATIONS_CHANNEL_ID=
    ```
- Step three, run the bot 
  - Run `npm install`
  - Run `npm start`  
