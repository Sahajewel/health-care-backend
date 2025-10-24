import { Request } from "express";
import { prisma } from "../../shared/prisma";
import bcryptjs from "bcryptjs";
import { fileUploader } from "../../helpers/fileUploader";
import { UserRole, UserStatus } from "@prisma/client";
import { buildQueryOptions } from "../../helpers/queryBuilder";
import { IJwtPayload } from "../../type/common";

const createPatient = async (req: Request) => {
  if (req.file) {
    const uploadImage = await fileUploader.uploadToCloudinary(req.file);
    req.body.patient.profilePhoto = uploadImage?.secure_url;
  }
  const hashPassword = await bcryptjs.hash(req.body.password, 10);
  const result = await prisma.$transaction(async (tnx) => {
    const user = await tnx.user.create({
      data: {
        email: req.body.patient.email,
        password: hashPassword,
      },
    });
    const patient = await tnx.patient.create({
      data: req.body.patient,
    });
    return { user, patient };
  });
  return result;
};

const createDoctor = async (req: Request) => {
  if (req.file) {
    const uploadImage = await fileUploader.uploadToCloudinary(req.file);
    req.body.doctor.profilePhoto = uploadImage?.secure_url;
  }
  const hashPassword = await bcryptjs.hash(req.body.password, 10);
  const result = await prisma.$transaction(async (tnx) => {
    const user = await tnx.user.create({
      data: {
        email: req.body.doctor.email,
        password: hashPassword,
        role: UserRole.DOCTOR,
      },
    });
    const doctor = await tnx.doctor.create({
      data: req.body.doctor,
    });
    return {
      user,
      doctor,
    };
  });
  return result;
};
const createAdmin = async (req: Request) => {
  if (req.file) {
    const uploadImage = await fileUploader.uploadToCloudinary(req.file);
    req.body.admin.profilePhoto = uploadImage?.secure_url;
  }
  const hashPassword = await bcryptjs.hash(req.body.password, 10);
  const result = await prisma.$transaction(async (tnx) => {
    const user = await tnx.user.create({
      data: {
        email: req.body.admin.email,
        password: hashPassword,
        role: UserRole.ADMIN,
      },
    });
    const admin = await tnx.admin.create({
      data: req.body.admin,
    });
    return { user, admin };
  });
  return result;
};
const getAllUsers = async (query: any) => {
  const { page, limit, skip, filters, orderBy } = buildQueryOptions(query);
  const [data, total] = await Promise.all([
    prisma.user.findMany({
      where: filters,
      include: {
        patient: true,
        doctor: true,
        admin: true,
      },
      skip,
      take: limit,
      orderBy,
    }),
    prisma.user.count({ where: filters }),
  ]);
  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data,
  };
};

const getMyProfile = async (user: IJwtPayload) => {
  const userInfo = await prisma.user.findUniqueOrThrow({
    where: {
      email: user.email,
      status: UserStatus.ACTIVE,
    },
    select: {
      id: true,
      email: true,
      needPasswordChange: true,
      role: true,
      status: true,
    },
  });

  let profileData;

  if (userInfo.role === UserRole.PATIENT) {
    profileData = await prisma.patient.findUnique({
      where: {
        email: userInfo.email,
      },
    });
  } else if (userInfo.role === UserRole.DOCTOR) {
    profileData = await prisma.doctor.findUnique({
      where: {
        email: userInfo.email,
      },
    });
  } else if (userInfo.role === UserRole.ADMIN) {
    profileData = await prisma.admin.findUnique({
      where: {
        email: userInfo.email,
      },
    });
  }

  return {
    ...userInfo,
    ...profileData,
  };
};

const changeProfileStatus = async (
  id: string,
  payload: { status: UserStatus }
) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      id,
    },
  });

  const updatedStatus = await prisma.user.update({
    where: {
      id,
    },
    data: payload,
  });
  return updatedStatus;
};
export const UserService = {
  createPatient,
  createDoctor,
  createAdmin,
  getAllUsers,
  getMyProfile,
  changeProfileStatus,
};
