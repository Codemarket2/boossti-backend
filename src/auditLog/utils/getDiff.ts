import { isValidObjectId } from 'mongoose';
import { transform } from 'lodash';
import { isEqual } from 'lodash';
import { isArray } from 'lodash';
import { isObject } from 'lodash';
import { isDate } from 'lodash';

export function getDiff(origObj, newObj) {
  function changes(newObj, origObj) {
    let arrayIndexCounter = 0;
    return transform(newObj, function (result: any, value, key) {
      if (!isEqual(value, origObj[key])) {
        const resultKey = isArray(origObj) ? arrayIndexCounter++ : key;
        // if (
        //   isObject(value) &&
        //   isObject(origObj[key]) &&
        //   isValidObjectId(value) &&
        //   isValidObjectId(origObj[key])
        // ) {
        //   console.log({ [key]: value });
        // }
        result[resultKey] =
          isObject(value) &&
          isObject(origObj[key]) &&
          !isDate(value) &&
          !isDate(origObj[key]) &&
          key !== '_id'
            ? changes(value, origObj[key])
            : value;
      }
    });
  }
  return changes(newObj, origObj);
}

// import * as _ from 'lodash';

// export const getDiff = (curr, prev) => {
//   function changes(object, base) {
//     return _.transform(object, (result: any, value, key) => {
//       if (!_.isEqual(value, base[key]))
//         result[key] =
//           _.isObject(value) && _.isObject(base[key]) ? changes(value, base[key]) : value;
//     });
//   }
//   return changes(curr, prev);
// };
