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
      const request = await fetch(`https://one012-counter-ws-server.onrender.com/api/v1/message/${userinfo._id}/${user}`)
      const response = await request.json()
      setChat(response)
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
          <p className='text-sm'>{selectedUser?.grade}</p>
        </div>

        <div>
          <BsThreeDotsVertical />
        </div>
      </div>

      <div className='flex-1 h-[55%] px-4 overflow-y-auto'>
        {
          chat?.map((item, id) => (
            <div key={id} className={`chat flex flex-col  w-full ${item.from === userinfo._id ? "chat-end" : "chat-start"}`}>
              <div className={`flex items-end gap-4 max-w-[65%]  ${item.from === userinfo._id ? "flex-row-reverse" : "flex-row"}`}>
                <figure>
                  <img src={selectedUser?.avatar || "https://static.wikia.nocookie.net/universalstudios/images/f/f2/Shrek2-disneyscreencaps.com-4369.jpg/revision/latest?cb=20250224023204"} className='size-10 bg-base-100 rounded-full' alt="" />
                </figure>

                <div className={`chat-bubble flex-1 ${item.from === userinfo._id ? "chat-bubble-primary" : "chat-bubble-secondary"}`}>
                  <p className=' break-words w-full'>{item?.text}</p>
                  <p className='text-white/70 text-end text-xs'>{item?.timeStamp?.slice(11, 16)}</p>
                </div>
              </div>
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
