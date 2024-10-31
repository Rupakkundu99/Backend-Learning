import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
const videoSchema=new Schema({
    videofile:{
        type:String,
        required:true,

    },
    thumbnail:{
        required:true,
        type:String
    },
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    duration:{
        type:Number,
        required:true
    },
    views:{
        default:0,
        type:Number
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }

},{
    timestamps:true
})

videoSchema.plugin(mongooseAggregatePaginate)

export const Video=mongoose.model("Video",videoSchema)