import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./rounds.module.css";

// This component handles viewing current round and creating next rounds
const NextRound = ({ tournamentId, case: actionCase }) => {
  const navigate = useNavigate();
  const [currentRound, setCurrentRound] = useState(null);
  const [matches, setMatches] = useState([]);
  const [matchPlayers, setMatchPlayers] = useState({});
  const [loading, setLoading] = useState(true);
  const serverUrl = import.meta.env.VITE_SERVER_URL;

  // Fetch individual player details
  const fetchPlayerDetails = async (playerId) => {
    try {
      const res = await fetch(`${serverUrl}/api/users/${playerId}`, {
        method: "GET",
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        console.log("Player details fetched:", data);
        return data;
      }
    } catch (error) {
      console.error("Error fetching player details:", error);
    }
    return null;
  };

  // Get the latest round of the tournament
  const getLatestRound = async () => {
    try {
      const res = await fetch(
        `${serverUrl}/api/rounds/${tournamentId}/current`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (res.ok) {
        const data = await res.json();
        console.log("Latest round fetched:", data);
        return data;
      } else {
        const errorData = await res.json();
        console.error("Error fetching latest round:", errorData);
        return null;
      }
    } catch (error) {
      console.error("Error fetching latest round:", error);
      return null;
    }
  };

  // Get all matches for a specific round
  const getRoundMatches = async (roundId) => {
    try {
      const res = await fetch(`${serverUrl}/api/rounds/${roundId}/matches`, {
        method: "GET",
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        console.log("Round matches fetched:", data);
        return data;
      } else {
        const errorData = await res.json();
        console.error("Error fetching round matches:", errorData);
        return null;
      }
    } catch (error) {
      console.error("Error fetching round matches:", error);
      return null;
    }
  };

  // Load round data and fetch all player details
  const loadRoundData = async (roundData, matchesData) => {
    setCurrentRound(roundData);
    setMatches(matchesData);

    // Collect all unique player IDs
    const playerIds = new Set();
    matchesData.forEach((match) => {
      if (match.white_player_id) playerIds.add(match.white_player_id);
      if (match.black_player_id) playerIds.add(match.black_player_id);
    });

    // Fetch all player details in parallel
    const playerDetailsPromises = Array.from(playerIds).map((id) =>
      fetchPlayerDetails(id)
    );
    const playerDetailsArray = await Promise.all(playerDetailsPromises);

    // Map player details by ID
    const playersMap = {};
    playerDetailsArray.forEach((player) => {
      if (player) {
        playersMap[player.id] = player;
      }
    });

    console.log("Players map created:", playersMap);
    setMatchPlayers(playersMap);
    setLoading(false);
  };

  // Load current round and its matches for viewing
  const loadCurrentRoundForViewing = async () => {
    setLoading(true);
    console.log("Loading current round for viewing...");
    
    // Get latest round
    const roundData = await getLatestRound();
    if (!roundData) {
      alert("No active round found");
      setLoading(false);
      return;
    }

    // Get matches for that round using round.id
    const matchesData = await getRoundMatches(roundData.id);
    if (!matchesData) {
      alert("Failed to load matches");
      setLoading(false);
      return;
    }

    // Load the data
    await loadRoundData(roundData, matchesData);
  };

  // Declare winner for a match
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
        const data = await res.json();
        console.log("Winner declared successfully:", data);
        alert(`Winner declared successfully!`);
        // Reload current round to get updated data
        loadCurrentRoundForViewing();
      } else {
        const errorData = await res.json();
        console.error("Error declaring winner:", errorData);
        alert(errorData.message || "Failed to declare winner");
      }
    } catch (error) {
      console.error("Error declaring winner:", error);
      alert("Error declaring winner");
    }
  };

  // Declare random winners for all matches in the round
  const declareRandomWinners = async () => {
    if (!currentRound) {
      alert("No round found");
      return;
    }

    try {
      const res = await fetch(
        `${serverUrl}/api/rounds/${currentRound.id}/declare-random-winners`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      if (res.ok) {
        const data = await res.json();
        console.log("Random winners declared:", data);
        alert("Random winners declared successfully!");
        // Reload current round to get updated data
        loadCurrentRoundForViewing();
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Failed to declare random winners");
      }
    } catch (error) {
      console.error("Error declaring random winners:", error);
      alert("Error declaring random winners");
    }
  };

  // Navigate to next round page
  const handleStartNextRound = () => {
    navigate(`/tournaments/${tournamentId}/next-round?case=nextRound`);
  };

  // Create and load the next round
  const createNextRound = async () => {
    setLoading(true);
    console.log("Creating next round...");

    // First get the current round to find its ID
    const currentRoundData = await getLatestRound();
    if (!currentRoundData) {
      alert("No current round found");
      setLoading(false);
      return;
    }

    console.log("Creating next round with:", {
      tournamentId,
      currentRoundId: currentRoundData.id,
      currentRoundNumber: currentRoundData.round_number,
    });

    try {
      // Use currentRound.id (not round_number) as per your route
      const res = await fetch(
        `${serverUrl}/api/rounds/${tournamentId}/rounds/${currentRoundData.id}/next`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      if (res.ok) {
        const data = await res.json();
        console.log("Next round created response:", data);

        if (data.status === "COMPLETED") {
          const winner = await fetchPlayerDetails(data.winner_player_id);
          alert(`Tournament completed! Winner is ${winner?.name || "Unknown"}`);
          navigate(`/tournaments/${tournamentId}`);
        } else {
          alert("Next round created successfully!");
          // The response should contain the new round and matches
          if (data.round && data.matches) {
            await loadRoundData(data.round, data.matches);
          } else {
            // Fallback: load the new current round
            loadCurrentRoundForViewing();
          }
        }
      } else {
        const errorData = await res.json();
        console.error("Error creating next round:", errorData);
        alert(errorData.message || "Failed to create next round");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error creating next round:", error);
      alert("Error creating next round");
      setLoading(false);
    }
  };

  // Initialize component based on case
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      alert("Please login to view rounds");
      navigate("/login");
      return;
    }

    if (tournamentId) {
      console.log("Component initialized with:", { tournamentId, actionCase });
      
      // CASE 1: Just view the current round matches
      if (actionCase === "viewMatches") {
        console.log("Loading current round for viewing...");
        loadCurrentRoundForViewing();
      } 
      // CASE 2: Create and display the next round
      else if (actionCase === "nextRound") {
        console.log("Creating next round...");
        createNextRound();
      }
    }
  }, [tournamentId, actionCase]);

  // Loading state
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading round data...</div>
      </div>
    );
  }

  // Error state - no round found
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
                      <span className={styles.matchNumber}>
                        Match #{index + 1}
                      </span>
                      <span
                        className={`${styles.resultBadge} ${styles["result-" + match.result]}`}
                      >
                        {match.result.toUpperCase()}
                      </span>
                    </div>

                    <div className={styles.matchPlayers}>
                      {/* White Player Section */}
                      <div className={styles.playerSection}>
                        <div className={styles.playerColor}>⚪ White</div>
                        {whitePlayer ? (
                          <>
                            <div className={styles.playerName}>
                              {whitePlayer.name}
                            </div>
                            <div className={styles.playerRating}>
                              Rating:{" "}
                              <span>{whitePlayer.rating || "N/A"}</span>
                            </div>
                            {match.result === "pending" && actionCase === "viewMatches" && (
                              <button
                                className={styles.btnWinner}
                                onClick={() =>
                                  declareWinner(
                                    match.id,
                                    match.white_player_id,
                                    "white_win"
                                  )
                                }
                              >
                                Declare Winner
                              </button>
                            )}
                            {match.winner_player_id ===
                              match.white_player_id && (
                              <div className={styles.winnerLabel}>
                                🏆 Winner
                              </div>
                            )}
                          </>
                        ) : (
                          <div className={styles.playerName}>Loading...</div>
                        )}
                      </div>

                      <div className={styles.vsDivider}>VS</div>

                      {/* Black Player Section */}
                      <div className={styles.playerSection}>
                        <div className={styles.playerColor}>⚫ Black</div>
                        {blackPlayer ? (
                          <>
                            <div className={styles.playerName}>
                              {blackPlayer.name}
                            </div>
                            <div className={styles.playerRating}>
                              Rating:{" "}
                              <span>{blackPlayer.rating || "N/A"}</span>
                            </div>
                            {match.result === "pending" && actionCase === "viewMatches" && (
                              <button
                                className={styles.btnWinner}
                                onClick={() =>
                                  declareWinner(
                                    match.id,
                                    match.black_player_id,
                                    "black_win"
                                  )
                                }
                              >
                                Declare Winner
                              </button>
                            )}
                            {match.winner_player_id ===
                              match.black_player_id && (
                              <div className={styles.winnerLabel}>
                                🏆 Winner
                              </div>
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

        {/* Action buttons based on case */}
        <section className={styles.section}>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              className={styles.btnSecondary}
              onClick={declareRandomWinners}
            >
              Declare Random Winners
            </button>
            <button
              className={styles.btnPrimary}
              onClick={handleStartNextRound}
            >
              Start Next Round
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default NextRound;