import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { BsThreeDotsVertical } from "react-icons/bs"
import { PiTelegramLogo } from "react-icons/pi"
import socket from "../Socket.jsx"
import DrawerUser from "../components/DrawerUser"
import { FaPhone, FaVideo } from "react-icons/fa6";
import { MdCallEnd } from "react-icons/md";

const Chat = () => {
  const { user } = useParams()
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)
  const [inputValue, setInputValue] = useState("")
  const userinfo = useSelector(state => state?.auth?.user?.user)
  const [chat, setChat] = useState([])

  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const getUser = async () => {
    try {
      const request = await fetch(`https://one012-counter-ws-server.onrender.com/api/v1/auth/getUser/${user}`)
      const response = await request.json()
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
      setChat((prev) => [...prev, data])
    }
    socket.on("receive_message", receiveMessage)
    return () => socket.off("receive_message", receiveMessage)
  }, [])

  const getChat = async () => {
    try {
      const request = await fetch(`https://one012-counter-ws-server.onrender.com/api/v1/message/${userinfo._id}/${user}`)
      const response = await request.json()
      setChat(response)
    } catch (e) {
      console.log("SERVER ERROR: ", e)
    }
  }

  useEffect(() => {
    getChat()
  }, [user])

  const sendMessage = (e) => {
    e.preventDefault()
    const msg = {
      text: inputValue,
      from: userinfo._id,
      to: selectedUser._id,
    }
    socket.emit("send_message", msg)
    setChat((prev) => [...prev, msg])
    setInputValue("")
  }

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      sendMessage(event)
    }
  }

  const typingHandler = (e) => {
    setInputValue(e.target.value)
    socket.emit("typing", { from: userinfo, to: selectedUser })
  }

  return (
    <div className='flex flex-col h-screen'>
      <DrawerUser selectedUser={selectedUser} isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

      {/* Header */}
      <div className='w-full p-5 bg-base-300 flex items-center justify-between'>
        <div>
          <p className='font-bold text-lg'>{selectedUser?.username}</p>
          <p className='text-sm'>{selectedUser?.grade}</p>
        </div>
        <div className="flex gap-2 items-center">
          <button onClick={() => setIsDrawerOpen(true)} className='btn btn-ghost'>
            <BsThreeDotsVertical />
          </button>

          <button className="btn btn-primary" onClick={() => document.getElementById('call_modal').showModal()}>
            <FaPhone />
          </button>
        </div>
      </div>

      {/* Chat messages */}
      <div className='flex-1 h-[55%] px-4 overflow-y-auto'>
        {chat?.map((item, id) => (
          <div key={id} className={`chat flex flex-col w-full ${item.from === userinfo._id ? "chat-end" : "chat-start"}`}>
            <div className={`flex items-end gap-4 max-w-[65%] ${item.from === userinfo._id ? "flex-row-reverse" : "flex-row"}`}>
              <figure>
                <img src={selectedUser?.profileImage || "https://via.placeholder.com/64"} className='size-10 bg-base-300 rounded-full' alt="" />
              </figure>
              <div className={`chat-bubble flex-1 ${item.from === userinfo._id ? "chat-bubble-primary" : "chat-bubble-secondary"}`}>
                <p className='break-words w-full'>{item?.text}</p>
                <p className='text-white/70 text-end text-xs'>{item?.timeStamp?.slice(11, 16)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Message input */}
      <div className='w-full py-5 px-5 bg-base-300 flex gap-2'>
        <input
          type="text"
          value={inputValue}
          onChange={typingHandler}
          onKeyDown={handleKeyDown}
          className='input input-bordered w-full'
        />
        <button className='btn btn-soft btn-primary' onClick={sendMessage}>
          <PiTelegramLogo />
        </button>
      </div>

      {/* Call modal (UI only) */}
      <dialog id="call_modal" className="modal">
        <div className="modal-box bg-[#1e1e1e] text-white text-center rounded-xl">
          <img
            src={selectedUser?.profileImage || "https://via.placeholder.com/100"}
            className="w-24 h-24 rounded-full mx-auto border-2 border-gray-500 mb-4"
          />
          <h3 className="text-xl font-bold">Jur'at baby</h3>
          <p className="text-gray-400 mt-1">
            Если Вы хотите начать видеозвонок,<br />нажмите на значок камеры.
          </p>

          <div className="flex justify-center mt-6 gap-6">
            <button className="btn btn-success btn-circle text-xl text-white">
              <FaVideo />
            </button>
            <form method="dialog">
              <button className="btn btn-error btn-circle text-xl text-white">
                <MdCallEnd />
              </button>
            </form>
          </div>

          <form method="dialog" className="absolute right-3 top-3">
            <button className="btn btn-sm btn-circle btn-ghost text-white">✕</button>
          </form>
        </div>
      </dialog>

    </div>
  )
}

export default Chat
