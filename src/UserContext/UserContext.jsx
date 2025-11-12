// UserContext.jsx
import React, { createContext, useState, useEffect } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [theme, setTheme] = useState("light");
  const [openTeamAccordion, setOpenTeamAccordion] = useState(false);

  // Load theme from localStorage on first mount
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme) {
      setTheme(storedTheme);
      document.body.setAttribute("data-theme", storedTheme);
    } else {
      document.body.setAttribute("data-theme", theme);
    }
  }, []);

  // Sync theme to localStorage and body attribute
  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <UserContext.Provider
      value={{
        theme,
        toggleTheme,
        openTeamAccordion,
        setOpenTeamAccordion,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
