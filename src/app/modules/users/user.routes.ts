import express from 'express'
import { UserControllers } from './user.controllers';
const router = express.Router();

router.post("/create-patient", UserControllers.createPatient)

export const UserRoutes = router