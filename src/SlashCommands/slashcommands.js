const { REST, Routes } = require('discord.js');
const Discord = require("discord.js")
require('dotenv').config();

const commands = [
    {
        name: 'qrcode',
        description: 'Tạo mã QR cho ngân hàng sử dụng VietQR',
        options: [
            {
                name: 'amount',
                type: 4, // INTEGER
                description: 'Số tiền (VND)',
                required: true
            },
            {
                name: 'bank',
                type: 3, // STRING
                description: 'Mã ngân hàng (Mặc định: OCB)',
                required: false,
                choices: [
                    { name: 'MBBank', value: '970422' },
                    { name: 'Vietcombank', value: '970436' },
                    { name: 'VietinBank', value: '970415' },
                    { name: 'BIDV', value: '970418' },
                    { name: 'Agribank', value: '970405' },
                    { name: 'OCB', value: '970448' },
                    { name: 'Techcombank', value: '970407' },
                    { name: 'ACB', value: '970416' },
                    { name: 'VPBank', value: '970432' },
                    { name: 'TPBank', value: '970423' },
                    { name: 'Sacombank', value: '970403' },
                    { name: 'HDBank', value: '970437' },
                    { name: 'VietCapitalBank', value: '970454' },
                    { name: 'SCB', value: '970429' },
                    { name: 'VIB', value: '970441' },
                    { name: 'SHB', value: '970443' },
                    { name: 'Eximbank', value: '970431' },
                    { name: 'MSB', value: '970426' },
                    { name: 'ViettelMoney', value: '971005' },
                    { name: 'VNPTMoney', value: '971011' },
                    { name: 'SaigonBank', value: '970400' },
                    { name: 'PVcomBank', value: '970412' },
                    { name: 'Oceanbank', value: '970414' },
                    { name: 'ShinhanBank', value: '970424' },
                    { name: 'ABBANK', value: '970425' }
                ]
            },
            {
                name: 'account',
                type: 3, // STRING
                description: 'Số tài khoản ngân hàng (Mặc định: 0988006094)',
                required: false
            },
            {
                name: 'accountname',
                type: 3, // STRING
                description: 'Tên tài khoản ngân hàng (Mặc định: TRAN VAN QUY)',
                required: false
            },
            {
                name: 'memo',
                type: 3, // STRING
                description: 'Ghi chú (Mặc định: legitvn)',
                required: false
            }
        ]
    },
    //     name: 'template',
    //     type: 3, // STRING
    //     description: 'Template QR code (e.g., compact, standard)',
    //     required: false,
    //     choices: [
    //         { name: 'Compact', value: 'compact' },
    //         { name: 'Qr Only', value: 'qr_only' },
    //         { name: 'Print', value: 'print' }
    //     ]
    // },
    // {
    //     name: 'media',
    //     type: 3, // STRING
    //     description: 'Loại media (e.g., .jpg, .png)',
    //     required: false,
    //     choices: [
    //         { name: 'JPG', value: '.jpg' },
    //         { name: 'PNG', value: '.png' }
    //     ]
    // }

    {
        name: 'legitvn',
        description: 'Dịch vụ LegitVN',
    },
    {
        name: 'sendmessage_file',
        description: 'Gửi tin nhắn hàng loạt bằng cách upload file JSON',
        options: [
            {
                name: 'file',
                type: 11, // ATTACHMENT type
                description: 'File JSON chứa danh sách userId',
                required: true
            }
        ]
    }
];


const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands });
        // Xóa tất cả global commands
        // await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: [] });
        // console.log('Đã xóa tất cả global commands!');
    } catch (error) {
        console.error('Lỗi khi xóa commands:', error);
    }
})();