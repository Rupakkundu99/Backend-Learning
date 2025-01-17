import { v2 as cloudinary} from "cloudinary";
import fs from "fs";//file system
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
});

const uploadCloudinary=async(localFilePath)=>{
    try{
       if (!localFilePath) {
        return null; 
       }
        //Upload file on cloudinary
        const response=await cloudinary.uploader.upload(localFilePath,
            {
                resource_type:"auto"
            })
            //File uploaded successfully on cloudinary
            // console.log("File is uploaded on cloudinary ",response.url);
            
            fs.unlinkSync(localFilePath)    
            return response;
    }
    catch(error){
        fs.unlinkSync(localFilePath)
        //Removes the tempoarray locally saved file uploaded on upload operation failure
        return null;
    }
}

export {uploadCloudinary}