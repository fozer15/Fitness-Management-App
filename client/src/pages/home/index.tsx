import React from "react";
import {
  Container,
  Typography,
  Tabs,
  Tab,
  AppBar,
  Toolbar,
  Box,
} from "@mui/material";
import { Link as RouterLink, useLocation, Outlet } from "react-router-dom";
import { useUserContext } from "../../components/context";

export const menu_options = {
  member: [
    {
      url: "profile",
      label: "Profile",
    },
    {
      url: "group-classes",
      label: "Group Classes",
    },
    {
      url: "training-sessions",
      label: "Training Sessions",
    },
    {
      url: "my-bills",
      label: "My Bills",
    },
  ],
  trainer: [
    {
      url: "profile",
      label: "Profile",
    },
    {
      url: "my-schedule",
      label: "My Schedule",
    },
    {
      url: "club-members",
      label: "Club Members",
    },
  ],
  admin: [
    {
      url: "profile",
      label: "Profile",
    },
    {
      url: "group-classes",
      label: "Group Classes",
    },
    {
      url: "equipments",
      label: "Rooms And Equipments",
    },
    {
      url: "view-billings",
      label: "BILLINGS",
    },
  ],
};

const MenuBar: React.FC = () => {
  const location = useLocation();
  const ctx = useUserContext();

  return (
    <>
      <Box mt={5} mb={1}>
        <Container>
          <Tabs
            value={location.pathname}
            TabIndicatorProps={{ style: { display: "block" } }}
            variant="scrollable"
            scrollButtons="auto"
          >
            {
              //@ts-ignore
              menu_options[ctx.user?.userType].map((el) => (
                <Tab
                  label={el.label}
                  value={`/home/${el.url}`}
                  component={RouterLink}
                  key={el.url}
                  to={
                    el.url == "profile"
                      ? `/home/${el.url}` + "?id=" + ctx.user?.user_id
                      : `/home/${el.url}`
                  }
                  sx={{
                    textDecoration: "none",
                    color: "inherit",
                    "&:hover": {
                      backgroundColor: "rgba(0, 0, 0, 0.04)",
                    },
                  }}
                />
              ))
            }
          </Tabs>
          <div style={{ marginTop: 40 }}>
            <Outlet />
          </div>
        </Container>
      </Box>
    </>
  );
};

export default MenuBar;
