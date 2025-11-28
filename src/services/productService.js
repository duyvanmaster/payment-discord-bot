const { getProductInfo } = require('../firebase/firebaseService');
const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

async function createFreeProductEmbed(selectedSubProduct) {
    const products = await getProductInfo();
    const product = products.freeproductInfo[selectedSubProduct];
    if (!product) {
        return {
            embed: new EmbedBuilder()
                .setTitle("Sản phẩm không hợp lệ")
                .setDescription("Không tìm thấy thông tin sản phẩm")
                .setColor(0xFF0000)
                .setTimestamp(),
            components: []
        };
    }

    const linkButton = new ButtonBuilder()
        .setLabel('Tải xuống')
        .setURL(product.downloadLink || 'https://discord.gg/legitvn')
        .setStyle(ButtonStyle.Link);

    const row = new ActionRowBuilder().addComponents(linkButton);

    const embed = new EmbedBuilder()
        .setTitle(product.title || 'Không có tiêu đề')
        .setDescription(product.description || 'Không có mô tả')
        .setImage(product.imageUrl)
        .setFooter({
            text: "Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!",
            iconURL: 'https://r2.e-z.host/2825fb47-f8a4-472c-9624-df2489f897c0/rf2o4ffc.png'
        })
        .setTimestamp();

    return { embed, components: [row] };
}

module.exports = {
    createFreeProductEmbed,
    getProductInfo,
};
