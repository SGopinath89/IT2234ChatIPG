const express = require('express');
const mongoose =require('mongoose');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const cors =require('cors');by
const bcrypt = require('bcryptjs');
const User = require('./model/User');

dotenv.config();
mongoose.connect(process.env.MONGO_URL,(err) => {
    if(err) throw err;
});
const jwtSecret = process.env.JWT_SECRET;
const bcryptSalt = bcrypt.genSaltSync(10);

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    credentials:true,
    origin: process.env.CLIENT_URL,
}));

 app.get('/profile',(req,res) => {
    const token = req.cookies?.token;
    if(token){
        jwt.verify(token,jwtSecret,{}, (err,userData) => {
            if(err) throw err;
            const {id,Username} = userData;
            res.json(userData);
        });
    }else{
       res.status(401).json('no token');
    }
    
 });

 app.post('/login', async (req,res) => {
    const {Username,Password} = req.body;
    const foundUser = await User.findOne({Username});
    if(foundUser){
       const passOk = bcrypt.compareSync(Password,foundUser.Password);
       if(passOk){
        jwt.sign({UserId:foundUser._id,Username},jwtSecret,{}, (err,token) => {
            res.cookie('token' ,token,{sameSite:'none' , secure:true}).json({
                id:foundUser._id,
            });
        });
       } 
    }
 });


app.post('/register', async(req,res) => {
    const{Name,Email,Username,Password,EmployeeID} = req.body;
    try{
        const hashedPassword = await bcrypt.hashsync(Password,bcryptSalt);
        const createdUser = await User.create({
            Name,Email,
            Username:Username,
            Password:hashedPassword,
            EmployeeID
        });
        jwt.sign({userId:createdUser,_id,Username}, jwtSecret, {} ,(err,token) =>{
            if(err) throw err;
            res.cookie('token',token, {sameSite:'none' , secure:true}).status(201).json({
                id: createdUser._id,

            });
        });

    } catch(err){
        if(err) throw err;
        res.status(500).json('error');
    }
});

app.listen(4040);





//8aznFfmewwWJt3N0
//mongodb+srv://<username>:<password>@cluster0.jqq4yuo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0