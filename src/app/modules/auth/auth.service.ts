import { UserStatus } from "@prisma/client"
import { prisma } from "../../shared/prisma"
import bcrypt from "bcryptjs"
import config from "../../../config"
import  { jwtHelper } from "../../helpers/generateToken"
const login = async(payload:{email: string, password: string})=>{
const user = await prisma.user.findUniqueOrThrow({
    where: {
        email: payload.email,
        status: UserStatus.ACTIVE
    }
})
const isCorrectPassword = await bcrypt.compare(payload.password, user.password)
if(!isCorrectPassword){
    throw new Error("Password is incorrect!")
}
// if(!config.jwt_secret){
//     throw new Error("Jwt secret is not configured")
// }
const accessToken = jwtHelper.generateToken({email: user.email, role: user.role}, config.jwt_secret as string, config.jwt_access_expires as string )
const refreshToken = jwtHelper.generateToken({email: user.email, role: user.role}, config.jwt_secret as string, config.jwt_refresh_expires as string)
return{
    user,
    accessToken,
    refreshToken
}

}

export const AuthService = {
    login
}