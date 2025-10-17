import express from "express";
import { DoctorController } from "./doctor.controller";

const router = express.Router();

router.get("/", DoctorController.getDoctors);
router.post("/sugessions", DoctorController.sugessions);
router.patch("/:id", DoctorController.doctorUpdate);

export const DoctorRoutes = router;
