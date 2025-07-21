import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { BsThreeDotsVertical } from "react-icons/bs"
import { PiTelegramLogo } from "react-icons/pi"
import socket from "../Socket.jsx"
import DrawerUser from "../components/DrawerUser"
import { IoCall } from "react-icons/io5"
import { MdCallEnd } from "react-icons/md"

const Chat = () => {
  const { user } = useParams()
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)
  const [inputValue, setInputValue] = useState("")
  const userinfo = useSelector(state => state?.auth?.user?.user)
  const [chat, setChat] = useState([])
  const [status, setStatus] = useState("Vyzov...")
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const localAudioRef = useRef(null)
  const remoteAudioRef = useRef(null)
  const peerConnectionRef = useRef(null)
  const localStreamRef = useRef(null)

  const getUser = async () => {
    try {
      const res = await fetch(`https://one012-counter-ws-server.onrender.com/api/v1/auth/getUser/${user}`)
      const data = await res.json()
      setSelectedUser(data)
    } catch (e) {
      console.log("User fetch error:", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    socket.on("incoming_call", async ({ from }) => {
      setStatus("Sizga qo‘ng‘iroq kelyapti...")
      document.getElementById('my_modal_5').showModal()

      await startMedia()

      const pc = createPeerConnection()
      peerConnectionRef.current = pc

      socket.emit("answer_call", { from: userinfo._id, to: from })
    })

    socket.on("call_accepted", async ({ from }) => {
      setStatus("Qo‘ng‘iroq qabul qilindi")
      const pc = createPeerConnection()
      peerConnectionRef.current = pc
    })

    socket.on("webrtc_offer", async ({ sdp }) => {
      await peerConnectionRef.current.setRemoteDescription(sdp)
      const answer = await peerConnectionRef.current.createAnswer()
      await peerConnectionRef.current.setLocalDescription(answer)
      socket.emit("webrtc_answer", { to: selectedUser._id, sdp: answer })
    })

    socket.on("webrtc_answer", async ({ sdp }) => {
      await peerConnectionRef.current.setRemoteDescription(sdp)
    })

    socket.on("webrtc_ice_candidate", ({ candidate }) => {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.addIceCandidate(candidate)
      }
    })

    socket.on("call_ended", () => {
      endCall()
    })

    return () => {
      socket.off("incoming_call")
      socket.off("call_accepted")
      socket.off("webrtc_offer")
      socket.off("webrtc_answer")
      socket.off("webrtc_ice_candidate")
      socket.off("call_ended")
    }
  }, [])

  useEffect(() => {
    getUser()
  }, [user])

  useEffect(() => {
    socket.on("receive_message", (data) => setChat(prev => [...prev, data]))
    return () => socket.off("receive_message")
  }, [])

  const getChat = async () => {
    try {
      const res = await fetch(`https://one012-counter-ws-server.onrender.com/api/v1/message/${userinfo._id}/${user}`)
      const data = await res.json()
      setChat(data)
    } catch (e) {
      console.log("Chat fetch error:", e)
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
      to: selectedUser._id
    }
    socket.emit("send_message", msg)
    setChat(prev => [...prev, msg])
    setInputValue("")
  }

  const typingHandler = (e) => {
    setInputValue(e.target.value)
    socket.emit("typing", { from: userinfo, to: selectedUser })
  }

  const startCall = async () => {
    document.getElementById('my_modal_5').showModal()
    setStatus("Qo‘ng‘iroq jo‘natildi")

    await startMedia()

    const pc = createPeerConnection()
    peerConnectionRef.current = pc

    socket.emit("call_user", { from: userinfo._id, to: selectedUser._id })
  }

  const startMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      localStreamRef.current = stream
      localAudioRef.current.srcObject = stream
    } catch (err) {
      console.error("Microphone permission required!", err)
    }
  }

  const createPeerConnection = () => {
    const pc = new RTCPeerConnection()
    localStreamRef.current?.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current))

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("webrtc_ice_candidate", {
          to: selectedUser._id,
          candidate: event.candidate
        })
      }
    }

    pc.ontrack = (event) => {
      remoteAudioRef.current.srcObject = event.streams[0]
    }

    return pc
  }

  const endCall = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
      peerConnectionRef.current = null
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop())
      localStreamRef.current = null
    }

    document.getElementById('my_modal_5').close()
    setStatus("Qo‘ng‘iroq tugatildi")

    socket.emit("end_call", {
      from: userinfo._id,
      to: selectedUser._id
    })
  }

  return (
    <div className='flex flex-col h-screen'>
      <DrawerUser selectedUser={selectedUser} isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
      <div className='w-full p-5 bg-base-300 flex items-center justify-between'>
        <div>
          <p className='font-bold text-lg'>{selectedUser?.username}</p>
          <p className='text-sm'>{selectedUser?.grade}</p>
        </div>
        <div className='flex items-center gap-3'>
          <button className="btn btn-soft btn-success" onClick={startCall}><IoCall /></button>
          <button onClick={() => setIsDrawerOpen(true)} className='btn btn-ghost'><BsThreeDotsVertical /></button>
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
          onKeyDown={(e) => e.key === "Enter" && sendMessage(e)}
          className='input input-bordered w-full'
        />
        <button className='btn btn-soft btn-primary' onClick={sendMessage}>
          <PiTelegramLogo />
        </button>
      </div>

      <dialog id="my_modal_5" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <div className='flex flex-col items-center justify-center'>
            <div className='flex flex-col items-center gap-5'>
              <figure><img src={selectedUser?.profileImage || "https://via.placeholder.com/64"} className='size-24 bg-base-300 rounded-full' alt="" /></figure>
              <div className='flex flex-col items-center gap-1'>
                <p className='text-xl font-semibold'>{selectedUser?.username}</p>
                <p className='text-sm'>{status}</p>
              </div>
              <audio ref={localAudioRef} autoPlay muted />
              <audio ref={remoteAudioRef} autoPlay />
            </div>
            <div className="modal-action">
              <form method="dialog">
                <button className="btn btn-soft btn-error text-2xl" onClick={endCall}>
                  <MdCallEnd />
                </button>
              </form>
            </div>
          </div>
        </div>
      </dialog>
    </div>
  )
}

export default Chat
