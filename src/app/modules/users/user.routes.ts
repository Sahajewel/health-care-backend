import express, { NextFunction, Request, Response } from 'express'
import { UserControllers } from './user.controllers';
import { UserValidation } from './user.validation';
import { fileUploader } from '../../helpers/fileUploader';
const router = express.Router();

router.post("/create-patient",fileUploader.upload.single('file'),(req: Request, res: Response, next: NextFunction)=>{
    req.body = UserValidation.createPatientValidationSchema.parse(JSON.parse(req.body.data))
    return UserControllers.createPatient(req, res,next)
}
)
export const UserRoutes = router