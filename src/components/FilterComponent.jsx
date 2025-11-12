import { useState } from "react";
import DatePicker from "react-datepicker";
import Select from "react-select";
import "react-datepicker/dist/react-datepicker.css";
import { IoMdArrowRoundForward } from "react-icons/io";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
const FilterComponent = ({
  timelineFilter,
  setTimelineFilter,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  setPage,
  applyCustomFilter,
  from,
  startTime,
  endTime,
  setStartTime,
  setEndTime,
}) => {
  const timelineOptions = [
    { label: "Overall", value: "" },
    { label: "Today", value: "today" },
    { label: "Yesterday", value: "yesterday" },
    { label: "Past 7 Days", value: "last_7_days" },
    { label: "Past 30 Days", value: "last_30_days" },
    { label: "Current Week", value: "weekly" },
    { label: "Current Month", value: "monthly" },
    { label: "Custom Range", value: "custom" },
  ];
  const [error, setError] = useState("");
  const handleApplyCustomDates = () => {
    if (from === "teamsummary") {
      if (!startTime || !endTime) {
        setError("Please select both start and end times.");
        return;
      }

      if (startTime > endTime) {
        setError("Start time cannot be after end time.");
        return;
      }

      setError("");
      applyCustomFilter("custom_date_with_time", startTime, endTime);
    } else {
      if (!startDate || !endDate) {
        setError("Please select both start and end dates.");
        return;
      }

      if (startDate > endDate) {
        setError("Start date cannot be after end date.");
        return;
      }

      setError("");
      applyCustomFilter("custom", startDate, endDate);
    }
  };

  const customStyles = (theme) => ({
    control: (base, state) => ({
      ...base,
      width: "200px",
      borderRadius: "10px",
      borderColor: theme === "dark" ? "#888" : "#63606094",
      backgroundColor: theme === "dark" ? "#23272F" : "#fff",
      color: "#FFFFFF",
      outline: "none",
      boxShadow: state.isFocused ? "#33B1FF" : "none",
      "&:hover": {
        borderColor: "#33B1FF",
        cursor: "pointer",
      },
    }),
    option: (base, state) => ({
      ...base,

      width: "200px",
      backgroundColor: state.isSelected
        ? "#33B1FF"
        : state.isFocused
          ? theme === "dark"
            ? "#3b3f4b"
            : "#E9F9F7"
          : theme === "dark"
            ? "#2f3135"
            : "white",
      color: state.isSelected
        ? "white"
        : theme === "dark"
          ? "#f0f0f0"
          : "black",
      cursor: "pointer",
    }),
    placeholder: (base) => ({
      ...base,
      color: theme === "dark" ? "#FFFFFF" : "#000000",
      fontSize: "13px",
    }),
    singleValue: (base) => ({
      ...base,
      color: theme === "dark" ? "#FFFFFF" : "#000000",
    }),
    noOptionsMessage: (provided) => ({
      ...provided,
      backgroundColor: "#fff",
      color: "#000",
      padding: 10,
      fontSize: "14px",
      fontWeight: "bold",
      // borderRadius: "4px",
      textAlign: "center",
      // padding: "10px !important",
      ...(theme === "dark" && {
        backgroundColor: "#222",
        color: "#fff",
      }),
    }),
  });

  return (
    <div className="filter-container d-flex space-y-2">
      <Select
        // styles={customStyles(theme)}
        classNamePrefix="custom-select"
        options={timelineOptions}
        className="text-theme"
        isSearchable={false}
        value={timelineOptions.find((opt) => opt.value === timelineFilter)}
        onChange={(selected) => {
          setTimelineFilter(selected.value);
          setStartDate(null);
          setEndDate(null);
          setPage(1);
          if (selected.value !== "custom") {
            applyCustomFilter(selected.value, null, null);
          }
        }}
        placeholder="Select Timeframe"
      />

      {timelineFilter.includes("custom") && (
        <>
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip id="datepicker-tooltip">
                {error ? (
                  <span>{error}</span>
                ) : (
                  <span>Select a custom date range</span>
                )}
              </Tooltip>
            }
          >
            <div className="d-flex justify-content-between ms-2 ">
              <span>
                <DatePicker
                  selected={startDate}
                  onChange={(update) => {
                    const [start, end] = update;
                    setStartDate(start);
                    setEndDate(end);

                    if (!start || !end) {
                      setError("Please select both start and end dates.");
                    } else if (start > end) {
                      setError("Start date cannot be after end date.");
                    } else {
                      setError("");
                    }
                  }}
                  selectsRange
                  startDate={startDate}
                  endDate={endDate}
                  maxDate={new Date()}
                  className="py-1 px-2 border-theme custom-range me-3"
                  placeholderText="Select date range"
                />
              </span>

              {from === "teamsummary" && (
                <>
                  <div className="w-110 ">
                    <DatePicker
                      selected={startTime}
                      onChange={(date) => {
                        if (date) {
                          if (startDate) {
                            const combined = new Date(startDate);
                            combined.setHours(date.getHours());
                            combined.setMinutes(date.getMinutes());
                            combined.setSeconds(0);
                            setStartTime(combined);
                          } else {
                            setStartTime(date);
                          }
                          // setTimelineFilter("custom_date_with_time");
                        } else {
                          setStartTime(null);
                        }
                      }}
                      showTimeSelect
                      showTimeSelectOnly
                      timeIntervals={60}
                      timeCaption="Time"
                      dateFormat="h:mm aa"
                      placeholderText="Start time"
                      isClearable
                      className="w-full py-1 px-2 border-hover outline-none custom-range"
                    />
                  </div>

                  <div className="w-110">
                    <DatePicker
                      selected={endTime}
                      onChange={(date) => {
                        if (date) {
                          if (endDate) {
                            const combined = new Date(endDate);
                            combined.setHours(date.getHours());
                            combined.setMinutes(date.getMinutes());
                            combined.setSeconds(0);
                            setEndTime(combined);
                          } else {
                            setEndTime(date);
                          }
                          setTimelineFilter("custom_date_with_time");
                        } else {
                          setEndTime(null);
                        }
                      }}
                      showTimeSelect
                      showTimeSelectOnly
                      timeIntervals={60}
                      timeCaption="Time"
                      dateFormat="h:mm aa"
                      placeholderText="End time"
                      isClearable
                      className="w-full py-1 px-2  border-hover outline-none custom-range"
                    />
                  </div>
                </>
              )}
              <button
                className="btn btn-primary custom-primary-btn back-btn font-size13 ms-2"
                onClick={handleApplyCustomDates}
                disabled={!startDate || !endDate}
              >
                <IoMdArrowRoundForward className="fs-5" />
              </button>
            </div>
          </OverlayTrigger>
        </>
      )}
    </div>
  );
};

export default FilterComponent;
