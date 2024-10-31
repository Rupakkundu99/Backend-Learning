import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config()
const userSchema=new Schema({
    userName:{
        required:true,
        unique:true,
        type:String,
        lowercase:true,
        trim:true,
        index:true
    },
    email:{
        required:true,
        type:String,
        trim:true,
        lowercase:true,
        unique:true,
    },
    fullname:{
        required:true,
        type:String,
        trim:true,
        lowercase:true,
    },
    avatar:{
        required:true,
        type:String
    },
    coverImage:{
        required:true,
        type:String
    },
    watchHistory:[{
        type:Schema.Types.ObjectId,
        ref:"Video"
    }
    ],
    password:{
        type:String,
        required:[true,"Password is required"]
    },
    refreshToken:{
        type:String
    }

},{
    timestamps:true
})

userSchema.pre("save",async function(next){
    if(!this.isModified("password")) return next();
    this.password=await bcrypt.hash(this.password,11)
    next()
})

//custom  methods

userSchema.methods.isPasswordCorrect=async function (password) {
   return await bcrypt.compare(password,this.password)//returns value in true or false on comparison
}

userSchema.methods.generateAccessToken=function(){
    jwt.sign({
        id:this._id,
        fullname:this._fullname,
        userName:this._userName,
        fullname:this._fullname
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
    )
}
userSchema.methods.generateRefreshToken=function(){
    return jwt.sign(
        {
            _id:this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User=mongoose.model("User",userSchema)