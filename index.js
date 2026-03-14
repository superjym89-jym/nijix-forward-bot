require("dotenv").config();
const { Telegraf } = require("telegraf");

const BOT_TOKEN = process.env.BOT_TOKEN;
const TARGET_CHAT_ID = process.env.TARGET_CHAT_ID;
const ADMIN_USER_ID = process.env.ADMIN_USER_ID;

if (!BOT_TOKEN || !TARGET_CHAT_ID || !ADMIN_USER_ID) {
  console.error("❌ Missing BOT_TOKEN / TARGET_CHAT_ID / ADMIN_USER_ID in .env");
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

function isAdmin(ctx) {
  return String(ctx.from.id) === String(ADMIN_USER_ID);
}

bot.start(async (ctx) => {
  await ctx.reply(
    "✅ NijiX Forward Bot Online\n\nSend me any message and I will forward it to the group."
  );
});

bot.command("ping", async (ctx) => {
  await ctx.reply("✅ Bot is online");
});

bot.command("myid", async (ctx) => {
  await ctx.reply(`Your Telegram user ID is: ${ctx.from.id}`);
});

bot.on("message", async (ctx) => {
  try {
    if (!isAdmin(ctx)) {
      await ctx.reply("⛔ You are not allowed to use this bot.");
      return;
    }

    const message = ctx.message;

    if (message.text) {
      await bot.telegram.sendMessage(
        TARGET_CHAT_ID,
        message.text,
        { disable_web_page_preview: false }
      );
    } else if (message.photo) {
      const fileId = message.photo[message.photo.length - 1].file_id;

      await bot.telegram.sendPhoto(
        TARGET_CHAT_ID,
        fileId,
        { caption: message.caption || "" }
      );
    } else {
      await ctx.reply("⚠️ This message type is not supported yet.");
      return;
    }

    await ctx.reply("✅ Sent to group.");
  } catch (error) {
    console.error("Forward error:", error.message);
    await ctx.reply("❌ Failed to forward.");
  }
});

bot.launch();
console.log("🚀 NijiX Forward Bot running...");

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));