const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  name: String,
  aadhaar: { type: String, match: /^\d{12}$/ },
  descriptor: [Number]         // face descriptor vector
});
module.exports = mongoose.model('User', UserSchema);

