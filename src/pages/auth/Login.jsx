import { useContext, useEffect, useState } from "react";
import apiClient from "../../services/apiClient";
import { changeTabTitle } from "../../utils/changeTabTitle";
import { motion } from "framer-motion";
import { Link } from "react-router";
import { UserContext } from "../../UserContext/UserContext";

const Login = () => {
  const [zohoLoginUrl, setZohoLoginUrl] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const zoho_response = await apiClient.get("sso/login/zoho");
        setZohoLoginUrl(zoho_response.data.url);
      } catch (err) {}
    };

    fetchData();
  }, []);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setDirection((prev) => -prev);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  const slides = [
    {
      id: 1,
      img: "/images/slider/slider-1.png",
      text: (
        <p>
          Retrive<span> medical records or access </span>the client's
          <span> through a secured connection or cloud</span>
        </p>
      ),
    },
    {
      id: 2,
      img: "/images/slider/slider-2.png",
      text: (
        <p>
          <span>Pre-coding to check and validate the </span> correctness of
          information.
        </p>
      ),
    },
    {
      id: 3,
      head: <h4>Tracker</h4>,
      img: "/images/slider/slider-3.png",
      text: (
        <p>
          Review the records and assign appropriate
          <span> Procedure and Diagnosis codes</span>
        </p>
      ),
    },
    {
      id: 4,
      head: <h5>Tracker</h5>,
      img: "/images/slider/slider-4.png",
      text: (
        <p>
          Complete audit of <span>the coded </span> documnets by our
          <span>QA team</span>
        </p>
      ),
    },
    {
      id: 5,
      head: <h5>Tracker</h5>,
      img: "/images/slider/slider-5.png",
      text: (
        <p>
          Submission <span>of Coded </span>Chart
        </p>
      ),
      width: "100px",
    },
  ];
  const repeatedSlides = [...slides, ...slides];
  //   Change the title
  changeTabTitle("Login");
  const { theme } = useContext(UserContext);
  return (
    <>
      <div className="registration-container bg-light">
        <div className="container-fluid1">
          <div className="row mx-0 b ">
            <div className="col-md-6 col-lg-6 d-none d-sm-none d-lg-block pr-1 mobile-view-none">
              <div className="login-left ">
                <motion.div
                  animate={{
                    y: direction === 1 ? ["0%", "-50%"] : ["-50%", "0%"],
                  }}
                  transition={{
                    duration: 12,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatType: "loop",
                  }}
                  className="d-flex flex-column gap-4"
                >
                  {repeatedSlides.map((slide, index) => (
                    <div
                      key={index}
                      className="  d-flex align-items-center justify-content-center"
                    >
                      <div className="slide-contains bg-light d-flex flex-column align-items-center justify-content-center">
                        <div className="d-flex align-items-center mt-4">
                          {slide.head}
                        </div>
                        <div className="d-flex justify-content-center align-items-center mt-3">
                          <img
                            className="slide-asset"
                            src={slide.img}
                            style={{ width: slide?.width }}
                            alt="Task Management"
                          />
                        </div>
                        <div className="mt-2"> {slide.text}</div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              </div>
              <div
                className="relative"
                style={{
                  position: "relative",
                  //  height: "100px"
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "-45%",
                    left: "40%",
                    transform: "translate(-320%, -90%)",
                  }}
                ></div>
              </div>
            </div>

            <div className="col-12 col-sm 12 col-md-12 col-lg-6 plr-0">
              <div className="login-form">
                <div className="right-login">
                  <div className="login-content">
                    <p>Start managing your medical codes faster and better</p>
                  </div>

                  <div className="pro-logo mt-3  d-flex justify-content-center">
                    <img src="./images/main-logo.png" alt="Pro1-logo" />
                  </div>
                  {zohoLoginUrl && (
                    <Link to={zohoLoginUrl} className="text-decoration-none">
                      <button className="zoho-login d-flex justify-content-center  mt-3 ">
                        <img
                          className="zoho-mail ms-2 "
                          src="./images/login/zoho-mail.svg"
                          alt="zoho-mail"
                        />
                        {zohoLoginUrl && (
                          <p className="zoho-link ms-3 mb-0 mt-1">
                            Sign in with Zoho Email
                          </p>
                        )}
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
