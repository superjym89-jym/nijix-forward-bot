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

function isPrivateChat(ctx) {
  return ctx.chat && ctx.chat.type === "private";
}

bot.start(async (ctx) => {
  if (!isPrivateChat(ctx)) return;

  await ctx.reply(
    "✅ NijiX Forward Bot Online\n\nSend me any text, X link, or photo here in private chat, and I will forward it to the target group."
  );
});

bot.command("ping", async (ctx) => {
  if (!isPrivateChat(ctx)) return;
  await ctx.reply("✅ Bot is online");
});

bot.command("myid", async (ctx) => {
  if (!isPrivateChat(ctx)) return;
  await ctx.reply(`Your Telegram user ID is: ${ctx.from.id}`);
});

bot.on("message", async (ctx) => {

  // DEBUG 查看 chat id
  console.log("CHAT ID:", ctx.chat.id);
  console.log("CHAT TYPE:", ctx.chat.type);

  try {

    // 只接受私聊
    if (!isPrivateChat(ctx)) return;

    // 只允许管理员使用
    if (!isAdmin(ctx)) {
      return;
    }

    const message = ctx.message;

    // 忽略 commands
    if (message.text && message.text.startsWith("/")) {
      return;
    }

    // 文字
    if (message.text) {

      await bot.telegram.sendMessage(
        TARGET_CHAT_ID,
        message.text,
        {
          disable_web_page_preview: false
        }
      );

      await ctx.reply("✅ Sent to group.");
      return;
    }

    // 图片
    if (message.photo) {

      const fileId =
        message.photo[message.photo.length - 1].file_id;

      await bot.telegram.sendPhoto(
        TARGET_CHAT_ID,
        fileId,
        {
          caption: message.caption || ""
        }
      );

      await ctx.reply("✅ Photo sent to group.");
      return;
    }

    await ctx.reply("⚠️ This message type is not supported yet.");

  } catch (error) {

    console.error("Forward error:", error.message);

    await ctx.reply("❌ Failed to forward.");
  }
});

bot.launch();

console.log("🚀 NijiX Forward Bot running...");

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));