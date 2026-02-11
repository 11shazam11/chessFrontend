// Rounds.jsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./rounds.module.css";

const Rounds = () => {
  const { tournamentId } = useParams();
  const navigate = useNavigate();
  const [currentRound, setCurrentRound] = React.useState(null);
  const [matches, setMatches] = React.useState([]);
  const [matchPlayers, setMatchPlayers] = React.useState({});
  const [loading, setLoading] = React.useState(true);
  const serverUrl = import.meta.env.VITE_SERVER_URL;

  const fetchPlayerDetails = async (playerId) => {
    try {
      const res = await fetch(`${serverUrl}/api/users/${playerId}`, {
        method: "GET",
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (error) {
      console.error("Error fetching player details:", error);
    }
    return null;
  };

  const loadRoundData = async (roundData, matchesData) => {
    setCurrentRound(roundData);
    setMatches(matchesData);

    const playerIds = new Set();
    matchesData.forEach((match) => {
      if (match.white_player_id) playerIds.add(match.white_player_id);
      if (match.black_player_id) playerIds.add(match.black_player_id);
    });

    const playerDetailsPromises = Array.from(playerIds).map((id) =>
      fetchPlayerDetails(id),
    );
    const playerDetailsArray = await Promise.all(playerDetailsPromises);

    const playersMap = {};
    playerDetailsArray.forEach((player) => {
      if (player) {
        playersMap[player.id] = player;
      }
    });

    setMatchPlayers(playersMap);
    setLoading(false);
  };

  const createOrFetchRound = async (roundNumber = 1) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${serverUrl}/api/rounds/${tournamentId}/rounds/${roundNumber}`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      if (res.ok) {
        const data = await res.json();
        await loadRoundData(data.round, data.matches);
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Failed to load round");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error loading round:", error);
      alert("Error loading round");
      setLoading(false);
    }
  };

  const declareWinner = async (matchId, winnerId, result) => {
    try {
      const res = await fetch(`${serverUrl}/api/rounds/${matchId}/winner`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          winnerId: winnerId,
          result: result,
        }),
      });
      if (res.ok) {
        alert(`Winner declared successfully!`);
        if (currentRound) {
          createOrFetchRound(currentRound.round_number);
        }
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Failed to declare winner");
      }
    } catch (error) {
      console.error("Error declaring winner:", error);
      alert("Error declaring winner");
    }
  };

  const handleStartNextRound = async () => {
    if (!currentRound) return;
    
    try {
      const res = await fetch(
        `${serverUrl}/api/rounds/${tournamentId}/rounds/${currentRound.id}/next`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.status === "COMPLETED") {
          const winner = await fetchPlayerDetails(data.winner_player_id);
          alert(`Tournament completed! Winner is ${winner?.name || 'Unknown'}`);
          navigate(`/tournaments/${tournamentId}`);
        } else {
          alert("Next round created successfully!");
          createOrFetchRound(currentRound.round_number + 1);
        }
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Failed to start next round");
      }
    } catch (error) {
      console.error("Error starting next round:", error);
      alert("Error starting next round");
    }
  };

  React.useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      alert("Please login to view rounds");
      navigate("/login");
      return;
    }

    if (tournamentId) {
      createOrFetchRound(1);
    }
  }, [tournamentId]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading round data...</div>
      </div>
    );
  }

  if (!currentRound) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>No active round found</div>
        <button 
          className={styles.btnSecondary} 
          onClick={() => navigate(`/tournaments/${tournamentId}`)}
        >
          Back to Tournament
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button
          className={styles.backBtn}
          onClick={() => navigate(`/tournaments/${tournamentId}`)}
        >
          ← Back to Tournament
        </button>
        <h1>Round {currentRound?.round_number}</h1>
        <span
          className={`${styles.badge} ${styles["badge-" + currentRound?.status]}`}
        >
          {currentRound?.status.toUpperCase()}
        </span>
      </div>

      <div className={styles.content}>
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Matches</h3>

          {matches.length > 0 ? (
            <div className={styles.matchesGrid}>
              {matches.map((match, index) => {
                const whitePlayer = matchPlayers[match.white_player_id];
                const blackPlayer = matchPlayers[match.black_player_id];

                return (
                  <div key={match.id} className={styles.matchCard}>
                    <div className={styles.matchHeader}>
                      <span className={styles.matchNumber}>Match #{index + 1}</span>
                      <span className={`${styles.resultBadge} ${styles["result-" + match.result]}`}>
                        {match.result.toUpperCase()}
                      </span>
                    </div>

                    <div className={styles.matchPlayers}>
                      <div className={styles.playerSection}>
                        <div className={styles.playerColor}>⚪ White</div>
                        {whitePlayer ? (
                          <>
                            <div className={styles.playerName}>{whitePlayer.name}</div>
                            <div className={styles.playerRating}>
                              Rating: <span>{whitePlayer.rating || "N/A"}</span>
                            </div>
                            {match.result === "pending" && (
                              <button
                                className={styles.btnWinner}
                                onClick={() =>
                                  declareWinner(match.id, match.white_player_id, "white_win")
                                }
                              >
                                Declare Winner
                              </button>
                            )}
                            {match.winner_player_id === match.white_player_id && (
                              <div className={styles.winnerLabel}>🏆 Winner</div>
                            )}
                          </>
                        ) : (
                          <div className={styles.playerName}>Loading...</div>
                        )}
                      </div>

                      <div className={styles.vsDivider}>VS</div>

                      <div className={styles.playerSection}>
                        <div className={styles.playerColor}>⚫ Black</div>
                        {blackPlayer ? (
                          <>
                            <div className={styles.playerName}>{blackPlayer.name}</div>
                            <div className={styles.playerRating}>
                              Rating: <span>{blackPlayer.rating || "N/A"}</span>
                            </div>
                            {match.result === "pending" && (
                              <button
                                className={styles.btnWinner}
                                onClick={() =>
                                  declareWinner(match.id, match.black_player_id, "black_win")
                                }
                              >
                                Declare Winner
                              </button>
                            )}
                            {match.winner_player_id === match.black_player_id && (
                              <div className={styles.winnerLabel}>🏆 Winner</div>
                            )}
                          </>
                        ) : (
                          <div className={styles.playerName}>Loading...</div>
                        )}
                      </div>
                    </div>

                    {match.is_bye && (
                      <div className={styles.byeLabel}>BYE MATCH</div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={styles.noMatches}>
              <p>No matches for this round</p>
            </div>
          )}
        </section>

        <section className={styles.section}>
          <button className={styles.btnPrimary} onClick={handleStartNextRound}>
            Start Round {currentRound ? currentRound.round_number + 1 : 2}
          </button>
        </section>
      </div>
    </div>
  );
};

export default Rounds;