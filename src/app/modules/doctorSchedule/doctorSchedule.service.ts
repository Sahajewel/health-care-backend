import { prisma } from "../../shared/prisma";
import { IJwtPayload } from "../../type/common";

const createDoctorSchedule = async (
  user: IJwtPayload,
  payload: { doctorScheduleIds: string[] }
) => {
  const doctor = await prisma.doctor.findUnique({
    where: {
      email: user.email,
    },
  });

  if (!doctor) {
    throw new Error("Doctor is not found");
  }
  const doctorScheduleData = payload.doctorScheduleIds.map((scheduleId) => ({
    doctorId: doctor.id,
    SchediuleId: scheduleId,
  }));
  console.log(doctorScheduleData);
  return await prisma.doctorSchedule.createMany({ data: doctorScheduleData });
};

export const DoctorScheduleService = {
  createDoctorSchedule,
};
