import React, { useState, useEffect } from "react";
import {
  Button,
  Modal,
  TextField,
  Box,
  IconButton,
  MenuItem,
  Select,
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  Collapse,
  Chip,
} from "@mui/material";

import { Close, Label } from "@mui/icons-material";
import axios from "axios";
import { useUserContext } from "../../components/context";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import dayjs, { Dayjs } from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { ToastContainer, toast } from "react-toastify";

interface Room {
  room_number: number;
  capacity: number;
  description: string;
}

interface Trainer {
  trainer_id: number;
  fullname: string;
}

interface Member {
  fullName: string;
  member_id: number;
}

interface ClassData {
  class_id: number;
  capacity: number;
  noOfMembers: number;
  classType: string;
  assignedTrainer: Trainer;
  assignedRoom: Room;
  scheduledDays: Schedule[];
  members: Member[];
  isOpen?: boolean;
}

interface Schedule {
  id?: number;
  date: string | null;
  startTime: Dayjs | null;
  endTime: Dayjs | null;
}

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const CreateClass: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [capacity, setCapacity] = useState<number>(0);
  const [classType, setClassType] = useState<string>("");
  const [assignedTrainer, setAssignedTrainer] = useState<number>(0);
  const [assignedRoom, setAssignedRoom] = useState<number>(0);
  const [editedId, setEditedId] = useState<number | null>(null);
  const [schedule, setSchedule] = useState<Schedule[]>([]);
  const ctx = useUserContext();
  const [classes, setClasses] = useState<ClassData[]>([]);

  const handleAddSchedule = () => {
    setSchedule([
      ...schedule,
      { date: "Monday", startTime: null, endTime: null },
    ]);
  };

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get<Room[]>(
          "http://localhost:3001/member/getRooms"
        );
        setRooms(response.data);
      } catch (error) {
        console.error("Error fetching rooms", error);
      }
    };

    const fetchClasses = async () => {
      try {
        const response = await axios.get<ClassData[]>(
          "http://localhost:3001/member/getClasses"
        );
        setClasses(response.data);
      } catch (error) {
        console.error("Error fetching classes:", error);
      }
    };

    const fetchTrainers = async () => {
      try {
        const response = await axios.get<Trainer[]>(
          "http://localhost:3001/member/getTrainers"
        );
        setTrainers(response.data);
      } catch (error) {
        console.error("Error fetching trainers", error);
      }
    };

    fetchRooms();
    fetchTrainers();
    fetchClasses();
  }, []);

  const handleCreateAndUpdateClass = async () => {
    try {
      var formattedSchedule = schedule.map((entry: Schedule) => {
        return {
          id: entry.id,
          date: entry.date,
          startTime:
            entry.startTime && typeof entry.startTime != "string"
              ? dayjs(entry.startTime).format("HH:mm:ss")
              : entry.startTime,
          endTime:
            entry.endTime && typeof entry.endTime != "string"
              ? dayjs(entry.endTime).format("HH:mm:ss")
              : entry.endTime,
        };
      });

      formattedSchedule = formattedSchedule.filter(
        (ent) => !(!ent.id && !ent.startTime && !ent.endTime && !ent.date)
      );
      await axios.post(
        "http://localhost:3001/member/createOrUpdateGroupClass",
        {
          capacity,
          noOfMembers: 0,
          scheduledBy: ctx.user?.user_id,
          classType,
          assignedTrainer,
          assignedRoom,
          schedule: formattedSchedule,
          class_id: editedId,
        }
      );
      toast.success(
        `Group Class ${editedId ? "Updated" : "Created"} Successfully`,
        {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        }
      );
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
      console.error("Error creating class", error);
    }
  };
  const handleDateChange = (index: number, date: any) => {
    if (date) {
      const updatedSchedule = [...schedule];
      updatedSchedule[index].date = date;
      setSchedule(updatedSchedule);
    }
  };
  const handleDeleteSchedule = (index: number) => {
    const schedule_ = [...schedule];
    setSchedule(
      schedule_.map((schedule, i) => {
        return i == index
          ? { id: schedule.id, date: null, startTime: null, endTime: null }
          : schedule;
      })
    );
  };

  const handleRegisterClass = async (class_id: number) => {
    try {
      const response = await axios.post(
        `http://localhost:3001/member/registerClass/${ctx.user?.user_id}`,
        {
          class_id,
        }
      );
      toast.success("Registered Successfully", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      setClasses(
        classes.map((c) =>
          c.class_id == class_id
            ? {
                ...c,
                noOfMembers: c.noOfMembers + 1,
                members: [
                  ...c.members,
                  {
                    fullName: ctx.user?.fullname as string,
                    member_id: ctx.user?.user_id as number,
                  },
                ],
              }
            : c
        )
      );
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
  const handleDeRegisterClass = async (class_id: number) => {
    try {
      await axios.post(
        `http://localhost:3001/member/deRegisterClass/${ctx.user?.user_id}`,
        {
          class_id,
        }
      );
      toast.success("Registration Cancelled Successfully", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      setClasses(
        classes.map((c) =>
          c.class_id == class_id
            ? {
                ...c,
                noOfMembers: c.noOfMembers - 1,
                members: c.members.filter(
                  (mem) => mem.member_id != ctx.user?.user_id
                ),
              }
            : c
        )
      );
    } catch {
      toast.error("Error De-registering Class", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      console.log("HELLLO");
    }
  };
  const handleTimeChange = (
    index: number,
    type: "startTime" | "endTime",
    time: any
  ) => {
    if (time) {
      const updatedSchedule = [...schedule];
      updatedSchedule[index][type] = time;
      setSchedule(updatedSchedule);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container>
        <Typography variant="h5" gutterBottom>
          Group Classes
        </Typography>
        <List>
          {classes.map((classData, i) => (
            <React.Fragment key={classData.class_id}>
              <ListItem
                divider
                style={{
                  padding: "14px 12px",
                  backgroundColor: classData.isOpen ? "#f9f9f9" : "inherit",
                  borderLeft: classData.isOpen ? "4px solid #3f51b5" : "none",
                }}
              >
                <ListItemText
                  primary={
                    <span>
                      {" "}
                      {classData.classType}
                      {"  "}
                      {`(${classData.members.length}/${classData.capacity})`}{" "}
                    </span>
                  }
                  secondary={
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span>Trainer: {classData.assignedTrainer.fullname}</span>
                      <span>
                        Room: {classData.assignedRoom.room_number},{" "}
                        {classData.assignedRoom.description}
                      </span>
                    </div>
                  }
                />

                <Button
                  variant="outlined"
                  color="primary"
                  sx={{ marginRight: 3 }}
                  endIcon={<ExpandMoreIcon />}
                  onClick={() => {
                    setClasses(
                      classes.map((c, index) =>
                        index == i
                          ? { ...c, isOpen: !c.isOpen }
                          : { ...c, isOpen: false }
                      )
                    );
                  }}
                >
                  VIEW DETAILS
                </Button>
                {ctx.user?.userType == "admin" && (
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ marginRight: 3 }}
                    onClick={() => {
                      setCapacity(classData.capacity);
                      setClassType(classData.classType);
                      setAssignedRoom(classData.assignedRoom.room_number);
                      setAssignedTrainer(classData.assignedTrainer.trainer_id);
                      setSchedule(classData.scheduledDays);
                      setEditedId(classData.class_id);
                      setOpen(true);
                    }}
                  >
                    EDIT
                  </Button>
                )}

                {ctx.user?.userType == "member" &&
                  (classData.members.some(
                    (mem) => mem.member_id == ctx.user?.user_id
                  ) ? (
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => {
                        handleDeRegisterClass(classData.class_id);
                      }}
                    >
                      CANCEL REGISTRATION
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => {
                        handleRegisterClass(classData.class_id);
                      }}
                    >
                      Register
                    </Button>
                  ))}
              </ListItem>
              <Collapse in={classData.isOpen}>
                <List sx={{ paddingLeft: 5 }}>
                  {classData.members.length > 0 && (
                    <ListItem>
                      <ListItemText
                        primary="Members:"
                        secondary={
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              marginTop: 3,
                            }}
                          >
                            {classData.members.map((m: Member, index) => {
                              return (
                                <span>
                                  {" "}
                                  {index + 1}. {m.fullName}
                                </span>
                              );
                            })}
                          </div>
                        }
                      />
                    </ListItem>
                  )}
                  {classData.scheduledDays.length > 0 && (
                    <ListItem>
                      <ListItemText
                        primary="Scheduled Hours:"
                        secondary={
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                            }}
                          >
                            {classData.scheduledDays.map((day) => (
                              <span>
                                {day.date}:
                                {dayjs(day.startTime, "HH:mm:ss").format(
                                  "hh:mm A"
                                )}
                                -
                                {dayjs(day.endTime, "HH:mm:ss").format(
                                  "hh:mm A"
                                )}
                              </span>
                            ))}
                          </div>
                        }
                      />
                    </ListItem>
                  )}
                </List>
              </Collapse>
            </React.Fragment>
          ))}
        </List>
      </Container>
      <div>
        {ctx.user?.userType == "admin" && (
          <Button
            onClick={() => {
              setOpen(true);
              setCapacity(0);
              setClassType("");
              setAssignedRoom(0);
              setAssignedTrainer(0);
              setEditedId(null);
              setSchedule([]);
            }}
            variant="contained"
            sx={{ mt: 3 }}
          >
            Create Class
          </Button>
        )}

        <Modal open={open} onClose={() => setOpen(false)}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
              minWidth: 400,
            }}
          >
            <IconButton
              onClick={() => setOpen(false)}
              sx={{ position: "absolute", top: 10, right: 10 }}
            >
              <Close />
            </IconButton>
            <TextField
              label="Capacity"
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(parseInt(e.target.value))}
              fullWidth
              margin="normal"
            />

            <TextField
              label="Class Type"
              value={classType}
              onChange={(e) => setClassType(e.target.value)}
              fullWidth
              margin="normal"
            />

            <TextField
              select
              label="Assigned Room"
              value={assignedRoom}
              onChange={(e) => setAssignedRoom(parseInt(e.target.value))}
              fullWidth
              margin="normal"
            >
              {rooms.map((room) => (
                <MenuItem key={room.room_number} value={room.room_number}>
                  {room.room_number} - {room.description}{" "}
                  {`(capacity ${room.capacity})`}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Assigned Trainer"
              value={assignedTrainer}
              onChange={(e) => setAssignedTrainer(parseInt(e.target.value))}
              fullWidth
              margin="normal"
            >
              {trainers.map((trainer) => (
                <MenuItem key={trainer.trainer_id} value={trainer.trainer_id}>
                  {trainer.fullname}
                </MenuItem>
              ))}
            </TextField>
            <div style={{ marginTop: 23 }}>
              {schedule.map((entry: Schedule, index: number) =>
                !entry.date && !entry.startTime && !entry.endTime ? (
                  <></>
                ) : (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      gap: 17,
                      marginTop: 18,
                      alignItems: "center",
                    }}
                  >
                    <Select
                      label="Day"
                      value={entry.date}
                      onChange={(e) =>
                        handleDateChange(index, e.target.value as string)
                      }
                    >
                      {days.map((day) => (
                        <MenuItem value={day}>{day}</MenuItem>
                      ))}
                    </Select>

                    <TimePicker
                      label="Start Time"
                      value={dayjs(entry.startTime, "HH:mm:ss")}
                      onChange={(time) =>
                        handleTimeChange(index, "startTime", time)
                      }
                    />
                    <TimePicker
                      label="End Time"
                      value={dayjs(entry.endTime, "HH:mm:ss")}
                      onChange={(time) =>
                        handleTimeChange(index, "endTime", time)
                      }
                    />
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => handleDeleteSchedule(index)}
                    >
                      Delete
                    </Button>
                  </div>
                )
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <Button
                onClick={handleAddSchedule}
                variant="outlined"
                sx={{ mt: 3, mr: 2, alignSelf: "flex-start" }}
              >
                Add Day
              </Button>
              <Button
                onClick={handleCreateAndUpdateClass}
                variant="contained"
                sx={{ mt: 2, alignSelf: "flex-end" }}
              >
                {editedId ? "Save Changes" : "Create Class"}
              </Button>
            </div>
          </Box>
        </Modal>
      </div>
      <ToastContainer />
    </LocalizationProvider>
  );
};

export default CreateClass;
