const mongoose = require('mongoose');
const AttSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timestamp: Date
});
module.exports = mongoose.model('Attendance', AttSchema);
