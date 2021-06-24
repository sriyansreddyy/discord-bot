# Partials

To detect reactions using the `messageReactionAdd` event,
partials must be enabled.

In short, if the message is not cached, `messageReactionAdd`
will not fire UNLESS partials are enabled.

I assume this is because if the message is not cached,
there is not a 100% chance of success. Therefore, we must
opt-in and handle the potentioal edge-case accordingly by
checking `if (message.partial)`. It seems unlikely to happen
but I might eat my words.


When the bot sends a message it seems to cache. If the bot
is reset, the cache is reset which means we cannot rely on
the cache. 

When the bot is in a stable release, it's unlikely to reset
so I feel quite confident this won't be a prevelent issue.

---

Confusingly, partials and intents get conflated. 

There is an intent we can set but I don't think it's needed
at this time. Intents don't seem to have an impact. All my
experimentation seems to reveal that ALL intents are
unlocked. It could be to do with how my bot is configured
(it has maximum privs)

