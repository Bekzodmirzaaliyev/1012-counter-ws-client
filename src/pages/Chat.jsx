import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { BsTelephone, BsThreeDotsVertical, BsFillTelephoneXFill   } from "react-icons/bs"
import { PiTelegramLogo } from "react-icons/pi"
import socket from "../Socket.jsx"
import DrawerUser from "../components/DrawerUser" // ⬅️ path kerak bo‘lsa o‘zgartiring

const Chat = () => {
  const { user } = useParams()
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)
  const [inputValue, setInputValue] = useState("")
  const userinfo = useSelector(state => state?.auth?.user?.user)
  const [chat, setChat] = useState([])
  const [status, setStatus ] = useState("вызов...")
  const [isDrawerOpen, setIsDrawerOpen] = useState(false) // ✅ Drawer state
  console.log("asdf",selectedUser)
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

      <div className='w-full p-5 bg-base-300 flex items-center justify-between'>
        <div>
          <p className='font-bold text-lg'>{selectedUser?.username}</p>
          <p className='text-sm'>{selectedUser?.grade}</p>
        </div>
        <div>
          <label for="my_modal_6" class="btn btn-soft btn-success"><BsTelephone />
          </label>
          <button onClick={() => setIsDrawerOpen(true)} className='btn btn-ghost'>
            <BsThreeDotsVertical />
          </button>
        </div>

      </div>

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

      <input type="checkbox" id="my_modal_6" class="modal-toggle" />
      <div class="modal" role="dialog">
        <div class="modal-box flex flex-col items-center">
           <div className='flex flex-col items-center gap-5'>
            <figure>
              <img src={selectedUser?.profileImage}  className="size-28" alt="" />
            </figure>
            <div className='flex flex-col gap-1 items-center'>
              <p className='font-semibold text-2xl'>{selectedUser?.username}</p>
              <p className='text-sm'>{status}</p>
            </div>
           </div>
           <div></div>
          <div class="modal-action">
            <label for="my_modal_6" class="btn btn-soft btn-error"><BsFillTelephoneXFill /></label>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Chat
