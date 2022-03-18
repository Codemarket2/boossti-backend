export const replaceVariables = (text, contact) => {
  let newText = text;
  const values = { ...contact.toObject() };
  for (const key in values) {
    newText = newText.split(`{{${key}}}`).join(values[key] || '');
  }
  return newText;
};
