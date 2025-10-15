import { Request, Response } from "express";
import catchAsynce from "../../shared/catchAsync";
import { DoctorScheduleService } from "./doctorSchedule.service";
import sendResponse from "../../shared/sendResponse";
import { IJwtPayload } from "../../type/common";

const createDoctorSchedule = catchAsynce(
  async (req: Request & { user?: IJwtPayload }, res: Response) => {
    const user = req.user;
    const result = await DoctorScheduleService.createDoctorSchedule(
      user as IJwtPayload,
      req.body
    );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Doctor schedule created successfully",
      data: result,
    });
  }
);

export const DoctorScheduleController = {
  createDoctorSchedule,
};
