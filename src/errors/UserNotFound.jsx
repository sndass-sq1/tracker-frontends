import { useLocation } from "react-router";

const UserNotFound = () => {
  const location = useLocation();
  const message = location?.state?.message;

  const handleBackToLogin = () => {
    localStorage.clear();
    window.location.pathname = "/login";
  };
  return (
    <div className="container d-flex align-items-center justify-content-center flex-column gap-5 vh-100 reg-container">
      <h4 className="text-center">User not found</h4>
      <div>
        <img
          className="img-width"
          src="/images/error-image/notfound.png"
          alt="no-email"
        />
      </div>
      <div className="text-center primary-btn">
        {message && <p>{message}</p>}
        <button
          onClick={handleBackToLogin}
          className="btn btn-primary custom-primary-btn font-size13 py-2 px-4 m-t-20 w-half"
        >
          Back to Login
        </button>
      </div>

    </div>
  );
};

export default UserNotFound;
