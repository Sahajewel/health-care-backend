import { IJwtPayload } from "../../type/common";

const createAppoinment = async (user: IJwtPayload, payload: any) => {
  console.log(user, payload);
  return payload;
};

export const AppoinmentService = {
  createAppoinment,
};
