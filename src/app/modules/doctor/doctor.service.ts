import { Specialties } from "@prisma/client";
import { buildQueryOptions } from "../../helpers/queryBuilder";
import { prisma } from "../../shared/prisma";
import { DoctorUpdateInput } from "./doctor.interface";
import { AppError } from "../../errors/AppError";
import httpStatus from "http-status";
import { openai } from "../../helpers/openRouter";
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

const sugessions = async (payload: { symptom: string }) => {
  if (!(payload && payload.symptom)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Sumptom is required");
  }

  const doctors = await prisma.doctor.findMany({
    where: { isDeleted: false },
    include: {
      doctorSpecialties: {
        include: {
          specialities: true,
        },
      },
    },
  });
  const prompt = `
You are a medical assistant AI. Based on the patient's symptoms, suggest the top 3 most suitable doctors.
Each doctor has specialties and years of experience.
Only suggest doctors who are relevant to the given symptoms.

Symptoms: ${payload.symptom}

Here is the doctor list (in JSON):
${JSON.stringify(doctors, null, 2)}

Return your response in JSON format with full individual doctor data. 
`;

  console.log("analyzing......\n");

  const completion = await openai.chat.completions.create({
    model: "z-ai/glm-4.5-air:free",
    messages: [
      {
        role: "system",
        content:
          "You are a helpful AI medical assistant that provides doctor suggestions.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });
  console.log(doctors);
  return payload;
};
export const DoctorService = {
  getDoctors,
  doctorUpdate,
  sugessions,
};
