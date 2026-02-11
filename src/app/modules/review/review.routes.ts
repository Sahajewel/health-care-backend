import express from "express";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { ReviewController } from "./review.controller";

const router = express.Router();

router.post(
  "/create-review",
  auth(UserRole.PATIENT),
  ReviewController.createReview
);

export const ReviewRoutes = router;
