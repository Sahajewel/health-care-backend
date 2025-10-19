import { prisma } from "../../shared/prisma";
import { v4 as uuidv4 } from "uuid";
import { IJwtPayload } from "../../type/common";

const createAppointment = async (
  user: IJwtPayload,
  payload: { doctorId: string; scheduleId: string }
) => {
  // Check if patient exists, if not throw a meaningful error
  const patientData = await prisma.patient.findUnique({
    where: {
      email: user.email,
    },
  });
  // Verify user is a patient
  if (user.role !== "PATIENT") {
    throw new Error("Only patients can book appointments");
  }
  if (!patientData) {
    throw new Error(
      "Patient profile not found. Please complete your profile first."
    );
  }

  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      id: payload.doctorId,
      isDeleted: false,
    },
  });

  const isBookedOrNot = await prisma.doctorSchedule.findFirstOrThrow({
    where: {
      doctorId: payload.doctorId,
      SchediuleId: payload.scheduleId,
      isBooked: false,
    },
  });

  const videoCallingId = uuidv4();

  const result = await prisma.$transaction(async (tnx) => {
    const appointmentData = await tnx.appointment.create({
      data: {
        patientId: patientData.id,
        doctorId: doctorData.id,
        scheduleId: payload.scheduleId,
        videoCallingId,
      },
    });

    await tnx.doctorSchedule.update({
      where: {
        doctorId_SchediuleId: {
          doctorId: doctorData.id,
          SchediuleId: payload.scheduleId,
        },
      },
      data: {
        isBooked: true,
      },
    });

    const transactionId = uuidv4();

    await tnx.payment.create({
      data: {
        appointmentId: appointmentData.id,
        amount: doctorData.appointmentFee,
        transactionId,
        status: "UNPAID",
      },
    });

    return appointmentData;
  });

  return result;
};
export const AppointmentService = {
  createAppointment,
};
