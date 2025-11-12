import React from "react";
import { useNavigate } from "react-router-dom";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.errorInfo) {
      return (
        <div
          className="d-flex justify-content-center align-items-center flex-column text-center"
          style={{ height: "85vh" }}
        >
          <p className="fs-5">
            Something went wrong. <br />
            <span className="fs-6">Please contact IT support.</span> <br />
            <a href="mailto:helpdesk@secqureonehs.com" className="fs-6">
              helpdesk@pro1hs.com
            </a>
          </p>
          <GoBackButton />
          <details style={{ marginTop: "10px" }}>
            <summary className="text-theme">Error Details</summary>
            {this.state.error?.toString()}
            <br />
            {this.state.errorInfo?.componentStack}
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}

// Separate function component to handle navigation inside a class component
const GoBackButton = () => {
  const navigate = useNavigate();
  return (
    <button
      className="btn btn-primary"
      onClick={() => navigate("/", { replace: true })}
    >
      Go Back
    </button>
  );
};

export default ErrorBoundary;
