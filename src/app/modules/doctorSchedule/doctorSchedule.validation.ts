import z from "zod";

export const createDoctorScheduleValidationSchema = z.object({
  body: z.object({
    schedulesIds: z.array(z.string()),
  }),
});
