import { toast } from "react-toastify";
import apiClient from "../services/apiClient";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { payloadFormatDateTime } from "../utils/payloadFormatDateTime";
import { payloadFormatDate } from "../utils/payloadDateFormat";
const Export = ({
  exportApiEndPoint,
  timelineFilter,
  search,
  sortType,
  sortColumn,
  disabled,
  module,
  startTime,
  endTime,
  role_id,
  location_id,
  project_id,
  manager_id,
}) => {
  const handleExport = async () => {
    try {
      let params = {
        search,
        sortOrder: sortType,
        sortBy: sortColumn,
        timeline: timelineFilter,
        ...(role_id && { role_id }),
        ...(location_id && { location_id }),
        ...(project_id && { project_id }),
        ...(manager_id && { manager_id }),
      };

      // Handle custom date range
      if (startTime instanceof Date && endTime instanceof Date) {
        if (timelineFilter === "custom_date_with_time") {
          params.timeline = "custom_date_with_time";
          params["customDates[0]"] = payloadFormatDateTime(startTime);
          params["customDates[1]"] = payloadFormatDateTime(endTime);
        } else if (timelineFilter === "custom") {
          params.timeline = "custom";
          params["customDates[0]"] = payloadFormatDate(startTime);
          params["customDates[1]"] = payloadFormatDate(endTime);
        }
      }

      const response = await apiClient.get(exportApiEndPoint, {
        params,
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${module}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("File downloaded successfully!", { autoClose: 3000 });
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "An unexpected error occurred during export.";
      toast.error(errorMessage, { autoClose: 5000 });
    }
  };

  return (
    <div className="cursor-wrapper ">
      {module === "production" ? (
        <>
          <OverlayTrigger
            key=""
            placement="top"
            overlay={
              <Tooltip>
                <p>Hourly Export</p>
              </Tooltip>
            }
          >
            <div
              className={`stroke-btn border-theme ${
                disabled ? "wrapper-not-allowed " : "filtered-image"
              }`}
              onClick={handleExport}
            >
              <img src="/images/import-light.png" alt="Import" className="" />
            </div>
          </OverlayTrigger>
        </>
      ) : (
        <OverlayTrigger
          key=""
          placement="top"
          overlay={
            <Tooltip>
              <p>Download</p>
            </Tooltip>
          }
        >
          <div
            className={`stroke-btn border-theme ${
              disabled
                ? "wrapper-not-allowed filtered-image1 "
                : "filtered-image1"
            }`}
            onClick={handleExport}
          >
            <img src="/images/import-light.png" alt="Import" className="" />
          </div>
        </OverlayTrigger>
      )}
    </div>
  );
};

export default Export;
