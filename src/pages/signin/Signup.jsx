import React from "react";
import styles from "./signup.module.css"; // same CSS file name pattern
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const serverUrl = import.meta.env.VITE_SERVER_URL;
  const navigate = useNavigate();
  const [formdata, setFormdata] = React.useState({
    name: "",
    email: "",
    password_hash: "",
    role: "player",
  });

  async function handleSubmit(e) {
    e.preventDefault();
    console.log("Submitting form with data:", formdata);

    const data = await fetch(`${serverUrl}/api/users/register`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formdata),
    });

    if (data.ok) {
      navigate("/");
    } else {
      const errorData = await data.json();
      alert(errorData.message || "Failed to register");
    }
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
              name="password_hash"
              value={formdata.password_hash}
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
              <option value="player" className={styles.option}>Player</option>
              <option value="organizer" className={styles.option}>Organizer</option>
              <option value="admin" className={styles.option}>Admin</option>
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
