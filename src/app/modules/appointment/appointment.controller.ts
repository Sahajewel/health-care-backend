import { Request, Response } from "express";
import catchAsynce from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { IJwtPayload } from "../../type/common";
import { AppointmentService } from "./appoinment.service";

const createAppoinment = catchAsynce(
  async (req: Request & { user?: IJwtPayload }, res: Response) => {
    const user = req.user;
    const result = await AppointmentService.createAppointment(
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
