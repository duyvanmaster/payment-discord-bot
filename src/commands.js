const { REST, Routes } = require('discord.js');
const Discord = require("discord.js")
require('dotenv').config();

const commands = [
  {
    name: 'shop',
    description: 'Bảng giá hiệu ứng hồ sơ LegitVN',
  },
  ];


const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async (async) => {
    try {    
        await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID , process.env.GUILD_ID), { body: commands });
      } catch (error) {
        console.error(error);
      }
})();
