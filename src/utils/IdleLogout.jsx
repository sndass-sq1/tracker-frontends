
import { useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { decryptData } from "./cryptoUtil";


const events = ["load", "mousemove", "mousedown", "click", "scroll", "keypress"];

const IdleLogout = ({ children }) => {
    const auth = useAuth();
    const timerRef = useRef(null);

    const logoutUser = () => {
        if (decryptData(localStorage.getItem("auth-token"))) {
            auth && auth.logout();
        }
        // if (localStorage.getItem("auth-token")) {
        //     auth && auth.logout();
        // }
    };

    const resetTimer = () => {
        if (timerRef.current) clearTimeout(timerRef.current);

        timerRef.current = setTimeout(() => {
            cleanup();
            logoutUser();
        }, 900000); // 15 minutes
    };

    const setup = () => {
        events.forEach((event) =>
            window.addEventListener(event, resetTimer)
        );
        resetTimer();
    };

    const cleanup = () => {
        events.forEach((event) =>
            window.removeEventListener(event, resetTimer)
        );
        if (timerRef.current) clearTimeout(timerRef.current);
    };

    useEffect(() => {
        setup();
        return () => cleanup(); // Cleanup on component unmount
    }, []);

    return children;
};

export default IdleLogout;
