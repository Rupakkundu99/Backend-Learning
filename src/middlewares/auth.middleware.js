import { Apierror } from "../utils/Apierror.js";
import { asynchandler } from "../utils/asynchandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.models.js";
export const verifyJWT=asynchandler(async(req,res,next)=>{
    
    try {
        const token=req.cookies?.accessToken|| req.header("Authorization")?.replace("Bearer"," ")
        if(!token){
            throw new Apierror(401,"Unauthorized Request")
        }
    
    
        const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        const user=await User.findById(decodedToken?._id).select("-password -refreshToken")
        if(!user){
            throw new Apierror(401,"Invalid access Token")
        }
    
        req.user=user;
        next()
    } catch (error) {
        throw new Apierror(401,error?.message||"Invalid User Token")
    }
})