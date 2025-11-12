import axios from "axios";
import { toast } from "react-toastify";

// create axios instance
const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_APP_BACKEND_BASE_URL}`,
});

// Request
apiClient.interceptors.request.use(
  (req) => {
    // spinning start to show
    // UPDATE: Add this code to show global loading indicator

    let componentName = req.componentName;

    if (componentName) {
      document
        .querySelectorAll(`#${componentName}-loading-indicator`)
        .forEach((element) => element?.classList.remove("d-none"));
    } else {
      document.body.classList.add("loading-indicator");
    }

    // Add configurations here

    return req;
  },
  (err) => {
    return Promise.reject(err);
  }
);

// Response
apiClient.interceptors.response.use(
  (res) => {
    // spinning hide
    // UPDATE: Add this code to hide global loading indicator
    let componentName = res.config.componentName;

    if (componentName) {
      document
        .querySelectorAll(`#${componentName}-loading-indicator`)
        .forEach((element) => element?.classList.add("d-none"));
    } else {
      document.body.classList.remove("loading-indicator");
    }

    // document.body.classList.remove("loading-indicator");
    // toast.success(res.data.message);

    if (
      res.data &&
      res.data.message &&
      ["post", "put", "patch", "delete"].includes(
        res.config.method.toLowerCase()
      )
    ) {
      toast.success(res.data.message);
    }

    return res;
  },
  (err) => {
    let componentName = err.config.componentName;
    const data = err.response.data;
    const commonErrorStatuses = [400, 404, 405, 409, 500];
    if (componentName) {
      document
        .querySelectorAll(`#${componentName}-loading-indicator`)
        .forEach((element) => element?.classList.add("d-none"));
      document
        .querySelectorAll(`#${componentName}-loading-indicator`)
        .forEach((element) => element?.classList.add("bg-secondary"));
    } else {
      document.body.classList.remove("loading-indicator");
    }

    // spinning hide
    // UPDATE: Add this code to hide global loading indicator
    document.body.classList.remove("loading-indicator");

    if (err.response.status === 401) {
      localStorage.clear();
      window.location.pathname = "/login";
    }
    // if (err.response.status === 403) {
    //   localStorage.clear();
    //   window.location.pathname = "/login";
    // }
    if (err.response.status === 403) {
      if (err.response.data && err.response.data.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("You do not have permission to perform this action.");
      }
    }
    if (err.response.status === 422) {
      if (typeof data.error === "string") {
        toast.error(data.error);
      } else if (data.errors && typeof data.errors === "object") {
        const messages = Object.values(data.errors).flat().join(" ");
        toast.error(`${data.message}: ${messages}`);
      } else {
        toast.error(data.message || err.response.statusText);
      }
    }
    if (commonErrorStatuses.includes(err.response.status)) {
      toast.error(data.message || err.response.statusText);
    }
  }
);

export default apiClient;
