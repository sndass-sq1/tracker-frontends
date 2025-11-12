import { Link } from "react-router";

const Forbidden = () => {
  return (
    <div className="container d-flex align-items-center justify-content-center flex-column vh-100 reg-container reg-font-weight">
      <h4>403</h4>
      <div className="m-t-20">
        <img
          className="img-width"
          src="/images/error-image/forbidden.png"
          alt="error-401"
        />
      </div>
      <div>
        <h3 className="m-t-48">Error Forbidden</h3>
      </div>
      <div className="text-center">
        <p className="m-t-17">
          The page you’re trying to access has restricted access
          <br />
          Please refer to your system administrator
        </p>
        <Link to={`/login`}>
          <button className="btn btn-primary custom-primary-btn font-size13 py-2 px-4 m-t-20 w-half">
            Back to Login
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Forbidden;
