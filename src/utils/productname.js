function getProductDisplayName(productCode) {
    const productMapping = {
        toi_uu_gia_lap: "Tối ưu giả lập",
        regedit_config: "Regedit Config",
        regedit_limited: "Regedit Limited",

    };

    return productMapping[productCode] || productCode; // Trả về mã sản phẩm nếu không tìm thấy tên
}

module.exports =
{
    getProductDisplayName
}