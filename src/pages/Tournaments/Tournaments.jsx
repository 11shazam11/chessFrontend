import { useEffect } from "react";
import React from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import styles from "./tournaments.module.css";

const Tournaments = () => {
  const {setIsLogged,showModal} = useOutletContext();
  const navigate = useNavigate();
  const { role, handleUpdateClick } = useOutletContext();
  const [tournaments, setTournaments] = React.useState([]);
  const [participatedTournaments, setParticipatedTournaments] = React.useState(
    [],
  );

  useEffect(() => {
    //check if user is logged in
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      alert("Please login to view tournaments");
      setIsLogged(false);
      navigate("/");
    }else if(user.expiry < new Date().getTime()){
      alert("Session expired. Please login again.");
      localStorage.removeItem("user");
      setIsLogged(false);
      navigate("/");
    }
  }, []);

  async function fetchTournaments() {
    const serverUrl = import.meta.env.VITE_SERVER_URL;
    try {
      const res = await fetch(`${serverUrl}/api/tournaments/all`, {
        method: "GET",
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setTournaments(data.tournaments);
      } else {
        console.log("Failed to fetch tournaments");
      }
    } catch (error) {
      console.error("Error fetching tournaments:", error);
    }
  }
  //participate in tournament function
  async function participateInTournament(tournamentId) {
    const serverUrl = import.meta.env.VITE_SERVER_URL;
    try {
      const res = await fetch(
        `${serverUrl}/api/tournaments/${tournamentId}/participate`,
        {
          method: "POST",
          credentials: "include",
        },
      );
      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.message);
        return;
      }
      if (res.ok) {
        alert("Successfully registered for the tournament");
        fetchTournaments(); // Refresh the tournaments list
      } else {
        console.log("Failed to participate in tournament");
      }
    } catch (error) {
      console.error("Error participating in tournament:", error);
    }
  }
  //handle details click
  function handleDetails(tournamentId) {
    navigate(`/tournaments/${tournamentId}`);
  }
  //participated tournaments
  async function fetchParticipatedTournaments() {
    const serverUrl = import.meta.env.VITE_SERVER_URL;
    try {
      const res = await fetch(`${serverUrl}/api/tournaments/my-tournaments`, {
        method: "GET",
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
      } else {
        console.log("Failed to fetch participated tournaments");
      }
    } catch (error) {
      console.error("Error fetching participated tournaments:", error);
    }
  }

  useEffect(() => {
    fetchTournaments();
  }, []);
  useEffect(()=>{
    if(showModal === false){
      fetchTournaments();
    }
  },[showModal])

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.mainCon}>
          {tournaments.length > 0 ? (
            tournaments.map((tournament) => (
              <div key={tournament.id} className={styles.tournamentCard} onClick={()=>handleDetails(tournament.id)}>
                <h2>{tournament.name}</h2>
                <p>{tournament.description}</p>

                {tournament.status && (
                  <span className={`${styles.badge} ${styles.badgeOnline}`}>
                    {tournament.status}
                  </span>
                )}
                {!tournament.is_online && tournament.location && (
                  <span className={`${styles.badge} ${styles.badgeOffline}`}>
                    {tournament.location}
                  </span>
                )}

                <div className={styles.detailsGrid}>
                  <div className={styles.detailItem}>
                    <span className={styles.infoLabel}>Start Date</span>
                    <span className={styles.infoValue}>
                      {formatDate(tournament.start_date)}
                    </span>
                  </div>

                  <div className={styles.detailItem}>
                    <span className={styles.infoLabel}>End Date</span>
                    <span className={styles.infoValue}>
                      {formatDate(tournament.end_date)}
                    </span>
                  </div>

                  <div className={styles.detailItem}>
                    <span className={styles.infoLabel}>Format</span>
                    <span className={styles.infoValue}>
                      {tournament.format}
                    </span>
                  </div>

                  <div className={styles.detailItem}>
                    <span className={styles.infoLabel}>Max Players</span>
                    <span className={styles.infoValue}>
                      {tournament.max_players}
                    </span>
                  </div>

                  <div className={styles.detailItem}>
                    <span className={styles.infoLabel}>Time Control</span>
                    <span className={styles.infoValue}>
                      {tournament.time_control}
                    </span>
                  </div>

                  <div className={styles.detailItem}>
                    <span className={styles.infoLabel}>Type</span>
                    <span className={styles.infoValue}>
                      {tournament.is_online ? "Online" : "Offline"}
                    </span>
                  </div>
                </div>

                <div className={styles.organizerInfo}>
                  <p>
                    Organized by: <strong>{tournament.organizer_name}</strong>
                  </p>
                </div>
                {role == "organizer" ? (
                  <>
                    <button onClick={() => handleUpdateClick(tournament)}>
                      Edit Tournament
                    </button>
                    <button>Close Registration</button>
                  </>
                ) : (
                  <button
                    onClick={() => participateInTournament(tournament.id)}
                  >
                    Participate Now
                  </button>
                )}
              </div>
            ))
          ) : (
            <p className={styles.noTournaments}>No tournaments available</p>
          )}
        </div>
      </div>
    </>
  );
};

export default Tournaments;
