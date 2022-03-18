export const replaceVariables = (text, values) => {
  let newText;
  for (let key in values) {
    newText = text.split(`{{${key}}}`).join(values[key] || '');
  }
  return newText || text;
};
