import React from "react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5000"); // connect to server
export default function HomePage() {
  const userId = parseInt(localStorage.getItem("userId"));
  const [chaters, setChaters] = useState([])
  const [chatDetails, setActiveChat] = useState([])
  const [chatname, setChatName] = useState({ id: null, name: "" });
  const [newChat, setNewChat] = useState('')
  const [renderCheck, setrenderCheck] = useState(false)
  const [messages, setMessages] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:5000/api/loadChaters/${userId}`)  // replace with your API
    .then((res) => res.json())
    .then((data) => {setChaters(data.users.filter((users) => users.id !== parseInt(userId)));})
    .catch((err) => console.error("Error fetching projects:", err));
  }, []);
  function loadchat(id,name){
    console.log(renderCheck)
    fetch(`http://localhost:5000/api/loadActiveChat/${userId}/${id}`)  // replace with your API
    .then((res) => res.json())
    .then((data) => {setActiveChat(data.users);})
    .catch((err) => console.error("Error fetching projects:", err));
      setChatName(prev => ({
        ...prev,
        id: id,
        name: name
      }));
  }
  useEffect(() => {
    if (chaters.length > 0) {
      loadchat(chaters[0].id);
      setrenderCheck(true)
      setChatName(prev => ({
        ...prev,
        id: chaters[0].id,
        name: chaters[0].user_name
      }));
    }
  }, [chaters]);
  useEffect(() => {
    socket.on("receive_message", (data) => {
      // Only update chat if message is between the current users
      if (
        (data.sender_id === userId && data.receiver_id === chatname.id) ||
        (data.sender_id === chatname.id && data.receiver_id === userId)
      ) {
        setActiveChat((prev) => [data,...prev]);
        console.log("data",chatDetails)
      }
    });
    return () => socket.off("receive_message");
  }, [chatname]);
  const handleSubmit = async(e,receiverId,receiverName,senderId) => {
    e.preventDefault();
    if (!newChat.trim()) return;

    const messageData = {
      sender_id: senderId,
      receiver_id: receiverId,
      receiver_name: receiverName,
      chat_description: newChat,
    };
    socket.emit("send_message", messageData);
    setNewChat("");
  };

  
  return (
    <div>
      <div className="col-12 d-flex flex-row justify-content-start ">
        <img
          src="./src/assets/chat-box.png"
          alt="logo"
          className="headlogo p-1"
        />
        <h5 className="ms-2 text-white p-1">Yapp</h5>
      </div>
      <div className="col-12 d-flex flex-coloumn justify-content-start ">
        <div className="col-1 d-flex flex-row justify-content-start ">
          <div className="container-fluid" style={{ height: "100vh" }}>
          </div>
        </div>
        {/* CHATER'S DETAIL'S */}
        <div className="col-3 d-flex flex-row justify-content-start chat-box border-1 rounded-start-3">
          <div className="container-fluid overflow-auto" style={{ height: "100vh" }}>
            <h3 className="text-white p-1">Chats</h3>
            <div id="search_bar"
              className="card m-3"
              style={{ height: "5vh" }}
            ></div>
            {console.log(chaters)}
            {console.log(chatDetails)}
           {chaters
            .map((users) => (
              <div key={users.id} className="my-2 p-1 d-flex flex-row justify-content-between border-1 border-black border-bottom hover-shadow" 
              onClick={() => loadchat(users.id,users.user_name)} style={{ height: "10vh" }}>
               <div className=""> 
                <img
                src="./src/assets/user (2).png"
                className="rounded-circle p-1 ms-1 mt-2"
                alt="Profile"
                width="48"
                height="48"
              ></img>
              </div>
              <div className="col-6 d-flex flex-column ms-4">
                <h5 className="text-white">{users.user_name}</h5>
                <p className="text-white">messages</p>
              </div>  
              <div className="d-flex flex-column text-white me-1">
                11:30 pm
              </div>
              </div>
            ))}

          </div>
        </div>
        {/* CHATER'S DETAIL'S ENDS */}
        <div className="col-8 d-flex flex-row justify-content-start chat-box border-start border-1 border-dark p-1">
          <div className="container-fluid"  style={{ height: "100vh" }}>
            {/* CHATER HEAD */}
            <div
              className="card d-flex flex-row p-1"
              style={{ height: "8vh" }}
            >
              <img
                src="./src/assets/user (2).png"
                className="rounded-circle p-1 ms-1"
                alt="Profile"
                width="42"
                height="42"
              ></img>
              <h3 className="text-white ps-1 ms-3">{chatname.name}</h3>
            </div>
             {/* CHATER HEAD ENDS */}
            {/* CHAT CONTAINER */}
            {if(Object.keys(chatDetails).length === 0){}}
            {console.log(chatDetails)}
            <div id="chat_container" className="card p-3 mt-1 d-flex flex-column justify-content-end" style={{ height: "85vh" }}>
            <div id="chat_content" className="p-3 mt-1 overflow-auto d-flex flex-column-reverse m-2" style={{ height: "80vh" }}>
                {chatDetails.map((chat, index) => {
                
                  const isSender = chat.sender_id === userId;
                  return (
                    <div
                      key={index}
                      className={`d-flex flex-row justify-content-${
                        isSender ? "end" : "start"
                      } mb-3`}
                      id={isSender ? "sended_chat" : "received_chat"}
                    >
                      <div className="card col-6 rounded border-black mb-4">
                      <div className="card col-12 rounded border-black text-white p-2">
                          {chat.chat_description}
                        </div>
                      </div>
                    </div>
                  );
                })}
              
            </div>
            <div id="chat_interaction" className="d-flex align-items-center gap-2 p-2 border-2 rounded"
              style={{
                position: "absolute",
                bottom: "0",
                left: "0",
                right: "0",
                backgroundColor: "#2f2f2f",
                borderTop: "1px solid #3a3a3a",
              }}
            >
              <button className="chat-btn">
                <i className="bi bi-paperclip"></i>
              </button>

              <button className="chat-btn">
                <i className="bi bi-emoji-smile"></i>
              </button>
              <input
                type="text"
                className="form-control"
                placeholder="Type a message..."
                value={newChat}
                onChange={(e) => setNewChat(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSubmit(e, chatname.id, chatname.name, userId);
                }}
              />
                <button
                  type="submit"
                  className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: "40px", height: "40px" }}
                  onClick={(e) => handleSubmit(e, chatname.id, chatname.name, userId)}
                >
                  <i className="bi bi-send-fill"></i>
                </button>
            </div>
            </div>
            {/* CHAT CONTAINER ENDS */}
          </div>
        </div>
      </div>
    </div>
  );
}
