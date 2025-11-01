import { Request, Response } from "express";
import catchAsynce from "../shared/catchAsync";
import { IJwtPayload } from "../type/common";
import sendResponse from "../shared/sendResponse";
import httpStatus from "http-status";
import { MetaService } from "./meta.service";
const fetchedDashboardMetaData = catchAsynce(
  async (req: Request & { user?: IJwtPayload }, res: Response) => {
    const user = req.user;

    const result = await MetaService.fetchedDashboardMetaData(
      user as IJwtPayload
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Meta data retrieved successfully",
      data: result,
    });
  }
);

export const MetaController = {
  fetchedDashboardMetaData,
};
