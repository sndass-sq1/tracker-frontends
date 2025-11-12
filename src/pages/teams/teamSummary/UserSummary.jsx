import React, { useState } from "react";
import ProductionTable from "./table/ProductionTable";
import { useLocation, useParams } from "react-router";
import { changeTabTitle } from "../../../utils/changeTabTitle";
import CoderTeamSummaryColumns from "./tableColumns/CoderTeamSummaryColumns";
import AuditorTeamSummaryColumns from "./tableColumns/AuditorTeamSummaryColumns";
import { useAuth } from "../../../context/AuthContext";
import CoderTeamSummaryR from "./tableColumns/CoderTeamSummaryR";
import AuditorTeamSummaryR from "./tableColumns/AuditorTeamSummaryR";

const UserSummary = () => {
  changeTabTitle("User Production");
  const auth = useAuth();
  const location = useLocation();
  const { id } = useParams();
  const selectedRow = location.state?.rows.user_log_id ?? id;
  const pathTab = location.pathname.includes("coder") ? "coder" : "auditor";
  const clientR = Number(import.meta.env.VITE_APP_CLIENTR);
  const [this_project, setThis_project] = useState(null);

  return (
    <div className="container-fluid ">
      {pathTab === "coder" ? (
        <ProductionTable
          apiEndPoint={
            auth.user.role === "lead"
              ? `coder-chart?user_log_id=${selectedRow}`
              : `coder-chart?user_log_id=${selectedRow}`
          }
          exportApiEndPoint={`coders/export?user_log_id=${selectedRow}`}
          queryKey="getCoderTab"
          title="Coders"
          // tableColumns={CoderTeamSummaryColumns}
          tableColumns={
            this_project == clientR
              ? CoderTeamSummaryR
              : CoderTeamSummaryColumns
          }
          module="Coder summary"
          setThis_project={setThis_project}
        />
      ) : (
        <ProductionTable
          apiEndPoint={
            auth.user.role === "lead"
              ? `auditor-chart?user_log_id=${selectedRow}`
              : `auditor-chart?user_log_id=${selectedRow}`
          }
          exportApiEndPoint={`auditors/export?user_log_id=${selectedRow}`}
          queryKey="getAuditorTab"
          title="Auditors"
          // tableColumns={AuditorTeamSummaryColumns}
          tableColumns={
            this_project == clientR
              ? AuditorTeamSummaryR
              : AuditorTeamSummaryColumns
          }
          module="Auditor summary"
          setThis_project={setThis_project}
        />
      )}
    </div>
  );
};

export default UserSummary;
