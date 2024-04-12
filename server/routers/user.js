const express = require("express");
const router = express.Router();
const client = require("../db/pgDB");
const { Client } = require("pg");

router.get("/get/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { userType } = req.query;

    var query = `SELECT * FROM ${userType}s WHERE ${userType}_id = $1`;

    var result = await client.query(query, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Member not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching member:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/getMetrics/:id", async (req, res) => {
  const member_id = req.params.id;

  try {
    const query = `
      SELECT 
        metric_type,
        currentvalue,
        targetvalue
      FROM
        healthmetrics
      WHERE
        member_id = $1;
    `;

    const result = await client.query(query, [member_id]);

    res.json(result.rows);
  } catch (err) {
    console.error("Error executing query", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/getByName", async (req, res) => {
  try {
    const { searchQuery } = req.body;
    const query = "SELECT * FROM members WHERE fullname LIKE $1";
    const result = await client.query(query, ["%" + searchQuery + "%"]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No Result" });
    }
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching members:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/createOrUpdateMetrics/:id", async (req, res) => {
  const member_id = req.params.id;
  const { metrics } = req.body;

  try {
    for (const metric of metrics) {
      const result = await client.query(
        `
      SELECT 
        *
      FROM
        healthmetrics
      WHERE
        metric_type = $1 AND member_id = $2;
    `,
        [metric.metric_type, member_id]
      );
      if (result.rows.length == 0) {
        await client.query(
          `INSERT INTO  healthmetrics (member_id, metric_type, currentvalue, targetvalue) VALUES ($1, $2, $3, $4)`,
          [
            member_id,
            metric.metric_type,
            metric.currentvalue,
            metric.targetvalue,
          ]
        );
      } else {
        await client.query(
          `UPDATE healthmetrics SET currentvalue = $1, targetvalue = $2 WHERE member_id = $3 AND metric_type = $4`,
          [
            metric.currentvalue,
            metric.targetvalue,
            member_id,
            metric.metric_type,
          ]
        );
      }
    }
    res.status(200).json();
  } catch (err) {
    console.error("Error executing query", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/updateSchedule/:id", async (req, res) => {
  try {
    const { id: trainerId } = req.params;
    const { schedule } = req.body;

    for (const entry of schedule) {
      const { date, startTime, endTime, id } = entry;
      if (id) {
        if (!startTime && !startTime && !date) {
          var query = {
            text: "DELETE FROM schedules WHERE schedule_id = $1",
            values: [id],
          };
        } else {
          var query = {
            text: "UPDATE schedules SET dayOfWeek = $1, start_time = $2, end_time = $3 WHERE schedule_id = $4",
            values: [date, startTime, endTime, id],
          };
        }
      } else {
        var query = {
          text: "INSERT INTO schedules (trainer_id, dayOfWeek, start_time, end_time) VALUES ($1, $2, $3, $4)",
          values: [trainerId, date, startTime, endTime],
        };
      }

      await client.query(query);
    }
    res.status(200).json({ message: "Schedule saved successfully" });
  } catch (error) {
    console.error("Error saving schedule:", error);
    res
      .status(500)
      .json({ error: "An error occurred while saving the schedule" });
  }
});

router.get("/getSchedule/:id", async (req, res) => {
  const trainerId = req.params.id;

  try {
    const query = {
      text: `
        SELECT schedule_id, dayOfWeek, start_time, end_time
        FROM schedules
        WHERE trainer_id = $1
      `,
      values: [trainerId],
    };

    const result = await client.query(query);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No availabilities found for the trainer" });
    }

    const availabilities = result.rows.map((row) => ({
      id: row.schedule_id,
      date: row.dayofweek,
      startTime: row.start_time,
      endTime: row.end_time,
    }));

    res.status(200).json(availabilities);
  } catch (error) {
    console.error("Error fetching availabilities:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching availabilities" });
  }
});

router.put("/update/:id", async (req, res) => {
  const { id } = req.params;
  const { fullname, email, userType, address, phone, bio } = req.body;

  try {
    var existingUser = await client.query(
      `SELECT * FROM ${userType}s WHERE ${userType}_id = $1`,
      [id]
    );

    if (existingUser.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    if (existingUser.rows[0].email !== email) {
      const emailCheck = await client.query(
        `SELECT * FROM ${userType}s WHERE email = $1`,
        [email]
      );
      if (emailCheck.rows.length > 0) {
        return res.status(400).json({ message: "Email already registered" });
      }
    }

    const test = await client.query(
      `UPDATE ${userType}s SET fullname = $1, email = $2, address = $3, phone = $4 ${
        userType == "trainer" ? ", bio = $5" : ""
      } WHERE ${userType}_id = ${userType == "trainer" ? "$6" : "$5"}`,
      userType == "trainer"
        ? [
            fullname,
            email,
            address,
            phone,
            userType == "trainer" ? bio : null,
            id,
          ]
        : [fullname, email, address, phone, id]
    );

    res.status(200).json({ message: "User updated successfully" });
  } catch (err) {
    console.error("Error updating user", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/getTrainers", async (req, res) => {
  try {
    const query = {
      text: `
        SELECT t.trainer_id, t.fullname, t.bio, ta.dayOfWeek, ta.start_time, ta.end_time
        FROM trainers t
        LEFT JOIN schedules ta ON t.trainer_id = ta.trainer_id
      `,
    };

    const result = await client.query(query);

    const trainers = {};
    result.rows.forEach((row) => {
      const { trainer_id, fullname, bio, dayofweek, start_time, end_time } =
        row;
      if (!trainers[trainer_id]) {
        trainers[trainer_id] = {
          trainer_id,
          fullname,
          bio,
          availabilities: [],
        };
      }
      if (dayofweek && start_time && end_time) {
        trainers[trainer_id].availabilities.push({
          dayOfWeek: dayofweek,
          startTime: start_time,
          endTime: end_time,
        });
      }
    });

    res.status(200).json(Object.values(trainers));
  } catch (error) {
    console.error("Error fetching trainers:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching trainers" });
  }
});

router.get("/getTrainingSessions/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const sessions = await client.query(
      `SELECT ts.session_id, ts.dayofweek, ts.start_time, ts.end_time, t.fullname AS trainer_name
          FROM trainingsessions ts
          JOIN trainers t ON ts.assignedtrainer = t.trainer_id
          WHERE ts.scheduledby = $1`,
      [id]
    );
    res.json(sessions.rows);
  } catch (err) {
    console.error("Error getting training sessions:", err.message);
    res.status(500).send("Server Error");
  }
});

router.put("/addTrainingSession/:id", async (req, res) => {
  const { id } = req.params;
  const { trainer_id, dayOfWeek, start_time, end_time } = req.body;
  console.log(req.body);
  try {
    const schedules = await client.query(
      "SELECT * FROM schedules WHERE trainer_id = $1 AND dayOfWeek = $2 AND (start_time <= $3 AND end_time > $3) AND (start_time < $4 AND end_time >= $4)",
      [trainer_id, dayOfWeek, start_time, end_time]
    );
    if (schedules.rows.length === 0) {
      return res
        .status(409)
        .json({ message: "Trainer is not available at the requested time" });
    }
    const newTrainingSession = await client.query(
      "INSERT INTO trainingSessions (scheduledBy, assignedTrainer, dayOfWeek, start_time, end_time) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [id, trainer_id, dayOfWeek, start_time, end_time]
    );
    console.log(newTrainingSession);
    await client.query(
      "INSERT INTO bills (billType, dueDate, amount, issuedDate, paidBy, trainingSessionId) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [
        "Training Session",
        new Date(new Date().setDate(new Date().getDate() + 10))
          .toISOString()
          .split("T")[0],
        50,
        new Date(),
        id,
        newTrainingSession.rows[0].session_id,
      ]
    );

    const trainer = await client.query(
      "SELECT fullName FROM trainers WHERE trainer_id = $1",
      [trainer_id]
    );
    res.status(201).json({
      ...newTrainingSession.rows[0],
      trainer_name: trainer.rows[0].fullname,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/cancelSession/:id", async (req, res) => {
  const sessionId = req.params.id;
  try {
    await client.query("DELETE FROM bills WHERE trainingSessionId = $1", [
      sessionId,
    ]);
    await client.query("DELETE FROM trainingSessions WHERE session_id = $1", [
      sessionId,
    ]);
    res.status(200).json({ message: "Training session canceled successfully" });
  } catch (error) {
    console.error("Error canceling training session:", error);
    return res.status(500).json({
      message: "Failed to cancel training session. Please try again.",
    });
  }
});

router.get("/getBills/:id", async (req, res) => {
  const paidById = req.params.id;
  try {
    const query = {
      text: "SELECT * FROM bills b LEFT JOIN trainingSessions ts ON ts.session_id = b.trainingSessionId LEFT JOIN trainers t ON ts.assignedTrainer = t.trainer_id WHERE b.paidBy = $1",
      values: [paidById],
    };
    const { rows } = await client.query(query);

    return res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching bills:", error);
    return res
      .status(500)
      .json({ message: "Failed to fetch bills. Please try again." });
  }
});

router.put("/payBill/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Update the payment status of the bill with the specified ID
    await client.query(
      "UPDATE bills SET paymentStatus = true WHERE bill_id = $1",
      [id]
    );
    res.status(200).json({ message: "Bill paid successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error paying the bill" });
  }
});

router.get("/getEquipments", async (req, res) => {
  try {
    const result = await client.query("SELECT * FROM equipments");
    const equipments = result.rows;
    res.status(200).json(equipments);
  } catch (err) {
    console.error("Error fetching equipments", err);
    res.status(500).send("Error fetching equipments");
  }
});

router.get("/getRoomsWithEq", async (req, res) => {
  try {
    const query = `
    SELECT
      r.room_number,
      r.capacity,
      r.description AS room_description,
      e.equip_id,
      e.equip_type,
      e.maintenance_status
    FROM
      rooms r
      LEFT JOIN equipments e ON r.room_number = e.locatedAt
    ORDER BY
      r.room_number,
      e.equip_id;
  `;

    const { rows } = await client.query(query);

    const rooms = [];
    let currentRoom = null;
    rows.forEach((row) => {
      if (!currentRoom || currentRoom.room_number !== row.room_number) {
        if (currentRoom) {
          rooms.push(currentRoom);
        }
        currentRoom = {
          room_number: row.room_number,
          capacity: row.capacity,
          description: row.room_description,
          equipments: [],
        };
      }
      if (row.equip_id) {
        currentRoom.equipments.push({
          equip_id: row.equip_id,
          equip_type: row.equip_type,
          maintenance_status: row.maintenance_status,
        });
      }
    });
    if (currentRoom) {
      rooms.push(currentRoom);
    }

    return res.status(200).json(rooms);
  } catch (error) {
    res.status(500).send("Error saving changes");
    throw error;
  }
});

router.put("/updateEquipments", async (req, res) => {
  const { rooms } = req.body;
  console.log(rooms);
  try {
    for (const room of rooms) {
      for (const equipment of room.equipments) {
        await client.query(
          `UPDATE equipments SET maintenance_status = $1 WHERE equip_id = $2`,
          [equipment.maintenance_status, equipment.equip_id]
        );
      }
    }

    res.status(200).json({ message: "Equipments updated successfully" });
  } catch (error) {
    console.error("Error updating equipments:", error);
    res.status(500).json({ message: "Error saving changes" });
  }
});

router.get("/getAllUsersWithBill", async (req, res) => {
  try {
    const query = `
      SELECT
        m.member_id,
        m.fullName AS full_name,
        b.bill_id,
        b.amount,
        b.paymentStatus,
        b.issuedDate,
        b.duedate,
        b.billType
      FROM
        members m
        LEFT JOIN bills b ON m.member_id = b.paidBy
    `;

    const result = await client.query(query);

    const usersWithBills = result.rows.reduce((acc, row) => {
      const {
        member_id,
        full_name,
        bill_id,
        amount,
        paymentstatus,
        issueddate,
        duedate,
        billtype,
      } = row;
      if (!acc[member_id]) {
        acc[member_id] = {
          member_id,
          full_name,

          total_unpaid_amount: 0,
          bills: [],
        };
      }

      if (!paymentstatus) {
        acc[member_id].total_unpaid_amount += amount;
      }
      if (bill_id) {
        acc[member_id].bills.push({
          bill_id,
          amount,
          paymentstatus,
          issueddate,
          duedate,
          billtype,
        });
      }

      return acc;
    }, {});

    res.json(Object.values(usersWithBills));
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/getRooms", async (req, res) => {
  try {
    const result = await client.query("SELECT * FROM rooms");
    const rooms = result.rows;

    res.status(200).json(rooms);
  } catch (error) {
    console.error("Error fetching rooms", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/getTrainers", async (req, res) => {
  try {
    const result = await client.query("SELECT * FROM trainers");
    const trainers = result.rows;

    res.status(200).json(trainers);
  } catch (error) {
    console.error("Error fetching rooms", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/createOrUpdateGroupClass", async (req, res) => {
  const {
    capacity,
    noOfMembers,
    scheduledBy,
    classType,
    assignedTrainer,
    assignedRoom,
    schedule,
    class_id,
  } = req.body;

  try {
    const roomResult = await client.query(
      "SELECT capacity FROM rooms WHERE room_number = $1",
      [assignedRoom]
    );
    const roomCapacity = roomResult.rows[0].capacity;

    if (capacity > roomCapacity) {
      return res.status(400).json({
        message:
          "Class capacity exceeds room capacity. Class cannot be created.",
      });
    }
    if (!class_id) {
      var result = await client.query(
        "INSERT INTO groupClasses (capacity, noOfMembers, scheduledBy, classType, assignedTrainer, assignedRoom) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
        [
          capacity,
          noOfMembers,
          scheduledBy,
          classType,
          assignedTrainer,
          assignedRoom,
        ]
      );
    } else {
      var result = await client.query(
        "UPDATE groupClasses SET capacity = $1, noOfMembers = $2, scheduledBy = $3, classType = $4, assignedTrainer = $5, assignedRoom = $6 WHERE class_id = $7",
        [
          capacity,
          noOfMembers,
          scheduledBy,
          classType,
          assignedTrainer,
          assignedRoom,
          class_id,
        ]
      );
    }
    const insertedClassId = result.rows[0]?.class_id || class_id;
    console.log(schedule);
    for (const entry of schedule) {
      const { date, startTime, endTime, id } = entry;

      if (id) {
        if (!startTime && !startTime && !date) {
          var query = {
            text: "DELETE FROM schedules WHERE schedule_id = $1",
            values: [id],
          };
        } else {
          // CHECKS IF TRAINER IS AVAILABLE
          const schedules = await client.query(
            "SELECT * FROM schedules WHERE trainer_id = $1 AND dayOfWeek = $2 AND (start_time <= $3 AND end_time > $3) AND (start_time < $4 AND end_time >= $4)",
            [assignedTrainer, date, startTime, endTime]
          );

          if (schedules.rows.length === 0) {
            return res.status(409).json({
              message: "Trainer is not available at the requested time",
            });
          }
          var query = {
            text: "UPDATE schedules SET dayOfWeek = $1, start_time = $2, end_time = $3 WHERE schedule_id = $4",
            values: [date, startTime, endTime, id],
          };
        }
      } else {
        // CHECKS IF TRAINER IS AVAILABLE
        const schedules = await client.query(
          "SELECT * FROM schedules WHERE trainer_id = $1 AND dayOfWeek = $2 AND (start_time <= $3 AND end_time > $3) AND (start_time < $4 AND end_time >= $4)",
          [assignedTrainer, date, startTime, endTime]
        );
        if (schedules.rows.length === 0) {
          return res.status(409).json({
            message: "Trainer is not available at the requested time",
          });
        }
        var query = {
          text: "INSERT INTO schedules (groupclass_id, dayOfWeek, start_time, end_time) VALUES ($1, $2, $3, $4)",
          values: [insertedClassId, date, startTime, endTime],
        };
      }
      await client.query(query);
    }
    if (schedule.length <= 0) {
      return res.status(500).json({ message: "No Day Added!" });
    }
    res.status(201).json({
      message: `Class ${class_id ? "created" : "updated"} successfully`,
      class: insertedClassId,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/getClasses", async (req, res) => {
  try {
    const classesQuery = `
      SELECT
        gc.class_id,
        gc.capacity,
        gc.noOfMembers,
        gc.classType,
        gc.assignedTrainer,
        t.fullName as trainer_name,
        gc.assignedRoom,
        r.description as room_description,
        s.schedule_id,
        s.dayOfWeek,
        s.start_time,
        s.end_time,
        m.fullName as member_name,
        m.member_id
      FROM groupClasses gc
      JOIN schedules s ON gc.class_id = s.groupclass_id
      LEFT JOIN classregistrations cr ON gc.class_id = cr.groupClass_id
      LEFT JOIN members m ON cr.member_id = m.member_id
      JOIN trainers t ON gc.assignedTrainer = t.trainer_id
      JOIN rooms r ON gc.assignedRoom = r.room_number
      ORDER BY gc.class_id, s.dayOfWeek;
    `;

    const { rows } = await client.query(classesQuery);

    const classes = [];
    let currentClass = null;

    for (let row of rows) {
      if (!currentClass || currentClass.class_id !== row.class_id) {
        if (currentClass) {
          classes.push(currentClass);
        }
        currentClass = {
          class_id: row.class_id,
          capacity: row.capacity,
          noOfMembers: row.noofmembers,
          classType: row.classtype,
          assignedTrainer: {
            trainer_id: row.assignedtrainer,
            fullname: row.trainer_name,
          },
          assignedRoom: {
            room_number: row.assignedroom,
            description: row.room_description,
          },
          scheduledDays: [],
          members: [],
        };
      }

      if (!currentClass.scheduledDays.includes(row.schedule_id)) {
        currentClass.scheduledDays.push({
          id: row.schedule_id,
          date: row.dayofweek,
          startTime: row.start_time,
          endTime: row.end_time,
        });
      }

      if (
        row.member_id &&
        !currentClass.members.some((el) => el.member_id == row.member_id)
      ) {
        currentClass.members.push({
          member_id: row.member_id,
          fullName: row.member_name,
        });
      }
    }

    if (currentClass) {
      classes.push(currentClass);
    }

    res.json(classes);
  } catch (err) {
    console.error("Error executing query", err);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
});

router.post("/registerClass/:userid", async (req, res) => {
  try {
    const { userid } = req.params;
    const { class_id } = req.body;

    const class_ = await client.query(
      "SELECT * FROM groupClasses WHERE class_id = $1",
      [class_id]
    );
    if (class_.rows[0].noofmembers >= class_.rows[0].capacity) {
      return res.status(400).json({
        message: "Class is full! Can't Register",
      });
    }

    const registerQuery =
      "INSERT INTO classRegistrations (member_id, groupClass_id) VALUES ($1, $2)";
    await client.query(registerQuery, [userid, class_id]);

    await client.query(
      "INSERT INTO bills (billType, dueDate, amount, issuedDate, paidBy) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [
        "Group Class",
        new Date(new Date().setDate(new Date().getDate() + 10))
          .toISOString()
          .split("T")[0],
        25,
        new Date(),
        userid,
      ]
    );

    const increaseNoOfMembersQuery =
      "UPDATE groupClasses SET noOfMembers = noOfMembers + 1 WHERE class_id = $1";
    await client.query(increaseNoOfMembersQuery, [class_id]);

    res
      .status(200)
      .json({ message: "User registered for the class successfully" });
  } catch (error) {
    console.error("Error registering user for class:", error);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
});

router.post("/deRegisterClass/:userid", async (req, res) => {
  try {
    const { userid } = req.params;
    const { class_id } = req.body;

    await client.query(
      "DELETE FROM classRegistrations WHERE member_id = $1 AND groupClass_id = $2",
      [userid, class_id]
    );

    await client.query(
      "UPDATE groupClasses SET noOfMembers = noOfMembers - 1 WHERE class_id = $1",
      [class_id]
    );

    res
      .status(200)
      .json({ message: "User registered for the class successfully" });
  } catch (error) {
    console.error("Error de-registering user for class:", error);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
});

module.exports = router;
