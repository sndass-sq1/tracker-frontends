const ToggleMenu = ({ isCollapsed, toggleSidenav }) => {
  return (
    <div>
      <button
        className={`toggle-btn  ${isCollapsed ? "toggle-btn-collapsed" : ""}`}
        onClick={toggleSidenav}
        aria-label={isCollapsed ? "Expand Menu" : "Collapse Menu"}
      >
        {isCollapsed ? (
          <img
            src="/images/navigate_next.svg"
            className="toggle-btn-color"
            width={24}
            alt="Navigate Next"
          />
        ) : (
          <img
            src="/images/navigate_before.svg"
            width={24}
            alt="Navigate Prev"
            className="toggle-btn-color"
          />
        )}
      </button>
    </div>
  );
};

export default ToggleMenu;
