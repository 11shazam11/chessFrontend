import React from "react";
import { Outlet } from "react-router-dom";
import styles from "./home.module.css";
import Navbar from "../../components/Navbar/Navbar";
import UpdateCreate from "../../components/Tournament/UpdateCreate";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


const Home = () => {
  const navigate = useNavigate();
  const [isLogged, setIsLogged] = useState(false);
  const [role, setRole] = useState("");
  const [userEmail, setUserEmail] = useState("");

  //for handlinfg the udate or create tournament modal
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // 'create' or 'update'
  const [selectedTournament, setSelectedTournament] = useState(null);

  const handleCreateClick = () => {
    setModalMode("create");
    setSelectedTournament(null);
    setShowModal(true);
  };

  const handleUpdateClick = (tournament) => {
    setModalMode("update");
    setSelectedTournament(tournament);
    setShowModal(true);
  };

  const handleSubmit = (data) => {
    console.log("Tournament saved:", data);
    // Refresh your tournament list here
  };

  useEffect(() => {
    if (!isLogged) {
      navigate("/");
    }
  }, [isLogged]);
  //check if user is logged in
  function checkLogin() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setRole(user.user.role);
      setUserEmail(user.user.email);
    }

    return !!user;
  }
  useEffect(() => {
    
    checkLogin();
    const loggedIn = checkLogin();
    if (loggedIn) {
      navigate("/tournaments");
      setIsLogged(true);
    } else {
      navigate("/");
    }
  }, [userEmail,isLogged]);

  return (
    <>
      <div className={styles.container}>
        <div className={styles.mainCon}>
          <div className={styles.nav}>
            <Navbar
              isLogged={isLogged}
              setIsLogged={setIsLogged}
              role={role}
              userEmail={userEmail}
              handleCreateClick={handleCreateClick}
            />
          </div>
          {showModal && (
            <UpdateCreate
              mode={modalMode}
              tournamentData={selectedTournament}
              onClose={() => setShowModal(false)}
              onSubmit={handleSubmit}
            />
          )}
          <Outlet context={{ setIsLogged, role, userEmail,handleUpdateClick,setRole }} />
        </div>
      </div>
    </>
  );
};

export default Home;
