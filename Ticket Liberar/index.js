const fs = require('fs');
const {
  Client,
  Collection,
  Intents
} = require('discord.js');
const config = require('./config.json');

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS],
});

const Discord = require('discord.js');
client.discord = Discord;
client.config = config;

client.commands = new Collection();

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const event = require(`./events/${file}`);
    client.on(event.name, (...args) => event.execute(...args, client));
};

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction, client, config);
  } catch (error) {
    console.error(error);
    return interaction.reply({
      content: 'Houve um erro ao executar este comando!',
      ephemeral: true
    });
  };
});

client.on("messageCreate", message => {
    
  if (message.author.bot) return;
  if (message.channel.type == '')
  return
  if(message.content == `<@${client.user.id}>` || message.content == `<@!${client.user.id}>`) {
  let bot = new Discord.MessageEmbed()
  .setTitle(`・MINHAS INFORMAÇÃO・<:944597149658234930:942838603820711997>`)
  .setColor("2F3136")
  .setDescription(`**\n🤖 ・MEU NOME \n** ・${client.user.tag}** 
  \n🤖・Precisa de ajuda? Entre: \n** ・https://discord.gg/5wZesP376G** 
  \n💻・PING \n** ・${client.ws.ping}** ms 
  \n🧑‍💻・CRIADOR \n** ・<@304725037548699669>**`)
  message.channel.send({ embeds: [bot] })
  }
})

client.login(require('./token.json').token);
