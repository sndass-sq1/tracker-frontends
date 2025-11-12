import { useState, useMemo } from "react";
import apiClient from "../../services/apiClient";
import ReactTable from "../../components/ReactTable";
import { useQuery } from "@tanstack/react-query";
import ConflictColumns from "./ConflictColumns";
import ConflictColumnsR from "./ConflictColumnsR";
import { useNavigate } from "react-router";
import ConflictColumnsAnthem from "./ConflictColumnsAnthem";
import ConflictColumnsHumana from "./ConflictColumnsHumana";

const ConflictPage = () => {
  const clientR = Number(import.meta.env.VITE_APP_CLIENTR);
  const anthemElevance = Number(import.meta.env.VITE_APP_ANTHEM_ELEVANCE);
  const humana = Number(import.meta.env.VITE_APP_HUMANA);
  const libertyProjectID = Number(import.meta.env.VITE_APP_LIBERTY);
  const prominenceProjectID = Number(import.meta.env.VITE_APP_PROMINENCE);
  const humanaWave2ProjectID = Number(import.meta.env.VITE_APP_HUMANA_WAVE_2);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sortType, setSortType] = useState("");
  const [sortColumn, setSortColumn] = useState("");
  const navigate = useNavigate();

  const feedbackItems = async () => {
    let params = {
      page: page,
      perPage: perPage,
      search: search,
      sortOrder: sortType,
      sortBy: sortColumn,
    };

    Object.keys(params).forEach(
      (key) =>
        (params[key] === undefined ||
          params[key] === null ||
          params[key] === "") &&
        delete params[key]
    );
    const response = await apiClient.get(`feedback/list`, {
      params: { ...params },
    });
    return response.data;
  };

  const { data: feedbackData, isLoading } = useQuery({
    queryKey: ["feedbackItems", page, perPage, search, sortType, sortColumn],
    queryFn: feedbackItems,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: "always",
  });

  const getProjectID = async () => {
    const response = await apiClient.get("get-current-user-data");
    return response.data;
  };

  const { data: projectID } = useQuery({
    queryKey: ["getProjectID"],
    queryFn: getProjectID,
    staleTime: 5 * 60 * 1000,
  });

  const humanaProjects = [
    humana,
    libertyProjectID,
    humanaWave2ProjectID,
    prominenceProjectID,
  ];
  const tableColumns = useMemo(() => {
    if (projectID?.data.this_project == anthemElevance) {
      return ConflictColumnsAnthem({
        search,
        page,
        perPage,
        sortType,
        sortColumn,
        navigate,
      });
    }
    if (humanaProjects.includes(projectID?.data.this_project)) {
      return ConflictColumnsHumana({
        search,
        page,
        perPage,
        sortType,
        sortColumn,
        navigate,
      });
    }
    if (projectID?.data.this_project == clientR) {
      return ConflictColumnsR({
        search,
        page,
        perPage,
        sortType,
        sortColumn,
        navigate,
      });
    }

    return ConflictColumns({
      search,
      page,
      perPage,
      sortType,
      sortColumn,
      navigate,
    });
  }, [
    search,
    projectID?.data,
    page,
    perPage,
    sortType,
    sortColumn,
    navigate,
    clientR,
    anthemElevance,
    humana,
    humanaWave2ProjectID,
    prominenceProjectID,
    libertyProjectID,
  ]);

  return (
    <div className="container-fluid">
      <div className="table-section darkcard mt-3 feedback-table">
        <div className="tableparent px-3 pt-3 ">
          <div className="errorchart-head">
            <span>
              {feedbackData?.pagination?.total > 1
                ? "Error Feedbacks"
                : "Error Feedback"}
            </span>
            {feedbackData?.pagination?.total ? (
              <>
                <span className="cus-count ms-2">
                  {feedbackData?.pagination?.total}
                </span>
              </>
            ) : null}
          </div>
          <div className="feedback-body pt-1">
            <ReactTable
              data={feedbackData || []}
              columns={tableColumns}
              apiEndPoint="feedback/list"
              queryKey="feedbackItems"
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
    </div>
  );
};

export default ConflictPage;
