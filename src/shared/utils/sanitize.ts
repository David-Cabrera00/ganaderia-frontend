export const sanitizeSearchInput = (value: string, maxLength = 60) =>
  value.replace(/^\s+/, '').replace(/\s{2,}/g, ' ').slice(0, maxLength);

export const sanitizeTextInput = (value: string, maxLength = 120) =>
  value.replace(/^\s+/, '').replace(/\s{2,}/g, ' ').slice(0, maxLength);

export const sanitizeStrictInput = (value: string, maxLength = 60) =>
  value.replace(/\s+/g, '').slice(0, maxLength);

export const sanitizeEmailInput = (value: string, maxLength = 120) =>
  value.replace(/\s+/g, '').toLowerCase().slice(0, maxLength);
