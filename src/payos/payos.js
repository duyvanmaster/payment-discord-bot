const axios = require('axios');
const PayOS = require("@payos/node");
require('dotenv').config();

const payOS = new PayOS(process.env.PAYOS_CLIENT_ID, process.env.PAYOS_API_KEY, process.env.PAYOS_CHECKSUM_KEY);

module.exports = payOS;

// Phương thức kiểm tra trạng thái thanh toán bằng API getPaymentLinkInfo
module.exports.checkPaymentStatus = async function(orderCode) {
    try {
        const response = await axios.get(`https://api-merchant.payos.vn/v2/payment-requests/${orderCode}`, {
            headers: {
                'Authorization': `Bearer ${process.env.PAYOS_API_KEY}`
            }
        });
        return response.data.status === 'SUCCESS';  // Điều chỉnh theo cấu trúc phản hồi của API
    } catch (error) {
        console.error('Error checking payment status:', error);
        return false;
    }
};

// Phương thức hủy giao dịch
module.exports.cancelPayment = async function(orderCode) {
    try {
        const response = await axios.post(`https://api-merchant.payos.vn/v2/payment-requests/${orderCode}/cancel`, {}, {
            headers: {
                'Authorization': `Bearer ${process.env.PAYOS_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data.status === 'CANCELLED';  // Điều chỉnh theo cấu trúc phản hồi của API
    } catch (error) {
        console.error('Error canceling payment:', error);
        throw new Error('Error canceling payment');
    }
};
