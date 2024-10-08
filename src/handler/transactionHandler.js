const { connectToDatabase } = require('../utils/database');

async function saveTransaction(transaction) {
  const db = await connectToDatabase();
  const collection = db.collection('transactions');

  try {
    const result = await collection.insertOne(transaction);
    console.log("Transaction saved:", result.insertedId);
  } catch (error) {
    console.error("Error saving transaction:", error);
  }
}

module.exports = { saveTransaction };
