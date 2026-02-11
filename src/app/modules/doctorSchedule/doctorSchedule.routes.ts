import express from "express";
import { DoctorScheduleController } from "./doctorSchedule.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import validateRequest from "../../middlewares/validateRequest";
import { createDoctorScheduleValidationSchema } from "./doctorSchedule.validation";

const router = express.Router();

router.post(
  "/create-doctorSchedule",

  validateRequest(createDoctorScheduleValidationSchema),
  DoctorScheduleController.createDoctorSchedule
);

export const DoctorScheduleRoutes = router;
