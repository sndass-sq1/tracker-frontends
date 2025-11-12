export const changeTabTitle = (title) => {
  return (document.title = `${import.meta.env.VITE_APP_TAB_TITLE} | ${title}`);
};
