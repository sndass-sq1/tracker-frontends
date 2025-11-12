import { changeTabTitle } from "../../utils/changeTabTitle";
import AddSearch from "./AddSeach";

const LeadSearch = () => {

    changeTabTitle("Charts");
    return (
        <>
            < AddSearch />
        </>
    );
};

export default LeadSearch;
