import dotenv from 'dotenv'
dotenv.config();

import express, { urlencoded } from 'express';
const app = express();
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt'
import { User } from './models/user.js';
import cookieParser from 'cookie-parser';

app.use(express.json());
app.use(urlencoded({extended:true}));
app.use(cookieParser());

app.set('view engine','ejs');


app.get('/',(req,res)=>{
    res.render('index');
})

app.get('/logout',(req,res)=>{
    res.clearCookie("token")
    res.redirect('/login');
})

app.post('/create',async(req,res)=>{
    console.log(req.body);
    const {name, email , username,password} = req.body;
    const user = await User.findOne({email});
    console.log(user);
    if(user) return res.status(500).send("user already exist");

    bcrypt.genSalt(10,(err,salt)=>{
        console.log(`Salt: ${salt}`);
        bcrypt.hash(password,salt,async(err,hash)=>{
            console.log(`hash: ${hash}`);
            const createdUser = await User.create({
                name,
                email,
                username,
                password:hash
            })
            console.log(createdUser);
            const token = jwt.sign({email,userId:createdUser._id},process.env.SECRET_KEY);
            res.cookie("token",token);
            res.redirect('/profile');
        })
    })
})

app.get('/login',(req,res)=>{
    res.render('login');
})

app.post('/login',async(req,res)=>{
    const {email , password} = req.body;
    const regUser = await User.findOne({email});
    if(!regUser) return res.status(500).send("create Account first").redirect('/');

    bcrypt.compare(password,regUser.password,(err,result)=>{
        if(result)
        {
            const token = jwt.sign({email ,userId:regUser._id},process.env.SECRET_KEY);
            res.cookie("token",token);
            res.redirect('/profile');
        }
    })
})

app.get('/profile',isLoggedIn,(req,res)=>{
    res.render('profile');
})

 function isLoggedIn(req,res,next){
    const token = req.cookies.token;
    if(!token) return res.status(500).redirect('/login');

    try {
        const data = jwt.verify(token,process.env.SECRET_KEY)
        console.log(data);
        next();
    } catch (error) {
        console.log(`token is expired `);
        res.redirect('/login');
    }

 }


app.listen(process.env.PORT,()=>{
    console.log(`server is running on port ${process.env.PORT}`);
    
})





















































// const cookieParser = require('cookie-parser');
// const express = require('express');
// const app = express();
// const userModel = require('./models/user');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken')

// app.use(express.json());
// app.use(express.urlencoded({extended:true}));
// app.use(cookieParser());

// app.set('view engine','ejs');

// app.get('/',(req,res)=>
// {
//     res.render('index');
// })

// app.post('/register',async(req,res)=>{
//     let{name,email,username,password} = req.body;
//     let user = await userModel.findOne({email});
//     if(user) return res.status(500).send("Email already exit");
//    bcrypt.genSalt(10,(err ,salt)=>{
//       bcrypt.hash(password,salt,async(err,hash)=>{
//         let createdUser =await userModel.create({
//             name,
//             email,
//             username,
//             password:hash
//         })
//         let token=jwt.sign({email:email,userid:createdUser._id},"shhhh");
//         res.cookie("token",token);
//         res.send("user Successfully registered");
//       })
//     })
// })

// app.post('/login',async(req,res)=>{
//     console.log(req.body);
//     let {email,password}=req.body;
//     let user = await userModel.findOne({email});
//     if(!user) return res.send("Something went wrong");
//     bcrypt.compare(password,user.password,(err,result)=>{
//         if(result){
//            let token= jwt.sign({email,userid:user._id},"shhhh")
//            res.cookie("token",token);
//            res.redirect('/profile');
//         }
//         else{
//             return res.status(500).send("Something Went wrong");
//         }
//     })
// })

// app.get('/login',(req,res)=>{
//     res.render('login');
// })

// app.get('/logout',(req,res)=>{
//     res.clearCookie("token");
//     res.redirect('/login');
// })

// app.get('/profile',islogin,(req,res)=>{
//     res.render('profile');
// })
 
// function islogin(req, res, next) {
//     const token = req.cookies.token;
    
//     // Check if the token exists
//     if (!token) {
//         return res.redirect('/login');
//     }

//     try {
//         // Verify the token
//         let data = jwt.verify(token, "shhhh");
//         console.log(data);
//         req.user = data;
//         next();
//     } catch (error) {
//         // Handle invalid token or expired token errors
//         return res.redirect('/login');
//     }
// }

 
// app.listen(4000,()=>{
//     console.log("Your App Is Running");
// });
