import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import styles from "./rounds.module.css";

const NextRound = () => {
  const navigate = useNavigate();
  const { tournamentId } = useParams();
  const [searchParams] = useSearchParams();
  const actionCase = searchParams.get("case"); // viewMatches | nextRound

  const [currentRound, setCurrentRound] = useState(null);
  const [roundStatus, setRoundStatus] = useState("");
  const [matches, setMatches] = useState([]);
  const [matchPlayers, setMatchPlayers] = useState({});
  const [loading, setLoading] = useState(true);

  const serverUrl = import.meta.env.VITE_SERVER_URL;

  // ---------- players ----------
  const fetchPlayerDetails = async (playerId) => {
    if (!playerId) return null;
    console.log("Fetching player details for ID:", playerId);
    try {
      const res = await fetch(`${serverUrl}/api/users/${playerId}`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        console.log("Player fetched:", data);
        return data;
      }
    } catch (e) {
      console.error("player fetch error", e);
    }
    return null;
  };

  // ---------- normalize + load ----------
  const loadRoundData = useCallback(async (roundRaw, matchesRaw, statusRaw) => {
    console.log("loadRoundData called with:", { roundRaw, matchesRaw, statusRaw });
    
    setCurrentRound({
      id: roundRaw.id,
      round_number: roundRaw.round_number ?? roundRaw.roundNumber,
    });

    if (statusRaw) setRoundStatus(statusRaw);
    else if (roundRaw.status) setRoundStatus(roundRaw.status);

    setMatches(matchesRaw);

    const ids = new Set();
    matchesRaw.forEach(m => {
      if (m.white_player_id) ids.add(m.white_player_id);
      if (m.black_player_id) ids.add(m.black_player_id);
    });

    console.log("Unique player IDs to fetch:", [...ids]);

    const players = await Promise.all([...ids].map(fetchPlayerDetails));
    const map = {};
    players.forEach(p => { if (p) map[p.id] = p; });
    
    console.log("Players map created:", map);
    setMatchPlayers(map);

    setLoading(false);
  }, []);

  // ---------- API ----------
  const getLatestRound = async () => {
    const res = await fetch(`${serverUrl}/api/rounds/${tournamentId}/current`, {
      credentials: "include",
    });
    if (!res.ok) {
      console.error("Failed to get latest round");
      return null;
    }
    const data = await res.json();
    console.log("Latest round fetched:", data);
    return data;
  };

  const getRoundMatches = async (roundId) => {
    const res = await fetch(`${serverUrl}/api/rounds/${roundId}/matches`, {
      credentials: "include",
    });
    if (!res.ok) {
      console.error("Failed to get round matches");
      return null;
    }
    const data = await res.json();
    console.log("Round matches fetched:", data);
    return data;
  };

  const loadCurrentRoundForViewing = async () => {
    setLoading(true);
    console.log("Loading current round for viewing...");
    const r = await getLatestRound();
    if (!r) {
      alert("No active round found");
      return setLoading(false);
    }
    const m = await getRoundMatches(r.id);
    if (!m) {
      alert("Failed to load matches");
      return setLoading(false);
    }
    loadRoundData(r, m);
  };

  const createNextRound = async () => {
    setLoading(true);
    console.log("Creating next round...");

    const cur = await getLatestRound();
    if (!cur) {
      alert("No current round found");
      return setLoading(false);
    }

    console.log("Creating next round with:", {
      tournamentId,
      currentRoundId: cur.id,
      currentRoundNumber: cur.round_number,
    });

    const res = await fetch(
      `${serverUrl}/api/rounds/${tournamentId}/rounds/${cur.id}/next`,
      { method: "POST", credentials: "include" }
    );

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Error creating next round:", errorData);
      setLoading(false);
      alert(errorData.message || "Failed to create next round");
      return;
    }

    const data = await res.json();
    console.log("Next round response:", data);

    // Check if tournament is completed
    if (data.status === "COMPLETED") {
      console.log("Tournament completed!", data);
      
      // Fetch winner details
      const winner = await fetchPlayerDetails(data.winner?.playerId);
      alert(`Tournament completed! Winner is ${winner?.name || "Unknown"}`);
      navigate(`/tournaments/${tournamentId}`);
      return;
    }

    // Load the new round data
    await loadRoundData(data.round, data.matches, data.status);
    alert("Next round created successfully!");
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
        alert("Winner declared successfully!");
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
    navigate(`/tournaments/${tournamentId}/rounds/next?case=nextRound`);
  };

  // ---------- init ----------
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      alert("Please login to view rounds");
      return navigate("/");
    }

    console.log("Component initialized with:", { tournamentId, actionCase });

    if (actionCase === "nextRound") createNextRound();
    else loadCurrentRoundForViewing();
  }, [tournamentId, actionCase]);

  // ---------- UI ----------
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
        
        <h1>Round {currentRound.round_number}</h1>
        
        <span
          className={`${styles.badge} ${styles["badge-" + (roundStatus || "ongoing")]}`}
        >
          {(roundStatus || "ongoing").toUpperCase()}
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
                            {match.winner_player_id === match.white_player_id && (
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
                            {match.winner_player_id === match.black_player_id && (
                              <div className={styles.winnerLabel}>
                                🏆 Winner
                              </div>
                            )}
                          </>
                        ) : match.is_bye ? (
                          <div className={styles.playerName}>BYE</div>
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
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
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

export default NextRound;