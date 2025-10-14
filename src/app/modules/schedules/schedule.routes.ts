import express from "express";
import { ScheduleController } from "./schedules.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.post("/create-schedule", ScheduleController.createSchedule);
router.get(
  "/",
  auth(UserRole.DOCTOR, UserRole.ADMIN),
  ScheduleController.getAllSchedule
);
router.delete("/:id", ScheduleController.deleteSchedule);

export const ScheduleRoutes = router;
