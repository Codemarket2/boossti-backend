import axios from 'axios';
import * as EmailValidator from 'email-validator';

export const validateEmail = async (email) => {
  let validated = false;
  if (EmailValidator.validate(email)) {
    const { data } = await axios.get('https://emailverification.whoisxmlapi.com/api/v2', {
      params: {
        apiKey: process.env.EMAIL_VERIFICATION_API,
        emailAddress: email,
      },
    });
    const { formatCheck, smtpCheck, dnsCheck } = data;
    if (formatCheck === 'true' && smtpCheck === 'true' && dnsCheck === 'true') {
      validated = true;
    }
  }
  return validated;
};
