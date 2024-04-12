import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { UserProvider, useUserContext } from "./components/context";
import {
  Container,
  Typography,
  Tabs,
  Tab,
  AppBar,
  Toolbar,
  Box,
} from "@mui/material";
import Login from "./pages/login/login";
import Register from "./pages/register/register";
import Home, { menu_options } from "./pages/home";
import Profile from "./pages/home/profile";
import PrivateRoute from "./components/privateRoute";
import TopBar from "./components/topBar";
import ClubMembers from "./pages/home/trainer/club-members";
import MySchedule from "./pages/home/trainer/my-schedule";
import TrainingSessions from "./pages/home/member/traininig-sessions";
import MyBills from "./pages/home/member/my-bills";
import Equipments from "./pages/home/admin/equipments";
import UserBills from "./pages/home/admin/view-bills";
import GroupClasses from "./pages/home/group-classes";

const App: React.FC = () => {
  return (
    //@ts-ignore
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<PrivateRoute />}>
            <Route
              path="/home"
              element={
                <>
                  <TopBar>
                    <Home />
                  </TopBar>
                </>
              }
            >
              <Route path="profile" element={<Profile />} />
              <Route path="my-schedule" element={<MySchedule />} />
              <Route path="club-members" element={<ClubMembers />} />
              <Route path="training-sessions" element={<TrainingSessions />} />
              <Route path="my-bills" element={<MyBills />} />
              <Route path="view-billings" element={<UserBills />} />
              <Route path="equipments" element={<Equipments />} />
              <Route path="group-classes" element={<GroupClasses />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate replace to="/login" />} />
          <Route path="*" element={<Navigate replace to="/login" />} />
        </Routes>
      </Router>
    </UserProvider>
  );
};

export default App;
