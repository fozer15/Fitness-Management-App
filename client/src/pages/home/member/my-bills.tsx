import React, { useState, useEffect } from "react";
import axios, { ResponseType } from "axios";
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Box,
  Divider,
} from "@mui/material";
import { useUserContext } from "../../../components/context";
import { ToastContainer, toast } from "react-toastify";
import dayjs, { Dayjs } from "dayjs";

interface Bill {
  bill_id: number;
  billtype: string;
  duedate: string;
  amount: number;
  issueddate: string;
  paymentstatus: boolean;
  issuedby: number;
  paidby: number;
  fullname?: string;
  session_id?: number;
}

const MyBills: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const ctx = useUserContext();

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const response = await axios.get<Bill[]>(
          `http://localhost:3001/member/getBills/${ctx?.user?.user_id}`
        );
        setBills(response.data);
      } catch (error) {
        console.error("Error fetching bills:", error);
      }
    };

    fetchBills();
  }, []);

  const handlePayBill = async (bill_id: number) => {
    try {
      await axios.put(`http://localhost:3001/member/payBill/${bill_id}`);

      setBills((prevBills: Bill[]) =>
        prevBills.map((bill) =>
          bill.bill_id == bill_id ? { ...bill, paymentstatus: true } : bill
        )
      );

      toast.success("Bill paid successfully", {
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
      console.error("Error paying bill:", error);
    }
  };

  return (
    <div>
      <Typography variant="h5" gutterBottom>
        Bills
      </Typography>
      <List>
        {bills.map((bill) => (
          <div key={bill.bill_id}>
            <ListItem
              alignItems="flex-start"
              divider
              sx={{ padding: 3, display: "flex", alignItems: "center" }}
            >
              <ListItemText
                primary={`$${bill.amount}`}
                secondary={
                  <React.Fragment>
                    <Typography>
                      {" "}
                      {bill.session_id
                        ? bill.billtype + " with " + bill.fullname
                        : bill.billtype}
                    </Typography>
                    <Typography
                      component="span"
                      variant="body2"
                      color="textSecondary"
                    >
                      Issue Date: {dayjs(bill.issueddate).format("YYYY/MM/DD")}
                    </Typography>
                    <br />
                    <Typography
                      component="span"
                      variant="body2"
                      color="textSecondary"
                    >
                      Due Date: {dayjs(bill.duedate).format("YYYY/MM/DD")}
                    </Typography>
                  </React.Fragment>
                }
              />
              {bill.paymentstatus ? (
                <Box ml="auto">
                  <Typography variant="body2" color="green">
                    PAID
                  </Typography>
                </Box>
              ) : (
                <Box ml="auto">
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handlePayBill(bill.bill_id)}
                  >
                    Pay Now
                  </Button>
                </Box>
              )}
            </ListItem>
            <Divider />
          </div>
        ))}
      </List>
      <ToastContainer />
    </div>
  );
};

export default MyBills;
