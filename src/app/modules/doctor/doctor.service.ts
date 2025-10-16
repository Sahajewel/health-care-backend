import { buildQueryOptions } from "../../helpers/queryBuilder";
import { prisma } from "../../shared/prisma";

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

export const DoctorService = {
  getDoctors,
};
