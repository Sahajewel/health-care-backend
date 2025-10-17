import { Specialties } from "@prisma/client";
import { buildQueryOptions } from "../../helpers/queryBuilder";
import { prisma } from "../../shared/prisma";
import { DoctorUpdateInput } from "./doctor.interface";

const getDoctors = async (query: any) => {
  const { page, limit, skip, sortBy, sortOrder, filters, search } =
    buildQueryOptions(query);

  const where: any = search
    ? {
        OR: [
          {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            contactNumber: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            address: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            user: {
              email: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
        ],
      }
    : {};

  const [data, total] = await Promise.all([
    prisma.doctor.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        user: true,
        doctorSpecialties: true,
      },
    }),
    prisma.doctor.count({ where }),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data,
  };
};

const doctorUpdate = async (
  id: string,
  payload: Partial<DoctorUpdateInput>
) => {
  const doctorInfo = await prisma.doctor.findUniqueOrThrow({
    where: {
      id,
    },
  });
  const { specialties, ...doctorData } = payload;

  return await prisma.$transaction(async (tnx) => {
    if (specialties && specialties.length > 0) {
      const deletedSepialtyIds = specialties.filter(
        (specialty) => specialty.isDeleted
      );
      for (const specialty of deletedSepialtyIds) {
        await tnx.doctorSpecialties.deleteMany({
          where: {
            doctorId: id,
            specialitiesId: specialty.specialtyId,
          },
        });
      }
      const createSpecialtiesIds = specialties.filter(
        (specialty) => !specialty.isDeleted && specialty.specialtyId
      );

      for (const specialty of createSpecialtiesIds) {
        await prisma.doctorSpecialties.create({
          data: {
            doctorId: id,
            specialitiesId: specialty.specialtyId,
          },
        });
      }
    }
    return await tnx.doctor.update({
      where: {
        id: doctorInfo.id,
      },
      data: doctorData,
      include: {
        doctorSpecialties: {
          include: {
            specialities: true,
          },
        },
      },
    });
  });
};
export const DoctorService = {
  getDoctors,
  doctorUpdate,
};
