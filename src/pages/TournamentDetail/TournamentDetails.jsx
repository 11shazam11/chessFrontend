// TournamentDetails.jsx
import React from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import styles from "./tournamentdetails.module.css";

const TournamentDetails = () => {
  const { tournamentId } = useParams();
  const {setIsLogged} = useOutletContext();
  const navigate = useNavigate();
  const [tournament, setTournament] = React.useState(null);
  const [players, setPlayers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [role, setRole] = React.useState("");

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const fetchTournamentDetails = async () => {
    const serverUrl = import.meta.env.VITE_SERVER_URL;
    try {
      const res = await fetch(`${serverUrl}/api/tournaments/${tournamentId}`, {
        method: "GET",
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setTournament(data.tournament);
      } else {
        console.log("Failed to fetch tournament details");
      }
    } catch (error) {
      console.error("Error fetching tournament details:", error);
    }
  };

  const fetchPlayers = async () => {
    const serverUrl = import.meta.env.VITE_SERVER_URL;
    try {
      const res = await fetch(
        `${serverUrl}/api/tournaments/${tournamentId}/participants`,
        {
          method: "GET",
          credentials: "include",
        },
      );
      if (res.ok) {
        const data = await res.json();
        setPlayers(data.players);
      } else {
        console.log("Failed to fetch players");
      }
    } catch (error) {
      console.error("Error fetching players:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseRegistration = async () => {
    const serverUrl = import.meta.env.VITE_SERVER_URL;
    try {
      const res = await fetch(
        `${serverUrl}/api/tournaments/${tournamentId}/close-registration`,
        {
          method: "POST",
          credentials: "include",
        },
      );
      if (res.ok) {
        alert("Registration closed successfully");
        fetchTournamentDetails();
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Failed to close registration");
      }
    } catch (error) {
      console.error("Error closing registration:", error);
      alert("Error closing registration");
    }
  };

  //add all players to tournament round 1
  const addPlayersToRound1 = async () => {
    const serverUrl = import.meta.env.VITE_SERVER_URL;
    try {
      const res = await fetch(`${serverUrl}/api/users/all`,{
        method: "GET",
        credentials: "include",
      });
      const allplayersId = await res.json();
      
      const playerIds = allplayersId.map(player => player.id);
      console.log("Player IDs to add to round 1:", playerIds);
      const data = {
        playerIds: playerIds
      }

      const res2 = await fetch(`${serverUrl}/api/tournaments/${tournamentId}/register-players`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (res2.ok) {
        alert("Players added to tournament successfully");
      } else {
        const errorData = await res2.json();
        alert(errorData.message || "Failed to add players to tournament");
      }
      fetchPlayers();
    } catch (error) {
      console.error("Error adding players to tournament:", error);
      alert("Error adding players to tournament");
    }
  };
  const handleStartRound1 = () => {
    console.log("Starting first round for tournament ID:", tournamentId);
    navigate(`/tournaments/${tournamentId}/rounds/first`);
  };

  const handleViewMatches = () => {
    navigate(`/tournaments/${tournamentId}/rounds/next?case=viewMatches`);
  };

  React.useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      alert("Please login to view tournament details");
      setIsLogged(false);
      navigate("/");
      return;
    }
    setRole(user.user.role);

    if (tournamentId) {
      fetchTournamentDetails();
      fetchPlayers();
    }
  }, [tournamentId]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading tournament details...</div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Tournament not found</div>
        <button className={styles.btnSecondary} onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>{tournament.name}</h1>
      </div>

      <div className={styles.content}>
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Tournament Information</h3>
          <div className={styles.infoCard}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Description:</span>
              <span className={styles.infoText}>{tournament.description}</span>
            </div>

            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Status</span>
                <span
                  className={`${styles.badge} ${styles["badge-" + tournament.status]}`}
                >
                  {tournament.status.replace("_", " ").toUpperCase()}
                </span>
              </div>

              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Format</span>
                <span className={styles.infoValue}>{tournament.format}</span>
              </div>

              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Type</span>
                <span className={styles.infoValue}>
                  {tournament.is_online ? "Online" : "Offline"}
                </span>
              </div>

              {!tournament.is_online && tournament.location && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Location</span>
                  <span className={styles.infoValue}>
                    {tournament.location}
                  </span>
                </div>
              )}

              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Start Date</span>
                <span className={styles.infoValue}>
                  {formatDate(tournament.start_date)}
                </span>
              </div>

              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>End Date</span>
                <span className={styles.infoValue}>
                  {formatDate(tournament.end_date)}
                </span>
              </div>

              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Time Control</span>
                <span className={styles.infoValue}>
                  {tournament.time_control}
                </span>
              </div>

              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Max Players</span>
                <span className={styles.infoValue}>
                  {tournament.max_players}
                </span>
              </div>

              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Organizer</span>
                <span className={styles.infoValue}>
                  {tournament.organizer_name}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Registered Players</h3>
            <span className={styles.playerCount}>
              {players.length} / {tournament.max_players}
            </span>
          </div>

          {players.length > 0 ? (
            <div className={styles.playersGrid}>
              {players.map((player, index) => (
                <div key={player.user_id} className={styles.playerCard}>
                  <div className={styles.playerRank}>#{index + 1}</div>
                  <div className={styles.playerInfo}>
                    <div className={styles.playerName}>{player.name}</div>
                    <div className={styles.playerRating}>
                      Rating: <span>{player.rating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.noPlayers}>
              <p>No players registered yet</p>
            </div>
          )}
        </section>

        {role === "organizer" && (
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Organizer Actions</h3>
            <div className={styles.actionButtons}>
              <button
                className={styles.btnSecondary}
                onClick={handleCloseRegistration}
                disabled={tournament.status !== "registration_open"}
              >
                Close Registration
              </button>

              {tournament.status !== "ongoing" &&
                tournament.status !== "completed" && (
                  <button
                    className={styles.btnPrimary}
                    onClick={handleStartRound1}
                  >
                    Start Tournament
                  </button>
                )}

                 {tournament.status !== "ongoing" &&
                tournament.status !== "completed" && (
                  <button
                    className={styles.btnPrimary}
                    onClick={addPlayersToRound1}
                  >
                    Add all players to round 1
                  </button>
                )}


              {(tournament.status === "ongoing" ||
                tournament.status === "completed") && (
                <button
                  className={styles.btnPrimary}
                  onClick={handleViewMatches}
                >
                  View Matches
                </button>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default TournamentDetails;
