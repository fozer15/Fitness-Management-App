import React, { useEffect, useState } from "react";
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
import dayjs, { Dayjs } from "dayjs";
interface Bill {
  bill_id: number;
  amount: number;
  paymentstatus: boolean;
  issueddate: string;
  duedate: string;
  billtype: string;
}

interface User {
  member_id: number;
  full_name: string;
  total_unpaid_amount: number;
  bills: Bill[];
  isOpen?: boolean;
}

const ExpandIcon = styled(ExpandMoreIcon)({
  transition: "transform 0.3s",
});

const UserBillsList: React.FC = () => {
  const [usersWithBills, setUsersWithBills] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    axios
      .get<User[]>("http://localhost:3001/member/getAllUsersWithBill")
      .then((response) => {
        setUsersWithBills(response.data);
      })
      .catch((error) => {
        console.error("Error fetching data", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const toggleBills = (index: number) => {
    setUsersWithBills((prevUsers) =>
      prevUsers.map((user, i) =>
        i === index
          ? { ...user, isOpen: !user.isOpen }
          : { ...user, isOpen: false }
      )
    );
  };
  if (loading) return <></>;
  return (
    <Container>
      <Typography variant="h5" gutterBottom>
        Member Bills
      </Typography>
      <List>
        {usersWithBills.map((user, index) => (
          <React.Fragment key={user.member_id}>
            <ListItem
              divider
              style={{
                padding: "14px 12px",
                backgroundColor: user.isOpen ? "#f9f9f9" : "inherit",
                borderLeft: user.isOpen ? "4px solid #3f51b5" : "none",
              }}
            >
              <ListItemText
                primary={user.full_name}
                secondary={`Total Unpaid Amount: $${user.total_unpaid_amount}`}
              />
              <Button
                variant="outlined"
                onClick={() => toggleBills(index)}
                endIcon={<ExpandMoreIcon />}
              >
                View Bill History
              </Button>
            </ListItem>
            <Collapse in={user.isOpen}>
              <List sx={{ paddingLeft: 5 }}>
                {user.bills.map((bill) => (
                  <ListItem divider key={bill.bill_id}>
                    <ListItemText
                      primary={`$${bill.amount}`}
                      secondary={
                        <div
                          style={{ display: "flex", flexDirection: "column" }}
                        >
                          <span>
                            Issued Date:{" "}
                            {dayjs(bill.issueddate).format("YYYY/MM/DD")}
                          </span>
                          <span>
                            Due Date: {dayjs(bill.duedate).format("YYYY/MM/DD")}
                          </span>
                          <span>
                            Status: {bill.paymentstatus ? "paid" : "unpaid"}
                          </span>
                        </div>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </React.Fragment>
        ))}
      </List>
    </Container>
  );
};

export default UserBillsList;
