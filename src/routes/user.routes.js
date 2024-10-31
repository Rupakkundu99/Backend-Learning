import { Router } from "express"
import {loginUser, logOutUser, registerUser,refreshAccessToken} from "../controllers/user.controller.js"
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router=Router()

router.route("/register").post(
    
        upload.fields([{
        name:"avatar",
        maxcount:1
    },
    {
        name:"coverImage",
        maxcount:1
    }
    ]),
    registerUser
    )

    router.route("/login").post(loginUser)

    //Secured routes
    router.route("/logout").post(verifyJWT,logOutUser)//Using middleware before routing where next in Verify Jwt makes logout user run after the comma
    router.route("/refresh-token").post(refreshAccessToken)
export default router