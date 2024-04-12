import React, { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  List,
  ListItem,
  Container,
  ListItemText,
  CircularProgress,
  Collapse, // Import CircularProgress component for loading circle
} from "@mui/material";
import axios from "axios";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
const ClubMembers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false); // Add loading state
  const [error, setError] = useState<any>(null);
  const handleSearch = async () => {
    try {
      setLoading(true); // Set loading to true when starting search
      const response = await axios.post(
        `http://localhost:3001/member/getByName`,
        {
          searchQuery,
        }
      );

      setSearchResults(response.data);
      setError(null);
    } catch (error: any) {
      setSearchResults([]);
      setError("No Result");
    } finally {
      setLoading(false); // Set loading to false when search is done
    }
  };

  const toggleBills = (index: number) => {
    setSearchResults((prevUsers: any) =>
      prevUsers.map((user: any, i: any) =>
        i === index
          ? { ...user, isOpen: !user.isOpen }
          : { ...user, isOpen: false }
      )
    );
  };
  return (
    <Container style={{ margin: 0, padding: 0 }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <TextField
          placeholder="Search member by name"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ "& input": { padding: "8px" } }} // Custom styles to reduce inner padding
        />
        <Button
          variant="contained"
          onClick={handleSearch}
          style={{ marginLeft: 10 }}
        >
          Search
        </Button>
      </div>
      {loading && <CircularProgress style={{ marginTop: 10 }} />}{" "}
      {/* Show loading circle if loading */}
      {error && (
        <Typography variant="body1" color="error" style={{ marginTop: 10 }}>
          {error}
        </Typography>
      )}
      {searchResults.length > 0 && (
        <List>
          <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 3 }}>
            Found Members ({searchResults.length})
          </Typography>
          {searchResults.map((user: any, index) => (
            <React.Fragment key={user.member_id}>
              <ListItem
                divider
                // style={{
                //   backgroundColor: room.isOpen ? "#f9f9f9" : "inherit",
                //   borderLeft: room.isOpen ? "4px solid #3f51b5" : "none",
                // }}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <ListItemText
                  primary={`Full Name: ${user.fullname}`}
                  secondary={
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span>email: {user.email}</span>
                      <span>phone: {user.phone}</span>
                      <span>address: {user.address}</span>
                    </div>
                  }
                />
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      )}
    </Container>
  );
};

export default ClubMembers;
