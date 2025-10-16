import { Request, Response } from "express";
import catchAsynce from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { DoctorService } from "./doctor.service";

const getDoctors = catchAsynce(async (req: Request, res: Response) => {
  const result = await DoctorService.getDoctors(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Doctors fecth successfully",
    data: result,
  });
});

export const DoctorController = {
  getDoctors,
};
