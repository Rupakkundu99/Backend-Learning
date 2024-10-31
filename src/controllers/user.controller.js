import {asynchandler} from "../utils/asynchandler.js";
import {Apierror} from "../utils/Apierror.js"
import {User} from "../models/user.models.js"
import { uploadCloudinary } from "../utils/cloudinary.js";
import {Apiresponse} from "../utils/Apiresponse.js";
import jwt from "jsonwebtoken";
// Control flow of the code
// Get user details from frontend
// validation-must not be empty
// check if same user exist or not:useername and email
// Check for images or avatarsnp
// upload time ot cloudinary,avatar
// create user object - create entry in DB
// remove password and refresh token field from response 
// check for user creation  `
// return res

const generateAccessandRefreshTokens=async(userId)=>{
    try{
        const user=await User.findById(userId)

        const accessToken=user.generateAccessToken()

        const refreshToken=user.generateRefreshToken()

        user.refreshToken=refreshToken
        user.save({validateBeforeSave:false})

        return{accessToken,refreshToken}
    }
    catch{
        throw new Apierror(500,"Something went wrong while generating refresh and access token")
    }
}


const registerUser=asynchandler(async(req,res)=>{
    res.status(200).json({
        message:"ok"
    }) 
    const {fullname,userName,password,email}=req.body
    // console.log(email);

    if([fullname,email,userName,password].some((field)=>field?.trim()===""))
    //To check whether if any of the above is empty or not
    {
        throw new Apierror(400,"all fields are required")

    }   //Enter the required fields and check  their credentials and the credibility before deployement

    const existedUser=await User.findOne({
        $or:[{email},{userName}]
    })

    if(existedUser){
        throw new Apierror(409,"User with email or userName exists") 
    }

    const avatarLocalPath=req.files?.avatar[0]?.path;
    // const imageLocalPath=req.files?.coverImage[0]?.path;
    if (!avatarLocalPath) {
        throw new Apierror(400,"Avatar file is required");
    }

    let coverImageLocalpath;

    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
        coverImageLocalpath=req.files.coverImage[0].path;
    }


    const avatar=await uploadCloudinary(avatarLocalPath)

    const coverImage=coverImageLocalpath?await uploadCloudinary(coverImageLocalpath):null

    if(!avatar){
        throw new Apierror(400,"Upload a avatar image")
    }
    
    const user=await User.create({
        fullname,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        email,
        userName:userName.toLowerCase(),
        password
    })
    const createdUser=await User.findById(user._id).select(
        "-password -refreshToken"
    )//To check user is created or not

    if(!createdUser){
        throw new Apierror(500,"Something went wrong while registering the user")
    }

    return res.status(201).json(
        new Apiresponse(200,createdUser,"User registered successfully")
    )
})

