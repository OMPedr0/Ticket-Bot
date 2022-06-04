const { Interaction } = require("discord.js");

module.exports = {
    name: 'ready',
    async execute(client) {
      console.log('Ticket Bot ready!')
      console.log('Obrigado por usar o Ticket Bot! Desenvolvido por OMPedr0');
      const oniChan = client.channels.cache.get(client.config.canalEmbed)
  
      function sendTicketMSG() {
        const embed = new client.discord.MessageEmbed()
          .setColor('2F3136')
          .setAuthor(`${client.user.username} | TICKET`, client.user.displayAvatarURL())
          .setDescription('Para obter \*\*SUPORTE\*\* abra um ticket clicando o botão a baixo')
          .setFooter('Lembre-se não abra um ticket sem necessidade')
        const row = new client.discord.MessageActionRow()
          .addComponents(
            new client.discord.MessageButton()
            .setCustomId('open-ticket')
            .setLabel('Criar Ticket')
            .setEmoji('896862545128861746')
            .setStyle('SECONDARY'),
          );
  
        oniChan.send({
          embeds: [embed],
          components: [row]
        })
      }
  
      const toDelete = 10000;
  
      async function fetchMore(channel, limit) {
        if (!channel) {
          throw new Error(`Expected channel, got ${typeof channel}.`);
        }
        if (limit <= 100) {
          return channel.messages.fetch({
            limit
          });
        }
  
        let collection = [];
        let lastId = null;
        let options = {};
        let remaining = limit;
  
        while (remaining > 0) {
          options.limit = remaining > 100 ? 100 : remaining;
          remaining = remaining > 100 ? remaining - 100 : 0;
  
          if (lastId) {
            options.before = lastId;
          }
  
          let messages = await channel.messages.fetch(options);
  
          if (!messages.last()) {
            break;
          }
  
          collection = collection.concat(messages);
          lastId = messages.last().id;
        }
        collection.remaining = remaining;
  
        return collection;
      }
  
      const list = await fetchMore(oniChan, toDelete);
  
      let i = 1;
  
      list.forEach(underList => {
        underList.forEach(msg => {
          i++;
          if (i < toDelete) {
            setTimeout(function () {
              msg.delete()
            }, 1000 * i)
          }
        })
      })
  
      setTimeout(() => {
        sendTicketMSG()
      }, i);
    },
  };
  