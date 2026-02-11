import React from "react";
import styles from "./navbar.module.css";
import logo from "../../assets/logoCT.png";
const Navbar = (props) => {
  const { isLogged, setIsLogged, role, userEmail, handleCreateClick } = props;
  function handelLogout() {
    localStorage.removeItem("user");
    setIsLogged(false);
  }
  return (
    <div className={styles.container}>
      <div className={styles.logo}>
        <img src={logo} alt="logo" />
      </div>
      {isLogged ? (
        <div className={styles.menuItems}>
          {role === "organizer" ? (
            <h3 onClick={handleCreateClick}>Create Tournaments</h3>
          ) : (
            <h3>Registered Tournaments</h3>
          )}
          <h3>Statistics</h3>
          <h3>Settings</h3>
          <select
            name="user"
            id="user"
            onChange={(e) => {
              if (e.target.value === "logout") {
                handelLogout();
              }
            }}
          >
            <option value={userEmail}>{userEmail}</option>
            <option value="logout">Logout</option>
          </select>
        </div>
      ) : null}
    </div>
  );
};

export default Navbar;
