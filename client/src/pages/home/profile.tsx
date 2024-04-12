import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import {
  Typography,
  TextField,
  Button,
  CircularProgress,
  Container,
  Box,
} from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import { useUserContext } from "../../components/context";
import { emitKeypressEvents } from "readline";

interface HealthMetric {
  metric_type:
    | "Blood Pressure"
    | "Heart Rate"
    | "Blood Sugar"
    | "Weight"
    | "BMI";
  currentvalue: number | null;
  targetvalue: number | null;
}

const metricTypes: HealthMetric[] = [
  { metric_type: "Blood Pressure", currentvalue: null, targetvalue: null },
  { metric_type: "Heart Rate", currentvalue: null, targetvalue: null },
  { metric_type: "Blood Sugar", currentvalue: null, targetvalue: null },
  { metric_type: "Weight", currentvalue: null, targetvalue: null },
  { metric_type: "BMI", currentvalue: null, targetvalue: null },
];

const Profile: React.FC = () => {
  const [member, setMember]: any = useState(null);
  const [loading, setLoading] = useState(true);
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [metrics, setMetrics] = useState<HealthMetric[]>(metricTypes);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const memberId = searchParams.get("id");
  const ctx = useUserContext();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<HealthMetric[]>(
          `http://localhost:3001/member/getMetrics/${ctx.user?.user_id}`
        );
        // var _metrics = [...metrics];
        // _metrics = _metrics.map((m) => {
        //   var el = response.data.find((_m) => (_m.metric_type = m.metric_type));
        //   return el || m;
        // });
        // console.log(_metrics);
        setMetrics(response.data);
      } catch (error) {
        console.error("Error fetching metrics:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/member/get/${memberId}/?userType=${ctx.user?.userType}`
        );
        setMember(response.data);
        setFullname(response.data.fullname);
        setEmail(response.data.email);
        setAddress(response.data.address);
        setPhone(response.data.phone);
        setBio(response.data.bio || "");
        setLoading(false);
      } catch (error) {
        console.error("Error fetching member:", error);
        setLoading(false);
      }
    };
    fetchMember();
  }, []);

  const handleUpdate = async () => {
    try {
      const response = await axios.put(
        `http://localhost:3001/member/update/${memberId}`,
        {
          fullname,
          email,
          address,
          phone,
          userType: ctx.user?.userType,
          bio,
        }
      );

      toast.success("User updated successfully", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Error updatin user", {
        position: "top-center",
        autoClose: 8000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };
  const handleCurrentValueChange = (metric_type: string, value: number) => {
    const metrics_ = [...metrics];

    const newMet = metrics_.map((met) =>
      met.metric_type == metric_type
        ? {
            ...met,
            currentvalue: value,
          }
        : met
    );

    setMetrics(newMet);
  };

  const handleTargetChange = (metric_type: string, value: number) => {
    const metrics_ = [...metrics];
    const newMet = metrics_.map((met) =>
      met.metric_type == metric_type
        ? {
            ...met,
            targetvalue: value,
          }
        : met
    );

    setMetrics(newMet);
  };

  const handleSaveChanges = async () => {
    try {
      const response = await axios.put(
        `http://localhost:3001/member/createOrUpdateMetrics/${memberId}`,
        {
          metrics,
        }
      );
      toast.success("Metrics Updated successfully", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } catch (error: any) {
      toast.error(error?.response?.data?.message, {
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

  if (loading) {
    return <CircularProgress />;
  }

  if (!member) {
    return <Typography variant="h6">Member not found</Typography>;
  }

  return (
    <>
      <Container maxWidth="xs" style={{ margin: 0, padding: 0 }}>
        <Typography variant="h6">Personal Information</Typography>
        <Box display="flex" flexDirection="column" gap={2} marginTop={3}>
          <TextField
            label="Full Name"
            variant="outlined"
            fullWidth
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
          />
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Address"
            variant="outlined"
            fullWidth
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <TextField
            label="Phone"
            variant="outlined"
            fullWidth
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          {ctx.user?.userType === "trainer" && ( // Conditionally render Bio textarea for trainers
            <>
              {" "}
              <TextField
                label="Bio"
                variant="outlined"
                fullWidth
                multiline
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
              <TextField
                label="Salary"
                variant="outlined"
                fullWidth
                value={member?.salary + "$"}
                disabled
              />
            </>
          )}
          {ctx.user?.userType == "admin" && (
            <TextField
              label="Role"
              variant="outlined"
              fullWidth
              disabled
              value={member?.role}
            />
          )}
        </Box>
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpdate}
          sx={{ mt: 3 }}
        >
          Save Changes
        </Button>
      </Container>
      {ctx.user?.userType == "member" && (
        <Container
          maxWidth="xs"
          style={{ margin: 0, padding: 0, marginTop: 50 }}
        >
          <Typography variant="h6">Health Metrics and Goals</Typography>
          <Box sx={{ mt: 3 }}>
            {metricTypes.map((el, index: number) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  marginBottom: 15,
                  width: "130%",
                  alignItems: "center",
                }}
              >
                <div style={{ width: "23%" }}>{el.metric_type}:</div>

                <TextField
                  size="small"
                  label="Current Value"
                  variant="outlined"
                  type="number"
                  value={
                    metrics.find(
                      (metrics: any) => metrics.metric_type == el.metric_type
                    )?.currentvalue
                  }
                  onChange={(e) => {
                    handleCurrentValueChange(
                      el.metric_type,
                      parseInt(e.target.value as any)
                    );
                  }}
                  sx={{ mr: 3 }}
                />
                <TextField
                  size="small"
                  label="Goal"
                  type="number"
                  variant="outlined"
                  onChange={(e) => {
                    handleTargetChange(
                      el.metric_type,
                      parseInt(e.target.value as any)
                    );
                  }}
                  value={
                    metrics.find(
                      (metrics: any) => metrics.metric_type == el.metric_type
                    )?.targetvalue
                  }
                />
              </div>
            ))}
            <Button
              onClick={handleSaveChanges}
              variant="contained"
              sx={{ mt: 2 }}
            >
              Save Changes
            </Button>
          </Box>
        </Container>
      )}

      <ToastContainer />
    </>
  );
};

export default Profile;
