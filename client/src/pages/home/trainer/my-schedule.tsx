import React, { useState, useEffect } from "react";
import { Typography, Button, Select, MenuItem } from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs, { Dayjs } from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import axios from "axios";
import { useUserContext } from "../../../components/context";
import { ToastContainer, toast } from "react-toastify";
import { AssignmentInd } from "@mui/icons-material";

interface Schedule {
  id?: number;
  date: string | null;
  startTime: Dayjs | null;
  endTime: Dayjs | null;
}

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const MySchedule = () => {
  const [schedule, setSchedule] = useState<Schedule[]>([]);
  const ctx = useUserContext();
  const handleAddSchedule = () => {
    setSchedule([
      ...schedule,
      { date: "Monday", startTime: null, endTime: null },
    ]);
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
  useEffect(() => {
    const fetchAvailabilities = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/member/getSchedule/${ctx.user?.user_id}`
        );
        setSchedule(response.data);
      } catch (error) {
        console.error("Error fetching availabilities:", error);
      }
    };

    fetchAvailabilities();
  }, []);

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

  const handleSaveSchedule = () => {
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

    axios
      .put(`http://localhost:3001/member/updateSchedule/${ctx.user?.user_id}`, {
        schedule: formattedSchedule,
      })
      .then((response) => {
        toast.success("Schedule Saved Successfully", {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        console.log("Schedule saved successfully:", response.data);
      })
      .catch((error) => {
        toast.error("Error Saving Schedule: Emty Field!", {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Typography variant="h6" sx={{ marginBottom: 2 }}>
          My Available Days and Times
        </Typography>
        {schedule.map((entry: Schedule, index: number) =>
          !entry.date && !entry.startTime && !entry.endTime ? (
            <></>
          ) : (
            <div
              key={index}
              style={{
                display: "flex",
                gap: 17,
                marginTop: 3,
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
                onChange={(time) => handleTimeChange(index, "startTime", time)}
              />
              <TimePicker
                label="End Time"
                value={dayjs(entry.endTime, "HH:mm:ss")}
                onChange={(time) => handleTimeChange(index, "endTime", time)}
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
        <div
          style={{ display: "flex", marginTop: 14, flexDirection: "column" }}
        >
          <Button
            variant="outlined"
            color="primary"
            onClick={handleAddSchedule}
            sx={{ alignSelf: "flex-start" }}
          >
            Add Day
          </Button>

          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveSchedule}
            sx={{ mt: 8, alignSelf: "flex-start" }}
          >
            Save Schedule
          </Button>
        </div>
      </div>
      <ToastContainer />
    </LocalizationProvider>
  );
};

export default MySchedule;
