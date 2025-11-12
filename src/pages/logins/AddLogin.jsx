import { useFormik } from "formik";
import * as yup from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../services/apiClient";
import { FaArrowRight } from "react-icons/fa6";

const AddLogin = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (values) =>
      apiClient.post("logins", values, { componentName: "addLogin" }),
    onSuccess: () => {
      queryClient.invalidateQueries(["logins"]);
      formik.resetForm();
    },
    onError: (err) => {
      if (err.response?.data?.errors) {
        formik.setErrors(err.response.data.errors);
      }
    },
  });

  const formik = useFormik({
    initialValues: {
      login_name: "",
      login_email: "",
    },
    validationSchema: yup.object({
      login_name: yup
        .string()
        .matches(/^[A-Za-z\s]+$/, "Login Name must contain only letters !")
        .min(3, "Too Short !")
        .max(30, "Must be 30 characters or less !")
        .required("Name is required !"),
      login_email: yup
        .string()
        .required("Email is required !")
        .test(
          "no-spaces",
          "Spaces are not allowed in the email !",
          (value) => !/\s/.test(value || "")
        )
        .email("Invalid email !"),
    }),
    onSubmit: async (values) => {
      await mutation.mutateAsync(values);
    },
  });
  return (
    <div className="card darkcard cus-card logins-form">
      <div className="card-body">
        <form onSubmit={formik.handleSubmit} autoComplete="off">
          <div className="row align-items-end  justify-content-start gy-2 px-lg-2">
            <div className="col-lg-3 px-1">
              <label htmlFor="loginName" className="form-label required">
                Name
              </label>
              <input
                type="text"
                name="login_name"
                maxLength={30}
                className={`form-control  font-size13 custom-inputborder  ${
                  formik.touched.login_name &&
                  formik.errors.login_name &&
                  "is-invalid"
                }`}
                id="loginName"
                placeholder="Enter Name"
                onChange={(e) => {
                  formik.handleChange(e);
                  formik.setFieldTouched("login_name", true, false);
                }}
                onBlur={formik.handleBlur}
                value={formik.values.login_name}
                onPaste={(e) => {
                  e.preventDefault();
                  const pastedValue = e.clipboardData.getData("text").trim();
                  formik.setFieldValue("login_name", pastedValue);
                }}
              />
              {formik.touched.login_name && formik.errors.login_name ? (
                <div id="loginName" className="invalid-feedback ">
                  {formik.errors.login_name}
                </div>
              ) : (
                <div className="invisible">
                  <span>invisible</span>
                </div>
              )}
            </div>
            <div className="col-lg-3 px-1">
              <label htmlFor="loginEmail" className="form-label required">
                Email
              </label>
              <input
                type="email"
                name="login_email"
                maxLength={50}
                className={`form-control font-size13 custom-inputborder  ${
                  formik.touched.login_email &&
                  formik.errors.login_email &&
                  "is-invalid"
                }`}
                id="loginEmail"
                placeholder="Enter Login Email"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.login_email}
                onPaste={(e) => {
                  e.preventDefault();
                  const pastedValue = e.clipboardData.getData("text").trim();
                  formik.setFieldValue("login_email", pastedValue);
                }}
              />
              {formik.touched.login_email && formik.errors.login_email ? (
                <div id="loginEmail" className="invalid-feedback ">
                  {formik.errors.login_email}
                </div>
              ) : (
                <div className="invisible">
                  <span>invisible</span>
                </div>
              )}
            </div>

            <div className="col-lg-3 ">
              <div className="d-flex">
                <button
                  type="submit"
                  className="btn btn-primary custom-primary-btn font-size13 py-2 px-4 d-flex align-items-center"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? <span>Loading...</span> : "Add Login"}
                  <FaArrowRight className="ms-2" />
                </button>
                {/* <button type="reset" className="btn font-size13 py-2 px-4 d-flex align-items-center"
                  onClick={formik.resetForm}
                >
                  Clear
                </button> */}
              </div>
              <div className="invisible">
                <span>invisible</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLogin;
