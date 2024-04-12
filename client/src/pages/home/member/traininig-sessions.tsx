import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  Collapse,
  IconButton,
  Button,
  ListItemSecondaryAction,
  Modal,
  MenuItem,
  TextField,
  Select,
  Box,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import dayjs, { Dayjs } from "dayjs";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { useUserContext } from "../../../components/context";
import { ToastContainer, toast } from "react-toastify";

interface Availability {
  startTime: Dayjs;
  endTime: Dayjs;
  dayOfWeek: string;
}

interface Trainer {
  trainer_id: number;
  bio: string;
  fullname: string;
  availabilities: Availability[];
}

interface ScheduledTraining {
  session_id: number;
  trainer_name: string | undefined;
  dayofweek: string;
  start_time: string;
  end_time: string;
}

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const TrainingSessions = () => {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [selectedTrainer, setSelectedTrainer] = useState<number | null>(null);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [date, setDate] = useState<string>("Monday");
  const [startTime, setStartTime] = useState<any>(null);
  const [endTime, setEndTime] = useState<any>(null);
  const [scheduledTrainings, setScheduledTrainings] = useState<
    ScheduledTraining[]
  >([]);
  const ctx = useUserContext();

  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3001/member/getTrainers"
        );
        setTrainers(response.data);
      } catch (error) {
        console.error("Error fetching trainers:", error);
      }
    };

    fetchTrainers();
  }, []);

  dayjs.extend(customParseFormat);

  const handleScheduleTraining = (trainer: Trainer) => {
    setOpenModal(true);
  };

  const toggleAvailability = (trainerId: number) => {
    setSelectedTrainer((prevSelectedTrainer) =>
      prevSelectedTrainer === trainerId ? null : trainerId
    );
  };

  const handleModalClose = () => {
    setOpenModal(false);
    setDate("Monday");
    setStartTime(null);
    setEndTime(null);
  };

  useEffect(() => {
    const fetchTrainingSessions = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/member/getTrainingSessions/${ctx.user?.user_id}`
        );
        setScheduledTrainings(response.data);
      } catch (error) {
        console.error("Error fetching training sessions:", error);
      }
    };

    fetchTrainingSessions();
  }, []);
  const handleCancelSession = async (sessionId: any) => {
    console.log(sessionId);
    try {
      await axios.delete(
        `http://localhost:3001/member/cancelSession/${sessionId}`
      );
      setScheduledTrainings(
        scheduledTrainings.filter(
          (training) => training.session_id !== sessionId
        )
      );
      toast.success("Training session has been successfully canceled.", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } catch (error) {
      console.error("Error canceling training session:", error);
      toast.error("Failed to cancel training session. Please try again.", {
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
  const handleSchedule = async () => {
    try {
      const response = await axios.put(
        `http://localhost:3001/member/addTrainingSession/${ctx.user?.user_id}`,
        {
          trainer_id: selectedTrainer,
          dayOfWeek: date,
          start_time: dayjs(startTime).format("HH:mm:ss"),
          end_time: dayjs(endTime).format("HH:mm:ss"),
        }
      );
      setScheduledTrainings([...scheduledTrainings, response.data]);

      toast.success("Training session has been successfully scheduled.", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      //handleModalClose();
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

    // const newScheduledTraining: ScheduledTraining = {
    //   trainerName: trainers.find((el) => el.trainer_id == selectedTrainer)
    //     ?.fullname,
    //   date,
    //   startTime,
    //   endTime,
    // };

    // setScheduledTrainings([...scheduledTrainings, newScheduledTraining]);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div>
        <Typography variant="h5" gutterBottom>
          Scheduled Training Sessions
        </Typography>
        <List>
          {scheduledTrainings.map((training, index) => (
            <ListItem
              key={index}
              sx={{ display: "flex", justifyContent: "space-between" }}
              divider
            >
              <ListItemText>
                <Typography variant="subtitle1">
                  {training.trainer_name}
                </Typography>
                <Typography variant="body2">
                  Day: {training.dayofweek}
                </Typography>
                <Typography variant="body2">
                  Time:{" "}
                  {dayjs(training.start_time, "HH:mm:ss").format("hh:mm A")} to{" "}
                  {dayjs(training.end_time, "HH:mm:ss").format("hh:mm A")}
                </Typography>
              </ListItemText>
              <Button
                variant="contained"
                color="error"
                size="small"
                onClick={() => handleCancelSession(training.session_id)}
              >
                Cancel
              </Button>
            </ListItem>
          ))}
        </List>
        <Typography variant="h5" gutterBottom sx={{ marginTop: 3 }}>
          Trainers
        </Typography>
        <List>
          {trainers.map((trainer: Trainer) => (
            <React.Fragment key={trainer.trainer_id}>
              <ListItem
                divider
                onClick={() => toggleAvailability(trainer.trainer_id)}
                style={{
                  backgroundColor:
                    selectedTrainer === trainer.trainer_id
                      ? "#f9f9f9"
                      : "inherit",
                  borderLeft:
                    selectedTrainer === trainer.trainer_id
                      ? "4px solid #3f51b5"
                      : "none",
                }}
              >
                <ListItemText
                  primary={trainer.fullname}
                  secondary={trainer.bio}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    aria-label="expand"
                    onClick={() => toggleAvailability(trainer.trainer_id)}
                  >
                    <ExpandMoreIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
              <Collapse
                in={selectedTrainer === trainer.trainer_id}
                timeout="auto"
                unmountOnExit
              >
                <ul style={{ listStyle: "none", padding: "20px 40px" }}>
                  {trainer.availabilities.length > 0 && (
                    <span
                      style={{
                        fontSize: 18,
                        marginBottom: 13,
                        display: "block",
                      }}
                    >
                      Available Hours:
                    </span>
                  )}
                  {trainer.availabilities.length > 0 ? (
                    trainer?.availabilities?.map(
                      (availability: Availability, index: number) => (
                        <li key={index} style={{ marginTop: 3 }}>
                          - {availability.dayOfWeek}:{" "}
                          {dayjs(availability.startTime, "HH:mm:ss").format(
                            "hh:mm A"
                          )}{" "}
                          to{" "}
                          {dayjs(availability.endTime, "HH:mm:ss").format(
                            "hh:mm A"
                          )}
                        </li>
                      )
                    )
                  ) : (
                    <span
                      style={{
                        fontSize: 18,
                        marginBottom: 13,
                        display: "block",
                      }}
                    >
                      No Available Hours
                    </span>
                  )}
                  {trainer.availabilities.length > 0 && (
                    <Button
                      variant="outlined"
                      color="primary"
                      style={{ marginTop: 22 }}
                      onClick={() => handleScheduleTraining(trainer)}
                    >
                      Schedule Training
                    </Button>
                  )}
                </ul>
              </Collapse>
            </React.Fragment>
          ))}
        </List>
        <Modal
          open={openModal}
          onClose={handleModalClose}
          aria-labelledby="schedule-training-modal"
          aria-describedby="schedule-training-modal-description"
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 500,
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
            }}
          >
            <IconButton
              aria-label="close"
              onClick={handleModalClose}
              sx={{ position: "absolute", top: 0, right: 0 }}
            >
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" id="modal-modal-title" gutterBottom>
              Schedule Training with{" "}
              {
                trainers.find(
                  (trainer) => trainer.trainer_id == selectedTrainer
                )?.fullname
              }
            </Typography>
            <div
              style={{
                display: "flex",
                justifyContent: "space-evenly",
                marginTop: 30,
              }}
            >
              <Select
                size="small"
                sx={{ fontSize: 14, marginRight: 2 }}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              >
                {days.map((day) => (
                  <MenuItem value={day}>{day}</MenuItem>
                ))}
              </Select>

              <TimePicker
                sx={{ marginRight: 2 }}
                label="Start Time"
                value={dayjs(startTime, "HH:mm:ss")}
                onChange={(time) => setStartTime(time)}
              />
              <TimePicker
                label="End Time"
                value={dayjs(endTime, "HH:mm:ss")}
                onChange={(time) => setEndTime(time)}
              />
            </div>

            <Button
              variant="contained"
              color="primary"
              onClick={handleSchedule}
              sx={{ mt: 4, float: "right" }}
            >
              Schedule
            </Button>
          </Box>
        </Modal>
      </div>
      <ToastContainer />
    </LocalizationProvider>
  );
};

export default TrainingSessions;
