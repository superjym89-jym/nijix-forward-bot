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

function extractXLink(text) {
  if (!text) return null;

  const regex =
    /(https?:\/\/(?:www\.)?(?:x\.com|twitter\.com)\/[A-Za-z0-9_]+\/status\/\d+)/i;

  const match = text.match(regex);
  return match ? match[1] : null;
}

bot.start(async (ctx) => {
  await ctx.reply(
    "✅ NijiX Forward Bot Online\n\nSend me an X post link and I will forward it to the target group."
  );
});

bot.command("ping", async (ctx) => {
  await ctx.reply("✅ Bot is online");
});

bot.command("myid", async (ctx) => {
  await ctx.reply(`Your Telegram user ID is: ${ctx.from.id}`);
});

bot.on("text", async (ctx) => {
  try {
    const senderId = String(ctx.from.id);

    if (senderId !== String(ADMIN_USER_ID)) {
      await ctx.reply("⛔ You are not allowed to use this bot.");
      return;
    }

    const text = ctx.message.text.trim();
    const xLink = extractXLink(text);

    if (!xLink) {
      await ctx.reply("⚠️ Please send a valid X post link.");
      return;
    }

    const message =
`🚨 NijiX New Post

🔗 ${xLink}`;

    await bot.telegram.sendMessage(TARGET_CHAT_ID, message);
    await ctx.reply("✅ Sent to target group.");
  } catch (error) {
    console.error("Forward error:", error.message);
    await ctx.reply("❌ Failed to forward message.");
  }
});

bot.launch();
console.log("🚀 NijiX Forward Bot running...");

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));