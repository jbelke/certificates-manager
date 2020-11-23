/* eslint-disable import/prefer-default-export */

export const formatError = (error) => {
  if (Array.isArray(error.errors)) {
    return error.errors.map((x) => x.message).join('\n');
  }

  return error.message;
};
