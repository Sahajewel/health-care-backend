import { IJwtPayload } from "./../../type/common";
import { Request, Response } from "express";
import catchAsynce from "../../shared/catchAsync";
import { ScheduServise } from "./schedule.service";
import sendResponse from "../../shared/sendResponse";

const createSchedule = catchAsynce(async (req: Request, res: Response) => {
  const result = await ScheduServise.createSchedule(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Schedule successfully created",
    data: result,
  });
});

const getAllSchedule = catchAsynce(
  async (req: Request & { user?: IJwtPayload }, res: Response) => {
    const user = req.user;
    const result = await ScheduServise.getAllSchedule(
      user as IJwtPayload,
      req.query
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Fetch all schedules",
      data: result,
    });
  }
);

const deleteSchedule = catchAsynce(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ScheduServise.deleteSchedule(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Schedule deleted successfully",
    data: result,
  });
});
export const ScheduleController = {
  createSchedule,
  getAllSchedule,
  deleteSchedule,
};
