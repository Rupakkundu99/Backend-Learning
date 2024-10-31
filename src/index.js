// require('dotenv').config()
import dotenv from "dotenv"
import connectdb from "./db/index.js";
import { app } from "./app.js";
-

dotenv.config({
    path:'./.env'
})

connectdb()
.then(()=>{
    app.listen(process.env.PORT||8000,()=>{
        console.log(`Server is running at port:${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.log("MONGO DB connection falied!!",err);
    
})





// import express, { application } from "express";
//Async await since dtabase takes time to load


// (async() =>{
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URI}/${D_NAME}`)
//         application.on("error",(error)=>{
//             console.log("ERROR",error);
//             throw error;
//         })

//         application.listen(process.env.PORT,()=>{
//             console.log(`App listening on port ${process.env.PORT}`);
            
//         })

//     } catch (error) {
//         console.log("ERROR",error);
//         throw error;
        
//     }
// })()

