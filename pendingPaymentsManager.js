const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'pendingPayments.json');

function loadPendingPayments() {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return {};
  }
}

function savePendingPayments(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

module.exports = {
  loadPendingPayments,
  savePendingPayments
};

console.log('Module exports:', module.exports);
