import express from "express";
import { ScheduleController } from "./schedules.controller";

const router = express.Router();

router.post("/create-schedule", ScheduleController.createSchedule);
router.get("/", ScheduleController.getAllSchedule);
router.delete("/:id", ScheduleController.deleteSchedule);

export const ScheduleRoutes = router;
