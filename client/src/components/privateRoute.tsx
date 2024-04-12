import React, { useContext, useEffect, useState } from "react";
import { Route, Navigate, Outlet } from "react-router-dom";
import { useUserContext } from "../components/context";
import axios from "axios";

const PrivateRoute = ({ element, ...rest }: any) => {
  const { user, setUser } = useUserContext();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");

      if (token) {
        try {
          const response = await axios.get(
            `http://localhost:3001/verifyToken`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setUser({
            ...response.data.user,
            user_id:
              response.data.user.member_id |
              response.data.user.trainer_id |
              response.data.user.admin_id,
          });
          setLoading(false);
        } catch (error) {
          console.error("Error verifying token:", error);
          setUser(null);
          setLoading(false);
        }
      } else {
        setUser(null);
        setLoading(false);
      }
    };

    checkAuth();
  }, [setUser]);

  if (loading) {
    return <>loading...</>;
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
