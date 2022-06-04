let hastebin = require('hastebin');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (!interaction.isButton()) return;
    if (interaction.customId == "open-ticket") {
      if (client.guilds.cache.get(interaction.guildId).channels.cache.find(c => c.topic == interaction.user.id)) {
       return interaction.reply({
          embeds: [new client.discord.MessageEmbed()
            .setTitle('<:no:945022600105578496> | Ocorreu um erro!')
            .setColor('2F3136') 
            .setDescription(`<@!${interaction.user.id}> Vc ja tem um ticket Criado.`)]}).then(() => {
              setTimeout(() => {
                  interaction.deleteReply()
              }, 5000)
          })
      };

      interaction.guild.channels.create(`👥・ticket-${interaction.user.username}`, {
        parent: client.config.categoriaTicket,
        topic: interaction.user.id,
        permissionOverwrites: [{
            id: interaction.user.id,
            allow: ["VIEW_CHANNEL", "SEND_MESSAGES", 'READ_MESSAGE_HISTORY'],
          },
          {
            id: client.config.roleSupport,
            allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
          },
          {
            id: interaction.guild.roles.everyone,
            deny: ["VIEW_CHANNEL"],
          },
        ],
        type: 'text',
      }).then(async c => {

        interaction.reply({ 
          embeds: [new client.discord.MessageEmbed()
        .setColor("2F3136")
      .setDescription(`Seu ticket foi criado no canal:<#${c.id}>`)] }).then(() => {
            setTimeout(() => {
                interaction.deleteReply()
            }, 5000)
        })

        
      
        const embed = new client.discord.MessageEmbed()
          .setColor('2F3136')
          .setAuthor(`${client.user.username} | TICKET`, client.user.displayAvatarURL())
          .setDescription(`Selecione a categoria do seu ticket de acordo com a sua necessidade.

        \*\*SUPORTE\*\*  ⛔ Caso tenha algum problema ou duvida 

        \*\*BUGS\*\*  🛠️ Caso encontre algum bug ou sofra algum bug

        \*\*DENUNCIA\*\*  ⚠️ Caso queira reportar algum player`)
          .setFooter(`${client.user.username}`, client.user.displayAvatarURL())
          .setTimestamp();

        const row = new client.discord.MessageActionRow()
          .addComponents(
            new client.discord.MessageSelectMenu()
            .setCustomId('category')
            .setPlaceholder('Selecione a categoria a baixo de acordo com a sua necessidade')
            .addOptions([{
                label: 'Suporte',
                value: 'suporte',
                emoji: '⛔',
              },
              {
                label: 'Reportar Bug',
                value: 'bug',
                emoji: '890272501584789544',
              },
              {
                label: 'Denuncia',
                value: 'denuncia',
                emoji: '922973404825530398',
              },
            ]),
          );

        msg = await c.send({
          content: `<@!${interaction.user.id}>`,
          embeds: [embed],
          components: [row]
        });

        const collector = msg.createMessageComponentCollector({
          componentType: 'SELECT_MENU',
          time: 20000
        });

        collector.on('collect', i => {
          if (i.user.id === interaction.user.id) {
            if (msg.deletable) {
              msg.delete().then(async () => {
                const embed = new client.discord.MessageEmbed()
                  .setColor('2F3136')
                  .setAuthor(`${client.user.username} | Ticket`, client.user.displayAvatarURL())
                  .setDescription(`
                  👋 <@!${interaction.user.id}> Bem Vindo ao seu ticket ${i.values[0]}

                  ⚠️  Espere ate que algum responsável atenda seu ticket 

                  🔰  Agradecemos pelo seu contato, lembre-se os tickets são privados apenas responsáveis conseguem ver o ticket`)
                  .setTimestamp();

                const row = new client.discord.MessageActionRow()
                  .addComponents(
                    new client.discord.MessageButton()
                    .setCustomId('close-ticket')
                    .setLabel('Feche o ticket')
                    .setEmoji('931331004549955584')
                    .setStyle('DANGER'),
                  );

                const opened = await c.send({
                  content: `<@&${client.config.roleSupport}>`,
                  embeds: [embed],
                  components: [row]
                });

                opened.pin().then(() => {
                  opened.channel.bulkDelete(1);
                });
              });
            };
            if (i.values[0] == 'denuncia') {
              c.edit({
                parent: client.config.categoriaDenuncia
              });
            };
            if (i.values[0] == 'bug') {
              c.edit({
                parent: client.config.categoriaBug
              });
            };
            if (i.values[0] == 'suporte') {
              c.edit({
                parent: client.config.categoriaSuporte
              });
            };
          };
        });

        collector.on('end', collected => {
          if (collected.size < 1) {
            c.send(`Nenhuma categoria selecionada. Encerramento de ticket...`).then(() => {
              setTimeout(() => {
                if (c.deletable) {
                  c.delete();
                };
              }, 5000);
            });
          };
        });
      });
    };

    if (interaction.customId == "close-ticket") {
      const guild = client.guilds.cache.get(interaction.guildId);
      const chan = guild.channels.cache.get(interaction.channelId);

      const row = new client.discord.MessageActionRow()
        .addComponents(
          new client.discord.MessageButton()
          .setCustomId('confirm-close')
          .setLabel('Feche o ticket')
          .setEmoji('931331004549955584')
          .setStyle('DANGER'),
          new client.discord.MessageButton()
          .setCustomId('no')
          .setLabel('Reabrir Ticket')
          .setEmoji('927394093179486239')
          .setStyle('SUCCESS'),
        );

      const verif = await interaction.reply({
        content:'Tem certeza de que deseja fechar o ticket?' ,
        components: [row]
    
      });

      const collector = interaction.channel.createMessageComponentCollector({
        componentType: 'BUTTON',
        time: 10000
      });

      collector.on('collect', i => {
        if (i.customId == 'confirm-close') {
          interaction.editReply({
            content: `Ticket fechado por <@!${interaction.user.id}>`,
            components: []
          });

          chan.edit({
              name: `⛔・closed-Ticket`,
              topic: `Ticket fechado : ${interaction.user.id}`,
              permissionOverwrites: [
                {
                  id: client.users.cache.get(chan.topic),
                  deny: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
                },
                {
                  id: client.config.roleSupport,
                  allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
                },
                {
                  id: interaction.guild.roles.everyone,
                  deny: ['VIEW_CHANNEL'],
                },
              ],
            })
            .then(async () => {
              const embed = new client.discord.MessageEmbed()
                .setColor('2F3136')
                .setAuthor(`${client.user.username} | Ticket`, client.user.displayAvatarURL())
                .setDescription('Clique no botao para excluiar o ticket')
                .setFooter(`${client.user.username}`, client.user.displayAvatarURL())
                .setTimestamp();

              const row = new client.discord.MessageActionRow()
                .addComponents(
                  new client.discord.MessageButton()
                  .setCustomId('delete-ticket')
                  .setLabel('Excluir o ticket')
                  .setEmoji('🗑️')
                  .setStyle('DANGER'),
                );

              chan.send({
                embeds: [embed],
                components: [row]
              });
            });

          collector.stop();
        };
        if (i.customId == 'no') {
          interaction.editReply({
            content: 'Reabrindo o ticket  !',
            components: [] }).then(() => {
              setTimeout(() => {
                  interaction.deleteReply()
              }, 2000)
          })

          collector.stop();
        };
      });

      collector.on('end', (i) => {
        if (i.size < 1) {
          interaction.editReply({
            content: 'Fechando o ticket cancelado !',
            components: []
          });
        };
      });
    };

    if (interaction.customId == "delete-ticket") {
      const guild = client.guilds.cache.get(interaction.guildId);
      const chan = guild.channels.cache.get(interaction.channelId);

      interaction.reply({
        content: 'Salvando mensagens...'
      });

      chan.messages.fetch().then(async (messages) => {
        let a = messages.filter(m => m.author.bot !== true).map(m =>
          `${new Date(m.createdTimestamp).toLocaleString('pt-PT')} - ${m.author.username}#${m.author.discriminator}: ${m.attachments.size > 0 ? m.attachments.first().proxyURL : m.content}`
        ).reverse().join('\n');
        if (a.length < 1) a = "Nothing"
        hastebin.createPaste(a, {
            contentType: 'text/plain',
            server: 'https://hastebin.com'
          }, {})
          .then(function (urlToPaste) {
            const embed = new client.discord.MessageEmbed()
              .setAuthor(`${client.user.username} | Logs Ticket`, client.user.displayAvatarURL())
              .setDescription(`♻️ Id do ticket \`${chan.id}\`
               Ticket criado por <@!${chan.topic}> 
               Ticket deletado por <@!${interaction.user.id}>`)
              .setColor('2f3136')
              .setTimestamp();
          

              const Rz2 = new client.discord.MessageActionRow()
          .addComponents(
            new client.discord.MessageButton()
            .setStyle('LINK')
            .setLabel('Log Ticket')
            .setEmoji('928504320519966721')
            .setURL(`${urlToPaste}`)
          );


              client.channels.cache.get(client.config.logsTicket).send({
              embeds: [embed], components: [Rz2]
              
            });
            chan.send('Fechando o Ticket...');

            setTimeout(() => {
              chan.delete();
            }, 2000);
          });
      });
    };
  },
};

;
