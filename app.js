import dotenv from 'dotenv'
dotenv.config();

import express, { urlencoded } from 'express';
const app = express();
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt'
import { User } from './models/user.js';
import { Post } from './models/post.js';
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

app.get('/profile',isLoggedIn,async(req,res)=>{
    const user = await User.findById(req.user.userId).populate('posts');
    res.render('profile',{user});
})

app.get('/like/:id',isLoggedIn,async(req,res)=>{
    const post = await Post.findById(req.params.id).populate('user');
    if(post.likes.indexOf(req.user.userId)=== -1)
    {
        post.likes.push(req.user.userId);
    }
    else{
        post.likes.splice(post.likes.indexOf(req.user.userId),1);
    }
    await post.save();
    res.redirect('/profile');
    
})

app.get('/edit/:id',isLoggedIn,async(req,res)=>{
    const post = await Post.findById(req.params.id)
    res.render('edit',{post});
})

app.post('/update/:id',isLoggedIn,async(req,res)=>{
    console.log(req.body.content);
    const post = await Post.findOneAndUpdate(
        { _id: req.params.id }, 
        { content: req.body.content },
        { new: true }  // This ensures the updated document is returned
    );
    
    res.redirect('/profile');
})

app.post('/post',isLoggedIn,async(req,res)=>{
    const user = await User.findById(req.user.userId);
    const {content}= req.body;
    const post = await Post.create({
        userId:user._id,
        content
    })
    user.posts.push(post._id);
    await user.save();
    res.redirect('/profile');
})

 function isLoggedIn(req,res,next){
    const token = req.cookies.token;
    if(!token) return res.status(500).redirect('/login');

    try {
        const data = jwt.verify(token,process.env.SECRET_KEY)
        req.user = data;
        next();
    } catch (error) {
        console.log(`token is expired `);
        res.redirect('/login');
    }

 }


app.listen(process.env.PORT,()=>{
    console.log(`server is running on port ${process.env.PORT}`);
    
})
