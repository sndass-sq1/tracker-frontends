import { useContext } from "react";
import { changeTabTitle } from "../../utils/changeTabTitle";
import { useAuth } from "../../context/AuthContext";
import { UserContext } from "../../UserContext/UserContext";
import AddTeam from "./AddTeam";
import TeamsTable from "./teamSummary/table/TeamsTable";
import TeamColumns from "./tableColumns/TeamColumns";
import { AnimatePresence, motion } from "framer-motion";

const Teams = () => {
  changeTabTitle("Teams");
  const auth = useAuth();
  const { openTeamAccordion, setOpenTeamAccordion } = useContext(UserContext);

  return (
    <div className="container-fluid overflow-y-auto">
      <AnimatePresence initial={false}>
        {openTeamAccordion && (
          <motion.div
            key="addTeam"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <AddTeam />
          </motion.div>
        )}
      </AnimatePresence>

      {auth.user.role === "super_admin" || auth.user.role === "manager" ? (
        <TeamsTable
          apiEndPoint="teams"
          queryKey="getTeams"
          title="Team"
          tableColumns={TeamColumns}
        />
      ) : (
        <TeamsTable
          apiEndPoint="teams"
          queryKey="getTeams"
          title="Team"
          tableColumns={TeamColumns}
        />
      )}
    </div>
  );
};

export default Teams;
