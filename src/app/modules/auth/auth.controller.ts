import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { AuthService } from "./auth.service";
import { IJwtPayload } from "../../type/common";
import statusCode from "http-status";
const login = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.login(req.body);
  const { accessToken, refreshToken } = result;

  res.cookie("accessToken", accessToken, {
    secure: true,
    httpOnly: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60,
  });
  res.cookie("refreshToken", refreshToken, {
    secure: true,
    httpOnly: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24,
  });

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "User Logged in successfully ",
    data: result.user,
  });
});

const changePassword = catchAsync(
  async (req: Request & { user?: IJwtPayload }, res: Response) => {
    const user = req.user;
    const result = await AuthService.changePassword(
      user as IJwtPayload,
      req.body
    );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: " Password change successfully",
      data: result,
    });
  }
);

const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  await AuthService.forgotPassword(req.body);

  sendResponse(res, {
    statusCode: statusCode.OK,
    success: true,
    message: "check your email",
    data: null,
  });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const token = req.headers.authorization || "";

  await AuthService.resetPassword(token, req.body);

  sendResponse(res, {
    statusCode: statusCode.OK,
    success: true,
    message: "password reset successfully",
    data: null,
  });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;

  const result = await AuthService.refreshToken(refreshToken);

  res.cookie("accessToken", result.accessToken, {
    secure: true,
    httpOnly: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60,
  });

  sendResponse(res, {
    statusCode: statusCode.OK,
    success: true,
    message: "Access token generated successfully",
    data: {
      message: "Access token generated successfully",
    },
  });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
  const userSession = req.cookies;
  const result = await AuthService.getMe(userSession);

  sendResponse(res, {
    statusCode: statusCode.OK,
    success: true,
    message: "User Retrieve successfully",
    data: result,
  });
});
export const AuthControllers = {
  login,
  changePassword,
  forgotPassword,
  resetPassword,
  refreshToken,
  getMe,
};
