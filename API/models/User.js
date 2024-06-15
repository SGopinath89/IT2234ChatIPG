const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    Name: String,
    Email: { type: String, unique: true }, // Make Email unique to avoid duplicate entries
    Username: { type: String, unique: true },
    Password: String,
    EmplID: { type: String, unique: true }, // Ensure unique EmplID
  },
  {
    timestamps: true,
  }
);

const UserModel = mongoose.model('User', UserSchema);
module.exports = UserModel;



