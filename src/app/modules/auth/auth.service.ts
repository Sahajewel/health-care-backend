import { UserStatus } from "@prisma/client"
import { prisma } from "../../shared/prisma"
import bcrypt from "bcryptjs"
import jwt, { SignOptions } from "jsonwebtoken"
import config from "../../../config"
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
const accessToken = jwt.sign({email: user.email, role: user.role}, config.jwt_secret as string, {expiresIn: config.jwt_access_expires} as SignOptions)
const RefreshToken = jwt.sign({email: user.email, role: user.role}, config.jwt_secret as string, {expiresIn: config.jwt_refresh_expires} as SignOptions)
return{
    user,
    accessToken,
    RefreshToken
}

}

export const AuthService = {
    login
}