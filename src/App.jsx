import { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import socket from './Socket.jsx'
import Sidebar from './components/Sidebar.jsx'
import DrawerUser from './components/DrawerUser.jsx'
import { toast } from 'react-toastify';
import { logout } from './redux/slices/authSlice.js'

function App() {
  const [onlineUsers, setOnlineUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState([])
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
    }
  
    const handleBanReceiver = (data) => {
      console.log("Ban_Result_reciever:", data)
      toast.error(data.message)
      dispatch(logout())
    }
  
    socket.on("admin_notification", handleAdminNotification)
    socket.on("BanResult", handleBanResult)
    socket.on("Ban_Result_reciever", handleBanReceiver)
  
    return () => {
      socket.off("admin_notification", handleAdminNotification)
      socket.off("BanResult", handleBanResult)
      socket.off("Ban_Result_reciever", handleBanReceiver)
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
    </div>
  )
}

export default App
