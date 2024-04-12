import React, { useState } from "react";
import axios from "axios";
import {
  Container,
  TextField,
  Button,
  Typography,
  Link,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useUserContext } from "../../components/context";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("");
  const navigate = useNavigate();

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleUserTypeChange = (e: any) => {
    setUserType(e.target.value as string);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:3001/login", {
        email,
        password,
        userType,
      });

      if (response.status === 200) {
        localStorage.setItem("token", response.data.token);
      }

      navigate(
        `/home/profile?id=${
          response.data.user.rest.member_id |
          response.data.user.rest.trainer_id |
          response.data.user.rest.admin_id
        }`
      );
    } catch (error: any) {
      console.error("Error:", error.response.data.message);
      toast.error("Invalid email or password", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: "15rem",
      }}
    >
      <Typography variant="h4" component="h4" gutterBottom>
        <i className="fa-solid fa-dumbbell" style={{ color: "#1976d2" }}></i>{" "}
        Health and Fitness Club{" "}
      </Typography>
      <Container component="main" maxWidth="xs" style={{ marginTop: "0" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <form
            style={{ width: "100%", marginTop: ".2rem" }}
            onSubmit={handleSubmit}
          >
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={handleEmailChange}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="new-password"
              value={password}
              onChange={handlePasswordChange}
            />
            <FormControl fullWidth variant="outlined" margin="normal" required>
              <InputLabel id="user-type-label">User Type</InputLabel>
              <Select
                labelId="user-type-label"
                id="user-type"
                value={userType}
                onChange={handleUserTypeChange}
                label="User Type"
              >
                <MenuItem value="">
                  <em>User Type</em>
                </MenuItem>
                <MenuItem value="member">Member</MenuItem>
                <MenuItem value="trainer">Trainer</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              style={{ marginTop: "1rem" }}
            >
              Login
            </Button>
          </form>
          <div style={{ marginTop: 12, fontSize: 17 }}>
            Not a member?
            <Link
              href="/register"
              variant="body2"
              style={{ marginTop: "1rem" }}
            >
              {"  "} Register Now!
            </Link>
          </div>
        </div>
      </Container>
      <ToastContainer />
    </div>
  );
};

export default Login;
