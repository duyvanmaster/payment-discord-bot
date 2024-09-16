const { ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");
const { raw } = require("express");

const mainrow = new ActionRowBuilder()
        .addComponents(
          new StringSelectMenuBuilder()
            .setCustomId('select_menu')
            .setPlaceholder('Xem giá sản phẩm')
            .addOptions([
              {
                label: 'Regedit',
                description: 'Nhấn vào đây để xem bảng giá Regedit',
                value: 'regeditprice',
                emoji: '1066225725574742126'
              },
              {
                label: 'Tối Ưu',
                description: 'Nhấn vào đây để xem bảng giá Tối Ưu',
                value: 'optimizeprice',
                emoji:'1066226152798167080'
              },
              {
                label: 'Fixrecoil',
                description: 'Nhấn vào đây để xem bảng giá Fixrecoil',
                value: 'fixrecoilprice',
                emoji:'1203229939436879872'
              },
            ]),
        );

const newrow = new ButtonBuilder()
  .setCustomId("cancel_payment")
  .setLabel("Hủy thanh toán")
  .setStyle(ButtonStyle.Danger);

const componentRow = new ActionRowBuilder().addComponents(
  mainrow,
  newrow
);

module.exports = componentRow;