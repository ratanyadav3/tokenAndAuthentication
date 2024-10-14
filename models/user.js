import mongoose from "mongoose";
import dotenv from 'dotenv'
dotenv.config()

const connectDB = async()=>{
  try {
 
    const conn= await mongoose.connect(`${process.env.MONGODB_URI}/project1`);
    console.log(`MongoDB Connected successfully DB !! ${conn.connection.host}`);
   } catch (error) {
     console.log("MongoDB failed to connect");
     
   }
}
connectDB();


const userSchema = new mongoose.Schema({
  name:{
    type:String,
    required:[true,"This field is required"],
  },
  email:{
    type:String,
    required:true,
    unique:true,
  },
  username:{
    type:String,
    required:true,
    unique:true
  },
  password:{
    type:String,
    required:true,
    minlength: [6, "Password must be at least 6 characters long"],

  },
  posts:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Post'
  }],
  profilepic:{
    type:String,
    default:"default.png"
  }

},{timestamps:true})


export const User = mongoose.model("User",userSchema);















































// const mongoose = require('mongoose');

// mongoose.connect('mongodb://127.0.0.1:27017/miniProject1')

// const userSchema = mongoose.Schema({
//   name:String,
//   email:String,
//   username:String,
//   password:String,
//   post:{type:mongoose.Schema.Types.ObjectId,ref:'post'}
// })

// module.exports = mongoose.model('user',userSchema);