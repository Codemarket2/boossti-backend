import { FormModel } from '../src/form/utils/formModel';
import { db } from './db';
import { systemForms } from '../src/form/permission/systemFormsConfig';
import { ResponseModel } from '../src/form/utils/responseModel';

const deleteOldActivityLog = async () => {
  const activityLog = await FormModel.findOne({ slug: systemForms?.activityLogCard?.slug }).lean();
  const responses = await ResponseModel.countDocuments({ formId: activityLog?._id });
  // const res= await ResponseModel.deleteMany({ formId: activityLog?._id });
};

(async () => {
  try {
    await db();
    // await deleteOldActivityLog();
    // Run your function here
    // await exportForms();
    // await importForms();

    process.exit();
  } catch (error) {
    console.log('Error', error);
    process.exit();
  }
})();
