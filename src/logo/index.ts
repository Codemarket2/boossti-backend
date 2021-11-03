import { DB } from "../utils/DB";
import { AppSyncEvent } from "../utils/cutomTypes";
import { Logo } from "./utils/logoModel";

export const handler = async (event: AppSyncEvent): Promise<any> => {
  try {
    await DB();
    const { fieldName } = event.info;
    const args = { ...event.arguments };
    let tempData: any;
    switch (fieldName) {
      case "getLogoOrDescription": {
        return await Logo.findById(args._id);
      }
      case "createLogoOrDescription": {
        const logoOrDescription = await Logo.create({
          ...args,
        });
        return await logoOrDescription;
      }

      case "updateLogoOrDescription": {
        tempData = await Logo.findOneAndUpdate(
          { _id: args._id },
          { ...args },
          { new: true, runValidators: true }
        );
        return await tempData;
      }
      case "deleteLogoOrDescription": {
        await Logo.findOneAndDelete({ _id: args._id });
        return true;
      }
      default:
        throw new Error(
          "Something went wrong! Please check your Query or Mutation"
        );
    }
  } catch (error) {
    const error2 = error;
    throw error2;
  }
};
