import React, { use, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { BsThreeDotsVertical } from "react-icons/bs";
import { PiTelegramLogo } from "react-icons/pi";

const Chat = () => {
  const { user } = useParams()
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)
  const [inputValue,setInputValue] = useState("")

  const getUser = async () => {
    try {
      const request = await fetch(`https://one012-counter-ws-server.onrender.com/api/v1/auth/getUser/${user}`)
      const response = await request.json()
      console.log("respnose:", response)
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
      <div className='flex-1 h-[55%] overflow-y-auto'></div>
      <div className='w-full py-5 px-5 bg-base-300 flex'>
        <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} className='input input-bordered w-full' />
        <button className='btn btn-soft btn-primary'>
          <PiTelegramLogo />
        </button>
      </div>
    </div>
  )
}

export default Chat