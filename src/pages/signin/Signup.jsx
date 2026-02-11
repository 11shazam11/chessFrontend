import React from "react";
import styles from "./signup.module.css"; // same CSS file name pattern
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();
  const [formdata, setFormdata] = React.useState({
    name: "",
    email: "",
    password: "",
    role: "player",
  });

  function handleSubmit(e) {
    e.preventDefault();
    // Handle form submission logic here (Supabase signup + role assignment)
    console.log("Signup data:", formdata);
    // After success: navigate("/login") or wherever
  }

  function handleChange(e) {
    setFormdata({
      ...formdata,
      [e.target.name]: e.target.value,
    });
  }

  function handleLogin() {
    navigate("/");
  }

  return (
    <div className={styles.container}>
      <div className={styles.formCon}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <h1 className={styles.title}>Sign Up</h1>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Full Name</label>
            <input
              type="text"
              placeholder="Enter your full name"
              className={styles.inputField}
              name="name"
              value={formdata.name}
              onChange={handleChange}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              className={styles.inputField}
              name="email"
              value={formdata.email}
              onChange={handleChange}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              className={styles.inputField}
              name="password"
              value={formdata.password}
              onChange={handleChange}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Role</label>
            <select
              className={styles.inputField}
              name="role"
              value={formdata.role}
              onChange={handleChange}
            >
              <option value="player">Player</option>
              <option value="organizer">Organizer</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button type="submit" className={styles.btnPrimary}>
            Sign Up
          </button>

          <div className={styles.registerLink}>
            Already have an account?
            <a onClick={handleLogin}>Login</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
