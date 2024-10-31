import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config()
import { D_NAME } from "../constants.js";

const connectdb=async()=>{
    try {
       const connetionInstance= await mongoose.connect(`${process.env.MONGODB_URI}/${D_NAME}`)
        console.log(`MONGODB connected DB HOST:${connetionInstance.connection.host}`);
        // console.log(connetionInstance);
        
    } catch (error) {
        console.log("MONGODB connection error",error);
        process.exit(1)
    }
}

export default connectdb