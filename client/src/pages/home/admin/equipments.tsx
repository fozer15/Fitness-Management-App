import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  Select,
  MenuItem,
  Button,
  Collapse,
  Box,
  IconButton,
  ListItemSecondaryAction,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { styled } from "@mui/system";
import { ToastContainer, toast } from "react-toastify";

interface Equipment {
  equip_id: number;
  locatedAt: number;
  equip_type: string;
  maintenance_status: string;
}

interface Room {
  room_number: number;
  description: string;
  capacity: number;
  isOpen: boolean;
  equipments: Equipment[];
}

const ExpandIcon = styled(ExpandMoreIcon)({
  transition: "transform 0.3s",
});

const Equipments: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    axios
      .get("http://localhost:3001/member/getRoomsWithEq")
      .then((response) => {
        const roomsWithEquipments = response.data.map((room: Room) => ({
          ...room,
          isOpen: false,
        }));
        setRooms(roomsWithEquipments);
      })
      .catch((error) => {
        console.error("Error fetching rooms", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleStatusChange = (
    roomIndex: number,
    equipmentIndex: number,
    status: string
  ) => {
    const updatedRooms = [...rooms];
    updatedRooms[roomIndex].equipments[equipmentIndex].maintenance_status =
      status;
    setRooms(updatedRooms);
  };

  const handleSaveChanges = () => {
    axios
      .put("http://localhost:3001/member/updateEquipments", {
        rooms,
      })
      .then((response) => {
        toast.success("Equipments saved successfully", {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      })
      .catch((error) => {
        toast.error("Error updateding equipments", {
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
  const toggleEquipments = (roomIndex: number) => {
    setRooms((prevRooms) =>
      prevRooms.map((room, index) =>
        index === roomIndex
          ? { ...room, isOpen: !room.isOpen }
          : { ...room, isOpen: false }
      )
    );
  };
  if (loading) return <></>;
  return (
    <Container>
      <Typography variant="h5" gutterBottom>
        Rooms and Equipments
      </Typography>
      <List>
        {rooms.map((room, roomIndex) => (
          <>
            <ListItem
              divider
              style={{
                backgroundColor: room.isOpen ? "#f9f9f9" : "inherit",
                borderLeft: room.isOpen ? "4px solid #3f51b5" : "none",
              }}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <ListItemText
                primary={`Room ${room.room_number}`}
                secondary={
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span>{room.description}</span>
                    <span>Capacity: {room.capacity}</span>
                  </div>
                }
              />
              <Button
                onClick={() => toggleEquipments(roomIndex)}
                variant="outlined"
                color="info"
                endIcon={<ExpandMoreIcon />}
              >
                View Equipments
              </Button>
            </ListItem>
            <Collapse in={room.isOpen} timeout="auto">
              <List sx={{ paddingLeft: 5 }}>
                {room.equipments.map((equipment, equipmentIndex) => (
                  <ListItem
                    key={equipment.equip_id}
                    sx={{
                      padding: "0px 0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <ListItemText
                      primary={equipment.equip_type}
                      secondary={`Serial No #${equipment.equip_id}`}
                    />
                    <div>
                      <Select
                        size="small"
                        sx={{ fontSize: 14 }}
                        value={equipment.maintenance_status}
                        onChange={(e) =>
                          handleStatusChange(
                            roomIndex,
                            equipmentIndex,
                            e.target.value as string
                          )
                        }
                      >
                        <MenuItem value="available">Available</MenuItem>
                        <MenuItem value="in maintenance">
                          In Maintenance
                        </MenuItem>
                        <MenuItem value="removed">Removed</MenuItem>
                      </Select>
                    </div>
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </>
        ))}
      </List>
      <Box mt={3}>
        <Button onClick={handleSaveChanges} variant="contained" color="primary">
          Save Changes
        </Button>
      </Box>
      <ToastContainer />
    </Container>
  );
};

export default Equipments;
