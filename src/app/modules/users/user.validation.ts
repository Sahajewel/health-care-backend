import z, { string } from "zod";

const createPatientValidationSchema = z.object({
    password: z.string(),
    patient: z.object( {
        name: z.string().nonempty("Name is required"),
        email: z.string().nonempty("Email is required"),
        contactNumber: z.string().nonempty( "Contact Number is required"),
        address: z.string().optional()
    })
})

const createDoctorValidationSchema = z.object({
    password: z.string(),
    doctor:z.object({
        name: z.string().nonempty("Name is required"),
        email: z.string().nonempty("Email is required"),
        contactNumber : z.string().nonempty("Contact number is required"),
        address: z.string().nonempty("Address is required"),
        registrationNumber: z.string().nonempty("Registration number is required"),
        gender: z.string().nonempty("Gender is required"),
        appointmentFee: z.number(),
        qualification: z.string().nonempty("Qualification is required"),
        currentWorkingPlace: z.string().nonempty("Current working place is required"),
        designation: z.string().nonempty("Current working place is rewuired")
    })
})

const createAdminValidationSchema = z.object({
    password: z.string(),
    admin: z.object({
        name: z.string().nonempty("Name is required"),
        email: z.string().nonempty("Email is required"),
        contactNumber: z.string().nonempty("Contact Number is required")
    })
})
export const UserValidation = {
    createPatientValidationSchema,
    createDoctorValidationSchema,
    createAdminValidationSchema
}