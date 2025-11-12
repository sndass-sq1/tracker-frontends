import React from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../../services/apiClient";
import { FaArrowRight } from "react-icons/fa6";

const AddSubProject = ({ selectedProjectId }) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (values) =>
      apiClient.post(`sub-projects`, values, {
        componentName: "addSubProject",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries([
        "projects",
        `sub-projects/dropdown/${selectedProjectId}`,
      ]);
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
      project_id: selectedProjectId,
      sub_project_name: "",
    },
    validationSchema: yup.object({
      project_id: yup.string().required("Project Id is required"),
      sub_project_name: yup
        .string()
        .min(3, "Too Short!")
        // .max(30, "Must be 30 characters or less")
        .required("Sub Project name is required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      await mutation.mutateAsync(values);
      resetForm();
    },
  });

  return (
    <>
      <div className="card cus-card darkcard sub-card p-2">
        <div className="card-body font-size13 sub-card">
          <form onSubmit={formik.handleSubmit} autoComplete="off">
            <div className="d-flex  align-items-end justify-content-between gy-3  gap-3">
              <div className="col-lg px-1 ">
                <label
                  htmlFor="sub_project_name"
                  className="form-label required"
                >
                  Subproject Name
                </label>
                <input
                  type="text"
                  className={`form-control font-size13 custom-inputborder  ${
                    formik.touched.sub_project_name &&
                    formik.errors.sub_project_name &&
                    "is-invalid"
                  }`}
                  id="sub_project_name"
                  // placeholder='Enter project Name'
                  name="sub_project_name"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.sub_project_name}
                />
                {formik.touched.sub_project_name &&
                formik.errors.sub_project_name ? (
                  <div id="role" className="invalid-feedback">
                    {formik.errors.sub_project_name}
                  </div>
                ) : (
                  <div className="invisible">
                    <span>invisible</span>
                  </div>
                )}
              </div>
              <div className="col-lg-3  w-auto ">
                <div className="d-flex justify-content-end">
                  <button
                    type="submit"
                    className="btn btn-primary custom-primary-btn font-size13 py-2 px-4 d-flex align-items-center"
                    disabled={mutation.isPending}
                  >
                    {mutation.isPending ? (
                      <span>Loading...</span>
                    ) : (
                      "Add Subproject"
                    )}
                    <FaArrowRight className="ms-2" />
                  </button>
                  {/* <button
                    type="reset"
                    className="btn font-size13 py-2 px-4 d-flex align-items-center"
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

export default AddSubProject;
