import React, { useContext, useState, useEffect } from "react";
import { UserContext } from "./UserContext/UserContext";
import { FiMoon } from "react-icons/fi";
import { LuSun } from "react-icons/lu";

const LoginThemeSwitcher = () => {
  const { theme, toggleTheme } = useContext(UserContext);
  const [animate, setAnimate] = useState(false);
  const [slideActive, setSlideActive] = useState(false);
  const [flipped, setFlipped] = useState(false);

  const handleToggle = () => {
    setAnimate(true);
    setSlideActive(true);

    setTimeout(() => {
      toggleTheme();
      setSlideActive(false);
    }, 300);

    setTimeout(() => {
      setAnimate(false);
    }, 800);
  };

  return (
    <>
      {/* {slideActive && <div className="slide-overlay" />} */}
      <button
        onClick={handleToggle}
        className={`theme-btn  w-134 ${theme === "dark" ? "dark" : ""}`}
      >
        <span
          id="theme-toggle"
          className={`theme-toggle-icon ${animate ? "animate-toggle" : ""}`}
        >
          {theme === "dark" ? <FiMoon /> : <LuSun />}
        </span>
      </button>
    </>
  );
};

export default LoginThemeSwitcher;
