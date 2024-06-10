const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true },
  expiresAt: { type: Date, required: true, index: true, expireAfterSeconds: 3600 } // Session expires after 1 hour (3600 seconds)
});

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;