import { FormModel } from '../src/form/utils/formModel';
import { db } from './db';
import { systemForms } from '../src/form/permission/systemFormsConfig';
import { ResponseModel } from '../src/form/utils/responseModel';

// documentId field 6369fc044ae4c7719625dd47
const getActivityLog = async () => {
  const activityLog = await FormModel.findOne({ slug: systemForms?.activityLogCard?.slug }).lean();
  const filter = { formId: activityLog?._id };
  const responses = await ResponseModel.countDocuments(filter);
  // debugger;
  const responses2 = await ResponseModel.aggregate([
    { $match: filter },
    { $unwind: '$values' },
    { $match: { 'values.field': '6369fc044ae4c7719625dd47' } },
    {
      $group: {
        _id: 0,
        values: { $addToSet: '$values.value' },
      },
    },
  ]);
  debugger;
};

const deleteOldActivityLog = async () => {
  const activityLog = await FormModel.findOne({ slug: systemForms?.activityLogCard?.slug }).lean();
  const responses = await ResponseModel.countDocuments({ formId: activityLog?._id });

  // const res = await ResponseModel.deleteMany({ formId: activityLog?._id });
};

(async () => {
  try {
    await db();
    await getActivityLog();
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
