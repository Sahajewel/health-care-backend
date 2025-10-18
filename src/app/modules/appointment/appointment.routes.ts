import express from "express";
import { AppoinmentController } from "./appointment.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
const router = express.Router();

router.post("/", auth(UserRole.PATIENT), AppoinmentController.createAppoinment);

export const AppoinmentRoutes = router;
