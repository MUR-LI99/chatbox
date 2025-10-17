import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";
import bodyParser from "body-parser";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }, // Allow all clients for dev
});

app.use(cors());
app.use(bodyParser.json());

// ✅ Use mysql2/promise for async/await
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "mysql@123",
  database: "chatweb",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});


//LOGIN COMMUNICATION

// Simple health check
app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.post("/api/login", async (req, res) => {
  const { name, password } = req.body;

  if (!name || !password) {
    return res.status(400).json({ success: false, message: "Email and password required" });
  }

  try {
    const [results] = await pool.query(
      "SELECT id FROM user WHERE user_name = ? AND password = ?",
      [name, password]
    );

    if (results.length > 0) {
      const userId = results[0].id;
      return res.json({ success: true, userId, message: "Login successful" });
    } else {
      return res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (err) {
    console.error("DB error:", err);
    return res.status(500).json({ success: false, message: "Database error" });
  }
});

app.get("/api/loadChaters/:userId", async (req, res) => {
  const { userId } = req.params;

  const query = `
  SELECT DISTINCT u.id, u.user_name, cs.chat_id, cs.sender_id, cs.receiver_id, ch.chat_description, ch.created_at 
  FROM user u
  JOIN chat_sessions cs
    ON (u.id = cs.sender_id OR u.id = cs.receiver_id)
  JOIN chat_history ch 
    ON (ch.chat_id = cs.chat_id) 
  WHERE cs.sender_id = ?  OR cs.receiver_id = ?
  GROUP BY u.id
  ORDER BY ch.created_at DESC 
  `;

  try {
    const [result] = await pool.query(query, [userId, userId]);
    res.json({ success: true, users: result });
  } catch (err) {
    console.error("Error fetching chat data:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Listen for new message from a client
  socket.on("send_message", async (data) => {
    console.log("📩 Message received:", data);
    const { senderId, receiverId, chat_description } = data;

    // Store message in DB
    try {
        await conn.beginTransaction();
        let chatId;
    
          // Otherwise, create a new session
          const [insertRes] = await conn.query(
            `INSERT INTO chat_sessions (sender_id, receiver_id) VALUES (?, ?)`,
            [senderId, receiverId]
          );
          chatId = insertRes.insertId;
    
        // Step 2: Insert message into chat_history
        await conn.query(
          `INSERT INTO chat_history (chat_id, sender_id, receiver_id, chat_description, created_at)
           VALUES (?, ?, ?, ?, NOW())`,
          [chatId, senderId, receiverId, chat_description]
        );
        await conn.commit();
        res.json({ success: true, chat_id: chatId });
      // Emit message to all clients (or specific user)
      io.emit("receive_message", {
        id: insertRes.insertId,
        chatId,
        senderId,
        receiverId,
        chat_description,
      });
    } catch (err) {
      console.error("DB Error saving message:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

app.get("/api/loadActiveChat/:u/:r", async (req, res) => {
  const senderId = parseInt(req.params.u);
  const receiverId = parseInt(req.params.r);

  const query = `
  SELECT * 
  FROM chat_history ch
  WHERE (ch.sender_id = ? AND ch.receiver_id = ?)
     OR (ch.sender_id = ? AND ch.receiver_id = ?)
  ORDER BY ch.created_at DESC
`;

  try {
    const [result] = await pool.query(query, [senderId, receiverId, receiverId, senderId]);
    res.json({ success: true, users: result });
  } catch (err) {
    console.error("Error fetching chat data:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});


// app.post("/api/sendMessage/:r/:s", async (req, res) => {
//   const senderId = req.params.s;
//   const receiverId = req.params.r;
//   const { chat_description } = req.body;

//   if (!senderId || !receiverId || !chat_description) {
//     return res.status(400).json({ success: false, message: "Missing fields" });
//   }

//   const conn = await pool.getConnection();

//   try {
//     await conn.beginTransaction();

//     let chatId;

//       // Otherwise, create a new session
//       const [insertRes] = await conn.query(
//         `INSERT INTO chat_sessions (sender_id, receiver_id) VALUES (?, ?)`,
//         [senderId, receiverId]
//       );
//       chatId = insertRes.insertId;

//     // Step 2: Insert message into chat_history
//     await conn.query(
//       `INSERT INTO chat_history (chat_id, sender_id, receiver_id, chat_description, created_at)
//        VALUES (?, ?, ?, ?, NOW())`,
//       [chatId, senderId, receiverId, chat_description]
//     );

//     await conn.commit();

//     res.json({ success: true, chat_id: chatId });
//   } catch (err) {
//     await conn.rollback();
//     console.error("Transaction failed:", err);
//     res.status(500).json({
//       success: false,
//       message: "Database error",
//       details: err.message,
//     });
//   } finally {
//     conn.release();
//   }
// });





// Start the server
const PORT = 5000;
server.listen(PORT, () => console.log(`API running at http://localhost:${PORT}`));
