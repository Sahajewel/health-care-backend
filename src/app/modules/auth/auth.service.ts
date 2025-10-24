import { UserStatus } from "@prisma/client";
import { prisma } from "../../shared/prisma";
import bcrypt from "bcryptjs";
import config from "../../../config";
import { jwtHelper } from "../../helpers/generateToken";
import { AppError } from "../../errors/AppError";
import httpStatus from "http-status";
import { IJwtPayload } from "../../type/common";
import { Secret } from "jsonwebtoken";
import emailSender from "./emailSender";
import { email } from "zod";
const login = async (payload: {
  id: string;
  email: string;
  password: string;
}) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: payload.id,
      email: payload.email,
      status: UserStatus.ACTIVE,
    },
  });
  const isCorrectPassword = await bcrypt.compare(
    payload.password,
    user.password
  );
  if (!isCorrectPassword) {
    throw new AppError(httpStatus.BAD_REQUEST, "Password is incorrect!");
  }
  // if(!config.jwt_secret){
  //     throw new Error("Jwt secret is not configured")
  // }
  const accessToken = jwtHelper.generateToken(
    { id: user.id, email: user.email, role: user.role },
    config.jwt_secret as string,
    config.jwt_access_expires as string
  );
  const refreshToken = jwtHelper.generateToken(
    { id: user.id, email: user.email, role: user.role },
    config.jwt_secret as string,
    config.jwt_refresh_expires as string
  );
  return {
    user,
    accessToken,
    refreshToken,
  };
};

const changePassword = async (user: IJwtPayload, payload: any) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: user.email,
      status: UserStatus.ACTIVE,
    },
  });
  const isCorrectPassword = await bcrypt.compare(
    payload.oldPassword,
    userData.password
  );
  if (!isCorrectPassword) {
    throw new AppError(httpStatus.BAD_REQUEST, "Password is incorrect");
  }
  const hashPassword = await bcrypt.hash(payload.newPassword, 10);
  await prisma.user.update({
    where: {
      email: userData.email,
    },
    data: {
      password: hashPassword,
      needPasswordChange: false,
    },
  });
  return {
    message: "Password change successfully",
  };
};

const forgotPassword = async (payload: { email: string }) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
      status: UserStatus.ACTIVE,
    },
  });
  const resetPassToken = jwtHelper.generateToken(
    { email: userData.email, role: userData.role },
    config.jwt_pass_secret as Secret,
    config.reset_pass_expires as string
  );

  const resetPassLink =
    config.reset_pass_link + `?userId=${userData.id}&token=${resetPassToken}`;

  try {
    await emailSender(
      userData.email,
      `<div>
      <p>Your password link
      <a href=${resetPassLink}>
      <button>Reset Password</button>
      </a>
      </p>
    </div>`
    );
  } catch (err) {
    console.error("Failed to send password reset email", err);
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Failed to send reset email. please try again later"
    );
  }
  return { message: "Password reset email successfully" };
};

const resetPassword = async (
  token: string,
  payload: { id: string; password: string }
) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      id: payload.id,
      status: UserStatus.ACTIVE,
    },
  });

  const isValidToken = jwtHelper.verifyToken(
    token,
    config.reset_pass_secret as Secret
  );

  if (!isValidToken) {
    throw new AppError(httpStatus.FORBIDDEN, "Forbidden");
  }

  const password = await bcrypt.hash(payload.password, 10);

  await prisma.user.update({
    where: {
      id: payload.id,
    },
    data: {
      password,
    },
  });
};

const refreshToken = async (token: string) => {
  let decodedData;

  try {
    decodedData = jwtHelper.verifyToken(token, config.refresh_token as Secret);
  } catch (err) {
    throw new Error("You are not authrorized");
  }
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: decodedData.email,
      status: UserStatus.ACTIVE,
    },
  });

  const accessToken = jwtHelper.generateToken(
    {
      email: userData.email,
      role: userData.role,
    },
    config.jwt_secret as Secret,
    config.jwt_access_expires as string
  );

  return {
    accessToken,
    needPasswordChange: userData.needPasswordChange,
  };
};

const getMe = async (session: any) => {
  const accessToken = session.accessToken;
  const decodedData = jwtHelper.verifyToken(
    accessToken,
    config.jwt_secret as Secret
  );

  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: decodedData.email,
      status: UserStatus.ACTIVE,
    },
  });
  const { id, email, role, needPasswordChange, status } = userData;

  return {
    id,
    email,
    role,
    needPasswordChange,
    status,
  };
};
export const AuthService = {
  login,
  changePassword,
  forgotPassword,
  resetPassword,
  refreshToken,
  getMe,
};
