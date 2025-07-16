import { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import socket from './Socket.jsx'
import Sidebar from './components/Sidebar.jsx'
import DrawerUser from './components/DrawerUser.jsx'
import { toast } from 'react-toastify';
import { logout } from './redux/slices/authSlice.js'
import { IoCall } from "react-icons/io5";
import { SlCallOut } from "react-icons/sl";
import { VscCallIncoming } from "react-icons/vsc";

function App() {
  const [onlineUsers, setOnlineUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState([])
  const [status, setStatus] = useState("Вам вызов...")
  const [selectedUser, setSelectedUser] = useState(null) // ✅ Drawer uchun user
  const [isDrawerOpen, setIsDrawerOpen] = useState(false) // ✅ Drawer ochiqmi yo‘qmi
  const user = useSelector(state => state.auth?.user?.user)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  useEffect(() => {
    if (!user) return
    socket.emit("connected", user)


  }, [user])

  const getAllUsers = async () => {
    try {
      const request = await fetch('https://one012-counter-ws-server.onrender.com/api/v1/auth/getAllUsers')
      const response = await request.json()
      setUsers(response)
    } catch (e) {
      console.log(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getAllUsers()
  }, [])

  const selectUser = (user) => {
    navigate(`/chat/${user._id}`)
  }

  useEffect(() => {
    const handleAdminNotification = (data) => {
      console.log("admin_notification:", data)
      toast.error(data.message)
    }
  
    const handleBanResult = (data) => {
      console.log("BanResult:", data)
      toast.error(data.message)
    })
    socket.on("Ban_Result_reciever", (data) => {
      console.log("ban-result", data)
      toast.error(data.message)
      dispatch(logout())
    }
  
    const handleKickReceiver = ({ message }) => {
      console.log("Kicked out by admin:", message);
      toast.error(message || "You have been kicked out.");
      dispatch(logout());
      setTimeout(() => {
        window.location.href = "about:blank";
      }, 1000);
    }
  
    socket.on("admin_notification", handleAdminNotification)
    socket.on("BanResult", handleBanResult)
    socket.on("Ban_Result_reciever", handleBanReceiver)
    socket.on("Kick_Result_reciever", handleKickReceiver)
  
    return () => {
      socket.off("admin_notification", handleAdminNotification)
      socket.off("BanResult", handleBanResult)
      socket.off("Ban_Result_reciever", handleBanReceiver)
      socket.off("Kick_Result_reciever", handleKickReceiver)
    }
  }, [dispatch])
  
  

  return (
    <div className='flex'>
      <Sidebar
        onlineUsers={onlineUsers}
        loading={loading}
        selectUser={selectUser}
        setOnlineUsers={setOnlineUsers}
      />
      <div className='w-9/12 h-screen overflow-y-auto'>
        {/* 🧠 Drawer control proplarini Outlet'ga yuborish */}
        <Outlet
          context={{
            setIsDrawerOpen,
            setSelectedUser,
            selectedUser,
            isDrawerOpen
          }}
        />
      </div>
      <div>
        <DrawerUser
          selectedUser={selectedUser}
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
        />
      </div>
      <div>  {/* Open the modal using document.getElementById('ID').showModal() method */}
        <button className="btn btn-soft btn-success" onClick={() => document.getElementById('my_modal_6').showModal()}><IoCall /></button>
        <dialog id="my_modal_6" className="modal modal-bottom sm:modal-middle">
          <div className="modal-box bg-accent/40 min-w-[65%] min-h-[70vh]">
            <div className='flex flex-col items-center justify-center h-full w-full'>
              <div className='flex flex-col items-center gap-5 w-full h-full'>
                <figure> <img src={selectedUser?.profileImage || "https://via.placeholder.com/64"} className='size-24 bg-base-300 rounded-full' alt="" /></figure>
                <div className='flex flex-col items-center gap-1'>
                  <p className='text-xl font-semibold'>{selectedUser?.username || "Username"}</p>
                  <p className='text-sm'>{status}</p>
                </div>
              </div>
              <div className="modal-action">
                <form method="dialog" className='flex gap-5'>
                  {/* if there is a button in form, it will close the modal */}
                  <button className="btn btn-soft btn-success text-2xl"><SlCallOut />
                  </button>
                  <button className="btn btn-soft btn-error text-2xl"><VscCallIncoming />
                  </button>
                </form>
              </div>

            </div>

          </div>
        </dialog>
      </div>
    </div>
  )
}

export default App
