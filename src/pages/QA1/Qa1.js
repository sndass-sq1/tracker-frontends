import React, { useState, useMemo, useRef } from "react";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import { useFormik } from "formik";
import * as yup from "yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FaArrowRight, FaDownload } from "react-icons/fa";
import apiClient from "../../services/apiClient";
import ReactTable from "../../components/ReactTable";
import QA1Columns from "../bulkUpload/QA1Columns";
import { payloadFormatDate } from "../../utils/payloadDateFormat";
import { changeTabTitle } from "../../utils/changeTabTitle";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import FilterComponent from "../../components/FilterComponent";
import { ResetFilter } from "../../components/ResetFilter";
import { payloadFormatDateTime } from "../../utils/payloadFormatDateTime";

const Qa1 = ({ module, from }) => {
  changeTabTitle("QA1");
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [search, setSearch] = useState("");
  const [sortType, setSortType] = useState("");
  const [sortColumn, setSortColumn] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [timelineFilter, setTimelineFilter] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [appliedTimelineFilter, setAppliedTimelineFilter] = useState("");
  const [appliedStartDate, setAppliedStartDate] = useState(null);
  const [appliedEndDate, setAppliedEndDate] = useState(null);
  const getQA1 = async () => {
    try {
      let params = {
        page: page,
        perPage: perPage,
        search: search,
        sortOrder: sortType,
        sortBy: sortColumn,
      };

      if (
        appliedTimelineFilter === "custom" &&
        appliedStartDate instanceof Date &&
        appliedEndDate instanceof Date
      ) {
        params.timeline = "custom";
        params["customDates[0]"] = payloadFormatDate(appliedStartDate);
        params["customDates[1]"] = payloadFormatDate(appliedEndDate);
      } else if (appliedTimelineFilter) {
        params.timeline = appliedTimelineFilter;
      }
      if (timelineFilter === "custom_date_with_time" && startTime && endTime) {
        params["customDates[0]"] = payloadFormatDateTime(startTime);
        params["customDates[1]"] = payloadFormatDateTime(endTime);
      }
      Object.keys(params).forEach(
        (key) =>
          (params[key] === undefined ||
            params[key] === null ||
            params[key] === "") &&
          delete params[key]
      );
      const response = await apiClient.get(`quality-analyses/qa1`, {
        params: { ...params },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const applyCustomFilter = (filter, start, end) => {
    setAppliedTimelineFilter(filter);
    setAppliedStartDate(start);
    setAppliedEndDate(end);
    setPage(1);
  };
  const getPreviewQA1 = async () => {
    try {
      let params = {
        page: page,
        perPage: perPage,
        search: search,
        sortOrder: sortType,
        sortBy: sortColumn,
        timeline: timelineFilter,
      };
      if (timelineFilter !== "custom") {
        params.timeline = timelineFilter;
      } else {
        if (
          timelineFilter === "custom" &&
          startDate instanceof Date &&
          endDate instanceof Date
        ) {
          params.timeline = timelineFilter;
          params["customDates[0]"] = payloadFormatDate(startDate);
          params["customDates[1]"] = payloadFormatDate(endDate);
        }
      }
      Object.keys(params).forEach(
        (key) =>
          (params[key] === undefined ||
            params[key] === null ||
            params[key] === "") &&
          delete params[key]
      );
      const response = await apiClient.get(`quality-analyses/get-import`, {
        params: { ...params },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  };
  const { data: previewData, isLoading: previewDataloading } = useQuery({
    queryKey: [
      "getPreviewQA1",
      page,
      perPage,
      search,
      sortType,
      sortColumn,
      timelineFilter,
      startDate,
      endDate,
    ],
    queryFn: getPreviewQA1,
    staleTime: 5 * 60 * 1000,
  });

  const { data, isLoading } = useQuery({
    queryKey: [
      "getQA1",
      page,
      perPage,
      search,
      sortType,
      sortColumn,
      timelineFilter,
      startDate,
      endDate,
    ],
    queryFn: getQA1,
    staleTime: 5 * 60 * 1000,
  });

  let tableColumns = useMemo(() => QA1Columns({ search }), [search]);

  const mutation = useMutation({
    mutationFn: (values) =>
      apiClient.post(`quality-analyses/import/qa1`, values, {
        componentName: "addQA1",
      }),
  });

  const formik = useFormik({
    initialValues: {
      file: null,
    },
    validationSchema: yup.object({
      file: yup.mixed().required("File is required !"),
    }),
    onSubmit: async (values, { resetForm }) => {
      const formData = new FormData();
      formData.append("file", values.file);

      await mutation.mutateAsync(formData, {
        onSuccess: async () => {
          queryClient.invalidateQueries([`${module}`]);
          formik.resetForm();
          formik.setFieldValue("file", null);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        },
        onError: () => {
          formik.setFieldValue("file", null);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        },
      });
      resetForm();
    },
  });
  const sampleTemplate = async () => {
    try {
      const response = await apiClient.get(`quality-analyses/qa1-template`, {
        responseType: "blob",
      });
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `sampleqa1.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const handleFileChange = (event) => {
    formik.setFieldValue("file", event.currentTarget.files[0]);
  };

  const handleStore = async () => {
    try {
      await apiClient.post(`quality-analyses/import-store`, null, {
        componentName: "storePreviewData",
      });
      queryClient.invalidateQueries(["getQa1"]);
      queryClient.invalidateQueries(["getPreviewQA1"]);
    } catch (error) {
      console.error("Store failed:", error);
    }
  };
  return (
    <div className="container-fluid overflow-y-auto">
      {/* <div className=" d-flex justify-content-between align-items-center mx-3 my-2">
      </div> */}
      <Tabs
        // activeKey={activeTab}
        // onSelect={handleTabSelect}
        id="uncontrolled-tab-example"
        className="mt-3 px-3 py-0 darkcard w-auto border-none "
      >
        <Tab eventKey="Qa1Dashboard" title="Qa1 Dashboard">
          QA1 Dashboard
        </Tab>
        <Tab eventKey="AddQuality1" title="AddQuality 1">
          <div className=" d-flex justify-content-between align-items-center mx-3 my-2"></div>
          <div className="card cus-card ">
            <div className="card-body d-flex justify-content-between">
              <form
                className="w-100"
                onSubmit={formik.handleSubmit}
                autoComplete="off"
              >
                <div className="row align-items-end justify-content-start gy-2 px-2 ">
                  <div className="col-lg-6">
                    <label htmlFor="File" className="form-label">
                      File
                    </label>
                    <input
                      type="file"
                      className={`form-control font-size13 custom-inputborder  ${
                        formik.touched.file &&
                        formik.errors.file &&
                        "is-invalid"
                      }`}
                      id="File"
                      name="file"
                      onChange={handleFileChange}
                      onBlur={formik.handleBlur}
                      accept=".xls,.xlsx, .csv"
                      ref={fileInputRef}
                    />
                    {formik.touched.file && formik.errors.file ? (
                      <div id="role" className="invalid-feedback">
                        {formik.errors.file}
                      </div>
                    ) : (
                      <div className="invisible">
                        <span>invisible</span>
                      </div>
                    )}
                  </div>
                  <div className="col-lg-3  w-auto">
                    <div className="d-flex">
                      <button
                        type="submit"
                        className="btn btn-primary custom-primary-btn font-size13 py-2 px-4 d-flex align-items-center"
                        disabled={mutation.isPending}
                      >
                        {mutation.isPending ? (
                          <span>Loading...</span>
                        ) : (
                          "Add QA1"
                        )}
                        <FaArrowRight className="ms-2" />
                      </button>
                    </div>
                    <div className="invisible">
                      <span>invisible</span>
                    </div>
                  </div>
                </div>
              </form>
              <OverlayTrigger
                overlay={
                  <Tooltip className="text-cap">
                    Click here to download the sample template
                  </Tooltip>
                }
                container={this}
                placement="left"
              >
                <FaDownload onClick={sampleTemplate} />
              </OverlayTrigger>
            </div>
          </div>
          <div className="table-section qaadd-table mt-3">
            <div className="tableparent">
              <div className="d-flex justify-content-between align-items-end flex-wrap flex-md-wrap flex-sm-wrap gap-md-3 gap-sm-3 gap-3 table-header-pdng qaadd-header">
                <div className="d-flex gap-3 justify-start_md align-items-center left-flex-basic">
                  <div className="t-title">
                    <span>{"QA1"}</span>
                    {previewData?.pagination?.total ? (
                      <>
                        <span className="cus-count ms-2">
                          {previewData?.pagination?.total}
                        </span>
                      </>
                    ) : null}
                  </div>
                </div>
                <div className="d-flex gap-3 justify-end_md align-items-center right-flex-basic px-2 pt-1">
                  <div className="col-lg-3  w-auto">
                    {data?.pagination?.total ? (
                      <div className="d-flex">
                        <button
                          type="button"
                          className="btn btn-primary custom-primary-btn font-size13 py-2 px-4 d-flex align-items-center"
                          disabled={
                            mutation.isPending || data?.data.length === 0
                          }
                          onClick={handleStore}
                        >
                          {mutation.isPending ? (
                            <span>Loading...</span>
                          ) : (
                            "Store"
                          )}
                          <FaArrowRight className="ms-2" />
                        </button>
                      </div>
                    ) : (
                      <></>
                    )}
                  </div>
                </div>
              </div>
              <div className="qaadd-body px-3 pb-3">
                <ReactTable
                  data={previewData}
                  columns={tableColumns}
                  apiEndPoint={"quality-analyses/get-import"}
                  queryKey={"getPreviewQA1"}
                  search={search}
                  setSearch={setSearch}
                  page={page}
                  setPage={setPage}
                  perPage={perPage}
                  setPerPage={setPerPage}
                  isLoading={previewDataloading}
                  setSortType={setSortType}
                  setSortColumn={setSortColumn}
                  sortType={sortType}
                  sortColumn={sortColumn}
                  tableHeight={"88%"}
                />
              </div>
            </div>
          </div>
        </Tab>
        <Tab eventKey="QA1Audits" title="QA1 Audits">
          <div className="table-section qaaudit-table mt-3">
            <div className="tableparent">
              <div className="d-flex justify-content-between align-items-end flex-wrap flex-md-wrap flex-sm-wrap gap-md-3 gap-sm-3 gap-3 table-header-pdng qaaudit-header">
                <div className="d-flex gap-3 justify-start_md align-items-center left-flex-basic">
                  <div className="t-title">
                    <span>{"QA1"}</span>
                    {data?.pagination?.total ? (
                      <>
                        <span className="cus-count ms-2">
                          {data?.pagination?.total}
                        </span>
                      </>
                    ) : null}
                  </div>
                </div>

                <div className="d-flex gap-3 justify-end_md align-items-center right-flex-basic px-2 pt-1 ">
                  {/* <div className="d-flex gap-3 align-items-center"> */}
                  <div className="main-filter">
                    <FilterComponent
                      from={from}
                      timelineFilter={timelineFilter}
                      setTimelineFilter={setTimelineFilter}
                      startDate={startDate}
                      setStartDate={setStartDate}
                      endDate={endDate}
                      setEndDate={setEndDate}
                      applyCustomFilter={applyCustomFilter}
                      startTime={startTime}
                      setStartTime={setStartTime}
                      endTime={endTime}
                      setEndTime={setEndTime}
                      setPage={setPage}
                    />
                  </div>
                  <ResetFilter
                    setTimelineFilter={setTimelineFilter}
                    setAppliedTimelineFilter={setAppliedTimelineFilter}
                    setAppliedStartDate={setAppliedStartDate}
                    setAppliedEndDate={setAppliedEndDate}
                    timelineFilter={timelineFilter}
                    appliedTimelineFilter={appliedTimelineFilter}
                    appliedStartDate={appliedStartDate}
                    appliedEndDate={appliedEndDate}
                    search={search}
                    setSearch={setSearch}
                    page={page}
                    setPage={setPage}
                    startTime={startTime}
                    endTime={endTime}
                    setStartTime={setStartTime}
                    setEndTime={setEndTime}
                  />

                  {/* </div> */}
                </div>
              </div>
              <div className="qaaudit-body px-3 pb-3">
                <ReactTable
                  data={data}
                  columns={tableColumns}
                  apiEndPoint={"quality-analyses/qa1"}
                  queryKey={"getQa1"}
                  search={search}
                  setSearch={setSearch}
                  page={page}
                  setPage={setPage}
                  perPage={perPage}
                  setPerPage={setPerPage}
                  isLoading={isLoading}
                  setSortType={setSortType}
                  setSortColumn={setSortColumn}
                  sortType={sortType}
                  sortColumn={sortColumn}
                  tableHeight={"88%"}
                />
              </div>
            </div>
          </div>
        </Tab>
      </Tabs>
    </div>
  );
};
export default Qa1;
