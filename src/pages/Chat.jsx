import React, { use, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { BsThreeDotsVertical } from "react-icons/bs";
import { PiTelegramLogo } from "react-icons/pi";
import socket from "../Socket.jsx"


const Chat = () => {
  const { user } = useParams()
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)
  const [inputValue, setInputValue] = useState("Abdulahm")
  const userinfo = useSelector(state => state?.auth?.user?.user)
  const [chat, setChat] = useState([])

  const getUser = async () => {
    try {
      const request = await fetch(`https://one012-counter-ws-server.onrender.com/api/v1/auth/getUser/${user}`)
      const response = await request.json()
      // console.log("respnose:", response)
      setSelectedUser(response)
    } catch (e) {
      console.log("SERVER ERROR: ", e)
    } finally {
      setLoading(false)

    }
  }

  useEffect(() => {
    setLoading(true)
    getUser()
  }, [user])

  useEffect(() => {
    const receiveMessage = (data) => {
      console.log("Yangi xabar keldi:", data);
      setChat((prev) => [...prev, data]); // chatga qo‘shamiz
    };

    socket.on("receive_message", receiveMessage);

    return () => {
      socket.off("receive_message", receiveMessage); // cleanup
    };
  }, []);

  const getChat = async () => {
    console.log("USER ID: ", user)
    console.log("SELECTED ID: ", userinfo._id)
    try {
      const request = await fetch(`http://localhost:8000/api/v1/message/${userinfo.id}/${user}`)
      const response = await request.json()
      console.log("chat:", response)
    } catch (e) {
      console.log("SERVER ERROR: ", e)
    } finally {

    }
  }

  useEffect(() => {
    getChat()
  }, [user])

  const sendMessage = (e) => {
    e.preventDefault();
    const msg = {
      text: inputValue,
      from: userinfo._id, // fix
      to: selectedUser._id,
    };
    console.log("MESSAGE: ", msg)
    socket.emit("send_message", msg);
    setChat((prev) => [...prev, msg]); // darhol qo‘shish
    setInputValue("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      sendMessage(event);
    }
  };

  const typingHandler = (e) => {
    setInputValue(e.target.value)
    socket.emit("typing", { from: userinfo, to: selectedUser })
  }

  return (
    <div className='flex flex-col h-screen'>
      <div className='w-full p-5 bg-base-300 flex items-center justify-between'>
        <div>
          <p className='font-bold text-lg'>{selectedUser?.username}</p>
          <p className='text-sm'>{isTyping ? "Typing..." : selectedUser?.grade}</p>
        </div>

        <div>
          <BsThreeDotsVertical />
        </div>
      </div>
      <div className='flex-1 h-[55%] overflow-y-auto'>
        {
          chat?.map((item, id) => (
            <div key={id} className={`chat ${item.from === userinfo._id ? "chat-end" : "chat-start"}`}>
              <div className="chat-bubble">{item.message}</div>
            </div>
          ))
        }
      </div>
      <div className='w-full py-5 px-5 bg-base-300 flex'>
        <input type="text" value={inputValue} onChange={(e) => typingHandler(e)} onKeyDown={(e) => handleKeyDown(e)} className='input input-bordered w-full' />
        <button className='btn btn-soft btn-primary' onClick={sendMessage}>
          <PiTelegramLogo />
        </button>
      </div>
    </div>
  )
}

export default Chat