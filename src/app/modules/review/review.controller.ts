import { Request, Response } from "express";
import catchAsynce from "../../shared/catchAsync";
import { ReviewService } from "./review.service";
import { IJwtPayload } from "../../type/common";
import sendResponse from "../../shared/sendResponse";

const createReview = catchAsynce(
  async (req: Request & { user?: IJwtPayload }, res: Response) => {
    const user = req.user;
    const result = await ReviewService.createReview(
      user as IJwtPayload,
      req.body
    );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Review created",
      data: result,
    });
  }
);

export const ReviewController = {
  createReview,
};
