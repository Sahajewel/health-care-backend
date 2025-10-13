import { gte } from "zod";
import { buildQueryOptions } from "../../helpers/queryBuilder";
import { prisma } from "../../shared/prisma";
import { addHours, addMinutes, format } from "date-fns";
const createSchedule = async (payload: any) => {
  const { startTime, endTime, startDate, endDate } = payload;
  const intervalTime = 30;
  const schedules = [];
  const currentDate = new Date(startDate);
  const lastDate = new Date(endDate);

  while (currentDate <= lastDate) {
    const startDateTime = new Date(
      addMinutes(
        addHours(
          `${format(currentDate, "yyyy-MM-dd")}`,
          Number(startTime.split(":")[0])
        ),
        Number(startTime.split(":")[1])
      )
    );
    const endDateTime = new Date(
      addMinutes(
        addHours(
          `${format(currentDate, "yyyy-MM-dd")}`,
          Number(endTime.split(":")[0])
        ),
        Number(endTime.split(":")[1])
      )
    );
    while (startDateTime <= endDateTime) {
      const slotStartDateTime = startDateTime;
      const slotEndDateTime = addMinutes(startDateTime, intervalTime);
      const scheduleData = {
        startDateTime: slotStartDateTime,
        endDateTime: slotEndDateTime,
      };

      const existingSchedule = await prisma.schedule.findFirst({
        where: scheduleData,
      });
      if (!existingSchedule) {
        const result = await prisma.schedule.create({
          data: scheduleData,
        });
        schedules.push(result);
      }
      slotStartDateTime.setMinutes(
        slotStartDateTime.getMinutes() + intervalTime
      );
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return schedules;
};

const getAllSchedule = async (query: any) => {
  const { page, limit, skip, filters, orderBy } = buildQueryOptions(query);

  if (query.startDateTime && query.endDateTime) {
    filters.startDateTime = { gte: new Date(query.startDateTime) };
    filters.endDateTime = { gte: new Date(query.endDateTime) };
  }

  const [data, total] = await Promise.all([
    prisma.schedule.findMany({
      where: filters,
      include: {
        doctorSchedule: true,
      },
      skip,
      take: limit,
    }),
    prisma.schedule.count({ where: filters }),
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

const deleteSchedule = async (id: string) => {
  const result = await prisma.schedule.delete({
    where: {
      id,
    },
  });
  return result;
};
export const ScheduServise = {
  createSchedule,
  getAllSchedule,
  deleteSchedule,
};
