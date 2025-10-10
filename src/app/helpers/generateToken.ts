import jwt,{ Secret, SignOptions } from "jsonwebtoken";

const generateToken = (payload: any, secret: Secret, expiresIn: string) =>{
    const token = jwt.sign(payload, secret,{expiresIn} as SignOptions)
    return token
}
export default generateToken;