import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./rounds.module.css";

// This component handles ONLY the first round creation of a tournament
const FirstRound = () => {
  const {tournamentId} = useParams();
  const navigate = useNavigate();
  const [currentRound, setCurrentRound] = useState(null);
  const [matches, setMatches] = useState([]);
  const [matchPlayers, setMatchPlayers] = useState({});
  const [loading, setLoading] = useState(true);
  const serverUrl = import.meta.env.VITE_SERVER_URL;

  // Fetch individual player details
  const fetchPlayerDetails = async (playerId) => {
    console.log("Fetching player details for ID:", playerId);
    try {
      const res = await fetch(`${serverUrl}/api/users/${playerId}`, {
        method: "GET",
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        console.log("Player fetched:", data);
        return data;
      } else {
        console.error("Failed to fetch player:", playerId);
      }
    } catch (error) {
      console.error("Error fetching player details:", error);
    }
    return null;
  };

  // Load round data and fetch all player details
  const loadRoundData = async (roundData, matchesData) => {
    console.log("loadRoundData called with:", { roundData, matchesData });
    setCurrentRound(roundData);
    setMatches(matchesData);

    // Collect all unique player IDs
    const playerIds = new Set();
    matchesData.forEach((match) => {
      if (match.white_player_id) playerIds.add(match.white_player_id);
      if (match.black_player_id) playerIds.add(match.black_player_id);
    });

    console.log("Unique player IDs to fetch:", Array.from(playerIds));

    // Fetch all player details in parallel
    const playerDetailsPromises = Array.from(playerIds).map((id) =>
      fetchPlayerDetails(id),
    );
    const playerDetailsArray = await Promise.all(playerDetailsPromises);

    console.log("Player details fetched:", playerDetailsArray);

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

  // Create or fetch the first round (round number 1)
  const createFirstRound = async () => {
    setLoading(true);
    console.log(
      "Creating/fetching first round for tournament ID:",
      tournamentId,
    );
    try {
      const res = await fetch(
        `${serverUrl}/api/rounds/${tournamentId}/rounds/1`,
        {
          method: "POST",
          credentials: "include",
        },
      );
      if (res.ok) {
        const data = await res.json();
        console.log("First round created/fetched:", data);
        console.log("Round data:", data.round);
        console.log("Matches data:", data.matches);
        await loadRoundData(data.round, data.matches);
      } else {
        const errorData = await res.json();
        console.error("Error response:", errorData);
        alert(errorData.message || "Failed to create first round");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error creating first round:", error);
      alert("Error creating first round");
      setLoading(false);
    }
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
        alert(`Winner declared successfully!`);
        // Reload the first round to get updated data
        createFirstRound();
      } else {
        const errorData = await res.json();
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
        },
      );
      if (res.ok) {
        const data = await res.json();
        console.log("Random winners declared:", data);
        alert("Random winners declared successfully!");
        // Reload the first round to get updated data
        createFirstRound();
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
    navigate(`/tournaments/${tournamentId}/rounds/next?case=nextRound`);
  };

  // Initialize component - check auth and create first round
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      alert("Please login to view rounds");
      navigate("/");
      return;
    }
    console.log("tournamentId:", tournamentId);

    if (tournamentId) {
      createFirstRound();
    }
  }, [tournamentId]);

  // Loading state
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Creating first round...</div>
      </div>
    );
  }

  // Error state - no round found
  if (!currentRound) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Failed to create first round</div>
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
        <h1>Round 1</h1>
        <span
          className={`${styles.badge} ${styles["badge-" + currentRound?.status]}`}
        >
          {currentRound?.status.toUpperCase()}
        </span>
      </div>

      <div className={styles.content}>
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>First Round Matches</h3>

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
                              Rating: <span>{whitePlayer.rating || "N/A"}</span>
                            </div>
                            {match.result === "pending" && (
                              <button
                                className={styles.btnWinner}
                                onClick={() =>
                                  declareWinner(
                                    match.id,
                                    match.white_player_id,
                                    "white_win",
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
                              Rating: <span>{blackPlayer.rating || "N/A"}</span>
                            </div>
                            {match.result === "pending" && (
                              <button
                                className={styles.btnWinner}
                                onClick={() =>
                                  declareWinner(
                                    match.id,
                                    match.black_player_id,
                                    "black_win",
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

        {/* Action buttons */}
        <section className={styles.section}>
          <div
            style={{ display: "flex", gap: "1rem", justifyContent: "center" }}
          >
            <button
              className={styles.btnPrimary}
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

export default FirstRound;
