import { useDebouncedCallback } from "use-debounce";
import { useState, useEffect } from "react";

export const Search = ({ search, setSearch, setPage, placeholder }) => {
  const [value, setValue] = useState(search || "");

  useEffect(() => {
    setValue(search || "");
  }, [search]);

  const handleSearch = useDebouncedCallback((val) => {
    setSearch(val);
    setPage(1);
  }, 500);

  const onChange = (e) => {
    const val = e.target.value;
    setValue(val);
    handleSearch(val);
  };

  return (
    <div className="search-input">
      <input
        type="search"
        value={value}
        onChange={onChange}
        placeholder="Search"
        aria-label="Search"
        // className="darkcard"
        // placeholder={placeholder}
      />
    </div>
  );
};
