export const ucFirst = (string) => {
  if (string && string.length) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
};
