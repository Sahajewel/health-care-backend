import { Request } from "express";
import { prisma } from "../../shared/prisma";
import bcryptjs from "bcryptjs"
import { fileUploader } from "../../helpers/fileUploader";
import { UserRole } from "@prisma/client";
import sendResponse from "../../shared/sendResponse";

const createPatient = async(req: Request)=>{
    if(req.file){
      const uploadImage =   await fileUploader.uploadToCloudinary(req.file)
      req.body.patient.profilePhoto = uploadImage?.secure_url
    }
    const hashPassword = await bcryptjs.hash(req.body.password, 10)
    const result = await prisma.$transaction(async(tnx)=>{
     const user =   await tnx.user.create({
            data: {
                email: req.body.patient.email,
                password: hashPassword
            }
        });
      const patient =  await tnx.patient.create({
            data: req.body.patient
        })
         return {user, patient}
    }) 
   return result
}

const createDoctor = async(req: Request)=>{
    if(req.file){
        const uploadImage = await fileUploader.uploadToCloudinary(req.file)
        req.body.doctor.profilePhoto = uploadImage?.secure_url
    }
    const hashPassword = await bcryptjs.hash(req.body.password,10)
    const result = await prisma.$transaction(async(tnx)=>{
        const user = await tnx.user.create({
            data:{
                email: req.body.doctor.email,
                password: hashPassword,
                role: UserRole.DOCTOR
            }
        })
        const doctor = await tnx.doctor.create({
            data: req.body.doctor
        })
        return{
            user, doctor
        }
    })
    return result
}
const createAdmin = async(req: Request)=>{
    if(req.file){
        const uploadImage = await fileUploader.uploadToCloudinary(req.file)
        req.body.admin.profilePhoto = uploadImage?.secure_url
    }
    const hashPassword = await bcryptjs.hash(req.body.password,10)
    const result = await prisma.$transaction(async(tnx)=>{
        const user = await tnx.user.create({
            data:{
                email: req.body.admin.email,
                password: hashPassword,
                role: UserRole.ADMIN
            }
        })
        const admin = await tnx.admin.create({
            data: req.body.admin
        })
        return{user, admin}
    })
    return result
}
const getAllUsers = async()=>{
    const allUsers = await prisma.user.findMany();
   return allUsers
}
export const UserService = {
    createPatient,
    createDoctor,
    createAdmin,
    getAllUsers
}