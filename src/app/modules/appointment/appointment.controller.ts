import { Request, Response } from "express";
import catchAsynce from "../../shared/catchAsync";
import { AppoinmentService } from "./appoinment.service";
import sendResponse from "../../shared/sendResponse";
import { IJwtPayload } from "../../type/common";

const createAppoinment = catchAsynce(
  async (req: Request & { user?: IJwtPayload }, res: Response) => {
    const user = req.user;
    const result = await AppoinmentService.createAppoinment(
      user as IJwtPayload,
      req.body
    );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Appoinment created",
      data: result,
    });
  }
);

export const AppoinmentController = {
  createAppoinment,
};
