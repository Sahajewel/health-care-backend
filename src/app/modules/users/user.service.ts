import { prisma } from "../../shared/prisma";
import { createPatientInput } from "./user.interface";
import bcryptjs from "bcryptjs"
const createPatient = async(payload: createPatientInput)=>{
    const hashPassword = await bcryptjs.hash(payload.password, 10)
    const result = await prisma.$transaction(async(tnx)=>{
     const user =   await tnx.user.create({
            data: {
                email: payload.email,
                password: hashPassword
            }
        });
      const patient =  await tnx.patient.create({
            data: {
                name: payload.name,
                email: payload.email,
                contactNumber: payload.contactNumber
            }
        })
         return {user, patient}
    }) 
   return result
}

export const UserService = {
    createPatient
}