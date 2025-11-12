import { OverlayTrigger, Tooltip } from "react-bootstrap";

export const ResetFilter = ({
  setTimelineFilter,
  timelineFilter,
  search,
  setSearch,
  setPage,
  page,
  appliedTimelineFilter,
  appliedStartDate,
  appliedEndDate,
  setAppliedTimelineFilter,
  setAppliedStartDate,
  setAppliedEndDate,
  setStartTime,
  setEndTime,
  setFilteredRoleId,
  setFilteredLocationId,
  setFilteredManagerId,
  filteredManagerId,
  setFilteredLeadId,
  filteredLeadId,
  setFilteredProjectheadId,
  filteredProjectheadId,
  setFilteredProjectId,
  filteredProjectId,
  filteredRoleId,
  filteredLocationId,
  setFilteredAssignId,
  filteredAssignId,
  onResetRoleFilter,
}) => {
  const isResetDisabled =
    timelineFilter === "" &&
    search === "" &&
    page === 1 &&
    !appliedTimelineFilter &&
    !appliedStartDate &&
    !appliedEndDate &&
    !filteredRoleId &&
    !filteredManagerId &&
    !filteredLeadId &&
    !filteredProjectheadId &&
    !filteredProjectId &&
    !filteredLocationId &&
    !filteredAssignId;

  const handleReset = () => {
    if (timelineFilter) setTimelineFilter("");
    if (appliedTimelineFilter) setAppliedTimelineFilter("");
    if (appliedStartDate) setAppliedStartDate("");
    if (appliedEndDate) setAppliedEndDate("");
    if (search) setSearch("");
    if (page !== 1) setPage(1);

    if (typeof setStartTime === "function") setStartTime("");
    if (typeof setEndTime === "function") setEndTime("");
    if (setFilteredRoleId) setFilteredRoleId(null);
    if (setFilteredLocationId) setFilteredLocationId(null);
    if (setFilteredManagerId) setFilteredManagerId(null);
    if (setFilteredProjectId) setFilteredProjectId(null);
    if (setFilteredAssignId) setFilteredAssignId(null);
    if (setFilteredLeadId) setFilteredLeadId(null);
    if (setFilteredProjectheadId) setFilteredProjectheadId(null);
    if (onResetRoleFilter) onResetRoleFilter();
  };

  return (
    <div className={isResetDisabled ? "cursor-wrapper" : ""}>
      <OverlayTrigger
        placement="top"
        overlay={
          <Tooltip id="reset-tooltip">
            <p>Reset Filter</p>
          </Tooltip>
        }
      >
        <div
          className={`stroke-btn border-theme ${
            isResetDisabled
              ? "wrapper-not-allowed filtered-image"
              : " filtered-image1"
          }`}
          onClick={!isResetDisabled ? handleReset : undefined}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") handleReset();
          }}
        >
          <img
            src="/images/refresh-light.png"
            alt="Reset Filter"
            aria-label="Reset Filter"
            className=""
            style={{ pointerEvents: "none" }}
          />
        </div>
      </OverlayTrigger>
    </div>
  );
};
