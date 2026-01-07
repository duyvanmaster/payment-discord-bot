function getProductDisplayName(productCode) {
    const productMapping = {
        toi_uu_gia_lap: "Tối ưu giả lập",
        regedit_config: "Regedit Config",
        regedit_limited: "Regedit Limited",

    };

    return productMapping[productCode] || productCode; // Trả về mã sản phẩm nếu không tìm thấy tên
}

function getProductIcon(productCode) {
    const iconMapping = {
        toi_uu_gia_lap: "https://media.discordapp.net/attachments/1297206598904713248/1457763672117084171/code.png?ex=695d2fb7&is=695bde37&hm=39a52888ba9eb9f92059ab85045b195cb5c74f4ea195ea6e2352813c2be7c2dc&=&format=webp&quality=lossless&width=205&height=205",
        regedit_config: "https://media.discordapp.net/attachments/1297206598904713248/1457763641729355878/Registry_Editor_icon.png?ex=695d2fb0&is=695bde30&hm=7deeedd9a7578d1e7b5203336f3aa0d46555bb5b04cc6424d847f2cace30601c&=&format=webp&quality=lossless&width=410&height=410",
        regedit_limited: "https://media.discordapp.net/attachments/1297206598904713248/1457763641729355878/Registry_Editor_icon.png?ex=695d2fb0&is=695bde30&hm=7deeedd9a7578d1e7b5203336f3aa0d46555bb5b04cc6424d847f2cace30601c&=&format=webp&quality=lossless&width=410&height=410",
    };

    return iconMapping[productCode] || null;
}

module.exports =
{
    getProductDisplayName,
    getProductIcon
}