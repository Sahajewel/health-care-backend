import { object } from "zod";

export const buildQueryOptions = (query: any) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 2;
  const skip = (page - 1) * limit;

  let sortBy = query.sortBy || "createdAt";
  const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";

  // sort by validation

  const validateSortFields = [
    "id",
    "email",
    "role",
    "needPasswordChange",
    "createdAt",
    "updatedAt",
  ];

  const relationSortFields = {
    patient: ["name", "contactNumber", "address"],
    doctor: ["name", "contactNumber", "address"],
    admin: ["name", "contactNumber"],
    doctorSchedule: ["isBooked", "createdAt", "updatedAt"],
    schedule: ["startDateTime", "endDateTime"],
  };
  let orderBy: any = { createdAt: sortOrder };

  if (validateSortFields.includes(sortBy)) {
    orderBy = { [sortBy]: sortOrder };
  } else {
    for (const relation of Object.keys(
      relationSortFields
    ) as (keyof typeof relationSortFields)[]) {
      if (relationSortFields[relation].includes(sortBy)) {
        orderBy = { [relation]: { [sortBy]: sortOrder } };
        break;
      }
    }
  }

  //  normal filters (exclude pagination, search, sort)

  const filters: Record<string, any> = {};

  for (const key in query) {
    if (["page", "limit", "sortBy", "sortOrder", "search"].includes(key))
      continue;

    filters[key] = query[key];
  }

  //  dynamic searchable fields with relations
  const searchConfig: Record<string, string[]> = {
    user: ["email"],
    patient: ["name", "contactNumber", "address"],
    doctor: ["name", "contactNumber", "address"],
    admin: ["name", "contactNumber"],
    schedule: ["startDateTime", "endDateTime"],
    doctorSchedule: ["isBooked"],
  };
  if (query.search) {
    const orConditions: any[] = [];
    for (const table in searchConfig) {
      const fields = searchConfig[table];
      if (table === "user") {
        fields.forEach((field) => {
          orConditions.push({
            [field]: {
              contains: query.search,
              mode: "insensitive",
            },
          });
        });
      } else {
        const relationOr = fields.map((field) => ({
          [field]: {
            contains: query.search,
            mode: "insensitive",
          },
        }));
        orConditions.push({ [table]: { OR: relationOr } });
      }
    }
    filters.OR = orConditions;
  }
  return { page, limit, skip, sortBy, sortOrder, filters, orderBy };
};
