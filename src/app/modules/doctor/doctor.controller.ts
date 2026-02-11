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

const doctorUpdate = catchAsynce(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await DoctorService.doctorUpdate(id, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "doctor update successfully",
    data: result,
  });
});

const sugessions = catchAsynce(async (req: Request, res: Response) => {
  const result = await DoctorService.sugessions(req.body);
  console.log(result);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Sugessions created",
    data: result,
  });
});
export const DoctorController = {
  getDoctors,
  doctorUpdate,
  sugessions,
};
