import { useMemo } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import apiClient from "../../services/apiClient";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { FaArrowRight } from "react-icons/fa6";

const AddSearch = () => {
  const queryClient = useQueryClient();
  const formik = useFormik({
    initialValues: {
      search: "",
      value: "",
    },
    validationSchema: yup.object({
      search: yup.string().required("Search is required !"),
      value: yup.string().required("Value is required !"),
    }),
    onSubmit: async (values) => {
      await mutation.mutateAsync(values);
    },
  });

  const mutation = useMutation({
    mutationFn: (values) =>
      apiClient.post("users", values, { componentName: "addUser" }),
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
      formik.resetForm();
    },
    onError: (err) => {
      if (err.response?.data?.errors) {
        formik.setErrors(err.response.data.errors);
      }
    },
  });

  const SearchOptions = [
    { id: "1", value: "Coder chart" },
    { id: "2", value: "Auditor chart" },
    { id: "3", value: "Login email" },
  ];

  const SearchList = useMemo(() => {
    return SearchOptions.map((search) => (
      <option value={search.id} key={search.id}>
        {search.value}
      </option>
    ));
  }, []);

  return (
    <div className="card cus-card">
      <div className="card-body ">
        <form onSubmit={formik.handleSubmit} autoComplete="off">
          <div className="row align-items-end justify-content-start gy-2 px-2">
            {/* SearchBy Section */}
            <div className="col-lg-3">
              <label htmlFor="SearchBy" className="form-label required">
                Select By
              </label>
              <select
                className={`form-select form-control font-size13 ${
                  formik.touched.search && formik.errors.search && "is-invalid"
                }`}
                id="SearchBy"
                name="recitation_time"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.search}
              >
                <option disabled value="">
                  Search By
                </option>
                {SearchList}
              </select>
              {formik.touched.search && formik.errors.search ? (
                <div className="invalid-feedback">{formik.errors.search}</div>
              ) : (
                <div className="invisible">
                  <span>invisible</span>
                </div>
              )}
            </div>

            {/* Value Section */}
            <div className="col-lg-3">
              <label htmlFor="Value" className="form-label required">
                Value
              </label>
              <input
                type="text"
                className={`form-control font-size13 custom-inputborder  ${
                  formik.touched.value && formik.errors.value && "is-invalid"
                }`}
                id="Value"
                placeholder="Enter Value"
                name="value"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.value}
              />
              {formik.touched.value && formik.errors.value ? (
                <div id="role" className="invalid-feedback">
                  {formik.errors.value}
                </div>
              ) : (
                <div className="invisible">
                  <span>invisible</span>
                </div>
              )}
            </div>
            <div className="col-lg-1 w-auto">
              {mutation.isPending ? (
                <button
                  className="btn btn-primary font-size13 py-1 px-4"
                  type="button"
                  disabled
                >
                  <span
                    className="spinner-grow spinner-grow-sm"
                    aria-hidden="true"
                  ></span>
                  <span role="status">Loading...</span>
                </button>
              ) : (
                <button
                  type="submit"
                  className="btn btn-primary custom-primary-btn font-size13 py-2 px-4 d-flex align-items-center"
                >
                  Search
                  <FaArrowRight className="ms-2" />
                </button>
              )}
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

export default AddSearch;