const loginUser=asynchandler(async(req,res)=>{
    //ToDos for login
    //req body->data
    //email or username 
    //find the user
    //if found check password
    //access and refresh token
    //send cookie and sense successfull reponse
    const {email,userName,password}=req.body
    if(!(userName||email)){
        throw new Apierror(400,"Username or email is required")
    }
    
    const user=await User.findOne({
        $or:[{userName},{email}]
    })

    if(!user){
        throw new Apierror(404,"User does not exits sign up now! ")
    }

    const isPasswordValid=await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new Apierror(401,"Incorrect password for the given UserName")
    }

    const {accessToken,refreshToken}=await generateAccessandRefreshTokens(user._id)

    const loggedInUser=await User.findById(_id).select("-password -refreshToken")//removes thhe data not required

    const options={
        httpOnly:true,
        secure:true
    }//Only server can modify and not frontend

    return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options).json(
        new Apiresponse(200,{
            user:loggedInUser,accessToken,refreshToken
        },
    "User logged in successfully"
    )
    )
})
    const logOutUser=asynchandler(async (req,res)=>{
        //Remove cookies and reset refresh token
        //To remove that we need a custom middleware to remove and reset the data 
        await User.findByIdAndUpdate(
            req.user._id,
            {
                $set:{
                    refreshToken:undefined
                }
            },{
                new:true
            }
        )
        const options={
            secure:true,
            httpOnly:true
        }
        return res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken",options).json(new Apiresponse(200,{},"User logged Out"))
})
  
    const refreshAccessToken=asynchandler(async(req,res)=>{

        const incomingRefreshToken=req.cookies.refreshToken||req.body.refreshToken
        if(!incomingRefreshToken){
            throw new Apierror(401,"Unauthorized request")
        }

       try {
         const decodedToken=jwt.verify(
             incomingRefreshToken,
             process.env.REFRESH_TOKEN_SECRET
         )
         const user=User.findById(decodedToken?._id)
 
         if(!user){
             throw new Apierror(401,"Invalid refresh Token")
         }
 
         if(incomingRefreshToken!=user?.refreshToken){
             throw new Apierror(401,"Refresh token Expired")
         }
 
     const options={
         httpOnly:true,
         secure:true
     }
 
     const {newaccessToken,newrefreshToken}=await generateAccessandRefreshTokens(user._id)
 
     return res
     .status(201)
     .cookie("newaccessToken",newaccessToken,options)
     .cookie("newrefreshToken",newrefreshToken,options)
     .json(
         new Apiresponse(200,
             {newaccessToken,newrefreshToken}
         )
     )
       } catch (error) {
        throw new Apierror(401,error?.message11||"Invalid refresh Token")
       }
})

    const changeCureentPassword=asynchandler(async(req,res)=>{
        const {oldPassword,newPassword}=req.body

        const user=await User.findById(req.user?._id)
        const isPasswordCorrect=await user.isPasswordCorrect(oldPassword)
        
        if (!isPasswordCorrect) {
            throw new Apierror(400,"Invalid old Password")
        }

        user.password=newPassword
        await user.save({validateBeforeSave:false})

        return res.status(200)
        .json(new Apiresponse(200,"password changed Successfully"))
})

    const getCurrentUser=asynchandler(async(req,res)=>{
        return res.status(200)
        .json(200,req.user,"Current user fetched successfully")
})

    const updateAccountDetails=asynchandler(async(req,res)=>{
        const {fullname,email}=req.body
        if(!fullname||!email){
            throw new Apierror(400,"All fields are required")
        }

        const user=User.findByIdAndUpdate(
            req.user?._id,
            {
                $set:{
                    fullname,
                    email:email
                }
            },
            {new:true}

        ).select("-password")

        return res
        .status(200)
        .json(new Apiresponse(200,"Account details updated sucessfully"))
})

    const updateUserAvatar=asynchandler(async(req,res)=>{
        
        const avatarLocalPath=req.file?.path

        if(!avatarLocalPath){
            throw new Apierror(400,"Avatar file Missing")
        }
        const avatar=await uploadCloudinary(avatarLocalPath)

        if(!avatar){
            throw new Apierror(400,"Error while uploading Avatar")
        }
        
        await User.findByIdAndUpdate(
            req.user?._id,

            {$set:{
                avatar:avatar.url
            }},
            {new:true}
        ).select("-password")

        return res
        .status(200)
        .json(new Apiresponse(200,"Avatar updated Successfully"))

})

const updateUserCoverImage=asynchandler(async(req,res)=>{
        
    const coverImageLocalPath=req.file?.path

    if(!coverImageLocalPath){
        throw new Apierror(400,"CoverImage file Missing")
    }
    const coverImage=await uploadCloudinary(coverImageLocalPath)

    if(!coverImage){
        throw new Apierror(400,"Error while uploading CoverImage")
    }
    
    await User.findByIdAndUpdate(
        req.user?._id,

        {$set:{
            coverImage:coverImage.url
        }},
        {new:true}
    ).select("-password")

    return res
    .status(200)
    .json(new Apiresponse(200,"Cover Image updated successfully"))
    
})

    const getUserChannelProfile=asynchandler(async(req,res)=>{

        const {username}=req.params

        if(!username?.trim()){
            throw new Apierror(400,"Username is not defined")
        }

        const channel=await User.aggregate([
            {
                $match:{
                    username:username?.toLowerCase()
                }
            },
            {
                $lookup:{
                    from:"subscriptions",
                    localField:"_id",
                    foreignField:"channel",
                    as:"subscribers"
                }
            },
            {
                $lookup:{
                    from:"subscriptions",
                    localField:"_id",
                    foreignField:"subscriber",
                    as:"subscribed To"
                }
            },
            {
                $addFields:{
                    subscribersCount:{
                        $size:"$subscibers"
                    },
                    channelsSubscriberToCount:{
                        $size:"$subscribed To"
                    },
                    isSubscribed:{
                        if:{$in:[req.user?._id,"$subscribers.subscriber"]},
                        then:true,
                        else:false
                    }
                }
            },
            {
                $project:{
                    fullname:1,
                    username:1,
                    subscribersCount:1,
                    channelsSubscriberToCount:1,
                    isSubscribed:1,
                    avatar:1,
                    coverImage:1,
                    email:1
                }
            }
        ])
        if(!channel?.length){
            throw new Apierror(404,"Channel not found")
        }
    })

export {
    registerUser,
    loginUser,
    logOutUser,
    refreshAccessToken,
    changeCureentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile
}