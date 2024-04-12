import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { useUserContext } from "../components/context"; // Assuming you have a UserContext

const Bar = ({ children }: any) => {
  const navigate = useNavigate();
  const { setUser } = useUserContext();

  const handleExit = () => {
    localStorage.removeItem("token");
    setUser(null); // Update the context state to remove the user
    navigate("/login");
  };

  return (
    <div style={{ margin: "0 auto", width: "50%" }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Fitness Club{" "}
            <i className="fa-solid fa-dumbbell" style={{ color: "white" }}></i>{" "}
          </Typography>
          <Button color="inherit" onClick={handleExit} style={{ fontSize: 17 }}>
            LOGOUT{" "}
            <i
              style={{ marginLeft: 5 }}
              className="fa-solid fa-right-from-bracket"
            ></i>
          </Button>
        </Toolbar>
      </AppBar>
      {children}
    </div>
  );
};

export default Bar;
