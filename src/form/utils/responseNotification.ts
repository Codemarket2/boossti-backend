import { ClientSession } from 'mongoose';
// import { sendNotification } from '../../notification/utils/sendNotification';
import { sendEmail } from '../../utils/email';
import { getUserAttributes } from './actionHelper';
import { FormModel } from './formModel';
import { IForm } from './formType';
import { IResponse } from './responseType';

interface IPayload {
  session: ClientSession;
  form: IForm;
  response: IResponse;
}

export const sendResponseNotification = async ({ session, form, response }: IPayload) => {
  if (
    process.env.NODE_ENV === 'test' ||
    !form?.createdBy?._id ||
    form?.createdBy?._id?.toString() === response?.createdBy?._id?.toString()
  ) {
    return;
  }
  const userForm = await FormModel.findOne({ slug: process.env.USERS_FORM_SLUG }).session(session);

  const formOwner = getUserAttributes(userForm, form?.createdBy);
  const responseOwner = getUserAttributes(userForm, response?.createdBy);
  const responseOwnerName = responseOwner?.name || 'UnAuthenticated user';

  const body = `Hello ${formOwner?.name}<br/>
      <p>
      <b>${responseOwnerName}</b> has submitted response on your <b>${form?.name} form</b>.
      <br/>
      <a href="${process.env.FRONTEND_URL}/forms/${form?.slug}/response/${response?.count}"><button>View Response</button></a>
      </p>`;
  const to: string[] = [];
  if (formOwner?.email) {
    to.push(formOwner?.email);
  }
  const emailPayload = {
    from: `Boossti <${process.env.SENDER_EMAIL}>`,
    to,
    body,
    subject: `New Response on ${form?.name} form`,
  };
  if (emailPayload?.to?.length > 0 && emailPayload?.from) await sendEmail(emailPayload);
};
