const mongoose =require('mongoose');

const UserSchema = new mongoose.Schema({
    Name:{type: String, unique:true},
    Email: String,
    Username: String,
    Password: String,
    EmployeeID: String,
}, {timestamps:true});

const UserModel = mongoose.model('USer',UserSchema);
module.exports = UserModel;