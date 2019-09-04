import app from '../../app';

export default async () => {
  console.log('[MixMaster] Bot is running...');
  console.log(
    '',
    `• ${app.users.size} users\n`,
    `• ${app.channels.size} channels\n`,
    `• ${app.guilds.size} servers\n`
  );
  app.user.setActivity(`Prefix: ${process.env.APP_PREFIX}`);
};
