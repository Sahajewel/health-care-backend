import { PaymentStatus, UserRole, UserStatus } from "@prisma/client";
import { IJwtPayload } from "../type/common";
import { AppError } from "../errors/AppError";
import httpStatus from "http-status";
import { prisma } from "../shared/prisma";
const fetchedDashboardMetaData = async (user: IJwtPayload) => {
  let metaData;
  switch (user.role) {
    case UserRole.ADMIN:
      metaData = await getAdminMetaData();
      break;
    case UserRole.DOCTOR:
      metaData = "Doctor Meta Data";
      break;
    case UserRole.PATIENT:
      metaData = "Patient Meta Data";
      break;
    default:
      throw new AppError(httpStatus.BAD_REQUEST, "Invalid user role");
  }
  return metaData;
};

const getAdminMetaData = async () => {
  const patientCount = await prisma.patient.count();
  const doctorCount = await prisma.doctor.count();
  const adminCount = await prisma.admin.count();
  const appointmentCount = await prisma.appointment.count();
  const paymentCount = await prisma.payment.count();

  const totalRevenue = await prisma.payment.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      status: PaymentStatus.PAID,
    },
  });
  const barChartData = await getBarChartData();
  const pieChartData = await getPieChartData();

  return {
    patientCount,
    doctorCount,
    adminCount,
    appointmentCount,
    paymentCount,
    totalRevenue,
    barChartData,
    pieChartData,
  };
};

const getBarChartData = async () => {
  const appointmentCountPerMonth = await prisma.$queryRaw`
    SELECT DATE_TRUNC('month', "createdAt") AS month,
    CAST(COUNT(*) AS INTEGER) AS count
    FROM "appointments"
    GROUP BY month
    ORDER BY month ASC
    `;
  return appointmentCountPerMonth;
};

const getPieChartData = async () => {
  const appointmentStatusDistrubution = await prisma.appointment.groupBy({
    by: ["status"],
    _count: { id: true },
  });

  const formatAppointmentStatusDistrubution = appointmentStatusDistrubution.map(
    ({ status, _count }) => ({
      status,
      count: Number(_count.id),
    })
  );
  return formatAppointmentStatusDistrubution;
};
export const MetaService = {
  fetchedDashboardMetaData,
};
