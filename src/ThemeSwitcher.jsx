import React, { useContext } from "react";
import { UserContext } from "./UserContext/UserContext";
import { FiMoon } from "react-icons/fi";
import { LuSun } from "react-icons/lu";
import { motion, AnimatePresence } from "framer-motion";

function ThemeSwitcher() {
  const { theme, toggleTheme } = useContext(UserContext);

  return (
    <motion.button
      onClick={toggleTheme}
      className="darknavcard1  p-1 rounded-5 d-flex flex-column align-items-start justify-content-center"
      style={{
        // width: "200px",
        overflow: "hidden",
        background: "transparent",
        position: "relative",
        // height: "70px",
      }}
    >
      <AnimatePresence mode="wait">
        {theme === "dark" ? (
          <motion.div
            key="dark"
            initial={{ y: "-100%", opacity: 0, rotateX: 90 }}
            animate={{ y: 0, opacity: 1, rotateX: 0 }}
            exit={{ y: "100%", opacity: 0, rotateX: -90 }}
            transition={{ duration: 0.4 }}
            className="d-flex align-items-center gap-2  px-2 py-2 rounded-3 "
          >
            <FiMoon className="fs-4" />
            {/* <span className="fw-bold">Dark </span> */}
          </motion.div>
        ) : (
          <motion.div
            key="light"
            initial={{ y: "-100%", opacity: 0, rotateX: 90 }}
            animate={{ y: 0, opacity: 1, rotateX: 0 }}
            exit={{ y: "100%", opacity: 0, rotateX: -90 }}
            transition={{ duration: 0.4 }}
            className="d-flex align-items-center gap-2  px-2 py-2 rounded-3 "
          >
            <LuSun className="fs-4" />
            {/* <span className="fw-bold">Light </span> */}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

export default ThemeSwitcher;
