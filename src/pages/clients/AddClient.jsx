

import { useFormik } from "formik";
import * as yup from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../services/apiClient";
import { FaArrowRight } from "react-icons/fa6";

const AddClient = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (values) =>
      apiClient.post("clients", values, { componentName: "addClient" }),
    onSuccess: () => {
      queryClient.invalidateQueries(["clients"]);
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
      client_name: "",
      client_code: "",
    },
    validationSchema: yup.object({
      client_name: yup
        .string()

        .matches(
          /^[A-Za-z0-9-_ ]+$/,
          "Only string, number,underscore and hypen are allowed !"
        )
        .min(3, "Too Short !,")
        .max(30, "Must be 30 characters or less !")
        .required("Client name is required !"),
      client_code: yup
        .string()
        .required("Client code is required !")
        .matches(
          /^[A-Za-z0-9!@#$%^&*(),-_.?":{}|<> ]+$/,
          "Only letters, numbers, and symbols are allowed !"
        )
        .min(3, "Too Short ! Minimum 3 characters !")
        .max(30, "Must be 30 characters or less !"),
    }),
    onSubmit: async (values) => {
      await mutation.mutateAsync(values);
    },
  });
  return (
    <>
      <div className="card darkcard cus-card client-form ">
        <div className="card-body ">
          <form onSubmit={formik.handleSubmit} autoComplete="off">
            <div className="row align-items-end justify-content-start gy-2 px-2">
              <div className="col-lg-3 px-1">
                <label htmlFor="clientName" className="form-label dark-lable required">
                  Client Name
                </label>
                <input
                  type="text"
                  maxLength={30}
                  className={`form-control font-size13 custom-inputborder   ${formik.touched.client_name &&
                    formik.errors.client_name &&
                    "is-invalid"
                    }`}
                  id="clientName"
                  placeholder="Enter Client Name"
                  name="client_name"
                  onChange={(e) => {
                    formik.handleChange(e);
                    formik.setFieldTouched("client_name", true, false);
                  }}
                  onBlur={formik.handleBlur}
                  value={formik.values.client_name}
                  onPaste={(e) => {
                    e.preventDefault();
                    const pastedValue = e.clipboardData.getData("text").trim();
                    formik.setFieldValue("client_name", pastedValue);
                  }}
                />
                {formik.touched.client_name && formik.errors.client_name ? (
                  <div id="clientName" className="invalid-feedback">
                    {formik.errors.client_name}
                  </div>
                ) : (
                  <div className="invisible">
                    <span>invisible</span>
                  </div>
                )}
              </div>
              <div className="col-lg-3 px-1">
                <label htmlFor="clientCode" className="form-label required">
                  Client Code
                </label>
                <input
                  type="text"
                  maxLength={30}
                  className={`form-control font-size13 custom-inputborder  ${formik.touched.client_code &&
                    formik.errors.client_code &&
                    "is-invalid"
                    }`}
                  id="clientCode"
                  placeholder="Enter Client Code"
                  name="client_code"
                  onChange={(e) => {
                    formik.handleChange(e);
                    formik.setFieldTouched("client_code", true, false);
                  }}
                  onBlur={formik.handleBlur}
                  value={formik.values.client_code}
                  onPaste={(e) => {
                    e.preventDefault();
                    const pastedValue = e.clipboardData.getData("text").trim();
                    formik.setFieldValue("client_code", pastedValue);
                  }}
                />
                {formik.touched.client_code && formik.errors.client_code ? (
                  <div id="clientCode" className="invalid-feedback  ">
                    {formik.errors.client_code}
                  </div>
                ) : (
                  <div className="invisible">
                    <span>invisible</span>
                  </div>
                )}
              </div>

              <div className="col-lg-3 w-auto ">
                <div className="d-flex ">
                  <button
                    type="submit"
                    className="btn btn-primary  add-client-btn custom-primary-btn font-size13 py-2 px-4 d-flex align-items-center "
                    disabled={mutation.isPending}
                  >
                    {mutation.isPending ? (
                      <span>Loading...</span>
                    ) : (
                      "Add Client"
                    )}
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
    </>
  );
};

export default AddClient;
