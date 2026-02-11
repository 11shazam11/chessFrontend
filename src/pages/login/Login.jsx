import React from "react";
import styles from "./login.module.css";
import { useNavigate, useOutletContext } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const { setIsLogged } = useOutletContext();
  const [formdata, setFormdata] = React.useState({
    email: "",
    password: "",
  });
  const { role, setRole } = useOutletContext();

  const serverUrl = import.meta.env.VITE_SERVER_URL;
  async function handleSubmit(e) {
    e.preventDefault();
    const data = {
      email: formdata.email,
      password: formdata.password,
    };
    try {
      const res = await fetch(`${serverUrl}/api/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const userData = await res.json();
        console.log("Login successful:", userData);
        //remove old user data from local storage
        localStorage.removeItem("user");
        localStorage.setItem(
          "user",
          JSON.stringify(userData.validateUser.user),
        );
        setRole(userData.validateUser.user.role);
        //set limit to 15 minutes for the user data in local storage
        setTimeout(
          () => {
            localStorage.removeItem("user");
          },
          15 * 60 * 1000,
        );
        navigate("/tournaments");
        setIsLogged(true);
      } else {
        console.log("Login failed");
      }
    } catch (err) {
      console.log("Login error:", err);
    }
  }
  function handleChange(e) {
    setFormdata({
      ...formdata,
      [e.target.name]: e.target.value,
    });
  }
  function handelRegister() {
    navigate("/register");
  }

  return (
    <div className={styles.container}>
      <div className={styles.formCon}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <h1 className={styles.title}>Login</h1>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Email</label>
            <input
              type="text"
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

          <button type="submit" className={styles.btnPrimary}>
            Login
          </button>

          <div className={styles.registerLink}>
            Don't have an account?
            <a onClick={handelRegister}>Register</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
