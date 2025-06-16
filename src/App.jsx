import { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import './App.css'
import socket from './Socket.jsx'
// const socket = io('http://localhost:8000') // Убедись, что порт совпадает
import { TiThList } from "react-icons/ti";
import { MdEdit, MdGroups } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import { IoArchive, IoExit } from "react-icons/io5";
import { RxExit } from "react-icons/rx";
import { ImCross } from "react-icons/im";
import { logout } from './redux/slices/authSlice.js'


function App() {
  const [onlineUsers, setOnlineUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState([])
  const user = useSelector(state => state.auth?.user?.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const handleLogout = () => {
    dispatch(logout())
    
  }


  useEffect(() => {
    console.log("USER:", user)
    if (!user) return

    socket.emit("connected", user)

    socket.on("users", (users) => {
      console.log("🔥 Online Users: ", users)
      setOnlineUsers(users)
      setLoading(false)
    })

    return () => {
      socket.off("users")
    }
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

  const selectUser = (user) => {
    console.log("TANLANGAN USER: ", user)
    // dispatch(setSelect(user))
    navigate(`/chat/${user._id}`)
  }
console.log("USERS: ", users);

  useEffect(() => {
    getAllUsers()
  }, [])
  return (
    <div className='flex'>
      {/* Левая панель */}
      <div className='w-3/12 h-screen bg-base-300 border-r flex flex-col'>
        <div className='flex-1 flex flex-col gap-2'>
          <div className='flex flex-1 w-full py-1 h-full px-3 gap-1'>
            <div className="drawer w-1/5">
              <input id="my-drawer" type="checkbox" className="drawer-toggle" />
              <div className="drawer-content">
                {/* Page content here */}
                <label htmlFor="my-drawer" className="btn btn-primary drawer-button">
                  <TiThList />
                </label>
              </div>
              <div className="drawer-side">
                <label htmlFor="my-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
                <div className="menu bg-base-200 text-base-content min-h-full w-80 p-4 flex-col">
                  <div className='flex-1'>
                    <div className='flex items-center justify-between'>
                      <p className='font-semibold'>Мой профиль</p>
                      <div className='flex gap-2 items-center'>
                        <button className='btn btn-info btn-xs'>
                          <MdEdit />
                        </button>
                        <button className='btn btn-ghost'>
                          <ImCross />
                        </button>
                      </div>
                    </div>
                    <div className='flex items-center gap-5'>
                      <figure>
                        <img src={user?.profileImage} className='rounded-full bg-base-300 size-16 border border-primary' alt="" />
                      </figure>

                      <div>
                        <p>{user?.username}</p>
                        <p>В сети</p>
                      </div>
                    </div>
                    <div className='flex-1 py-5 mt-5   flex flex-col gap-2'>
                      <div className='flex items-center justify-between' >
                        <p>email:</p>
                        <p>{user?.email}</p>
                      </div>
                       <div className='flex items-center justify-between' >
                        <p>grade:</p>
                        <p>{user?.grade}</p>
                      </div>
                      <div className='flex items-center justify-between' >
                        <p>ID:</p>
                        <p>{user?._id}</p>
                      </div>
                    </div>
                  </div>

                  <div className='flex-1 flex items-end'>
                    <button onClick={handleLogout} className='btn btn-error btn-soft w-full'>
                      <span >Выйти из аккаунта</span>
                      <span>
                        <RxExit />
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <label className="input flex-1">
              <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <g
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  strokeWidth="2.5"
                  fill="none"
                  stroke="currentColor"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.3-4.3"></path>
                </g>
              </svg>
              <input type="search" className="grow flex-1" placeholder="Search" />
            </label>
          </div>
          <div className='px-3'>
            <div role="tablist" className="tabs tabs-lift">
              <a role="tab" className="tab tab-active">
                <FaUser />
              </a>
              <a role="tab" className="tab text-xl ">
                <MdGroups />
              </a>
              <a role="tab" className="tab text-xl">
                <IoArchive />
              </a>
            </div>
          </div>
        </div>

        <div className='flex-1 bg-base-200 py-5 h-[87.5%]'>
          {loading ? (
            <div className='h-full w-full flex justify-center items-center'>
              <span className="loading loading-bars loading-xl"></span>
            </div>
          ) : (
            <div className='h-full w-full overflow-y-auto p-2 flex flex-col gap-5'>
              {onlineUsers.length > 0 ? (
                onlineUsers.map((item, index) => (
                  <div key={index} className='flex items-center gap-5 p-2 bg-base-100 rounded-xl cursor-pointer shadow' onClick={() => selectUser(item)}>
                    <img
                      src={item.profileImage || "https://via.placeholder.com/64"}
                      className='size-16 rounded-full object-cover'
                      alt="profile"
                    />
                    <div className='flex flex-col gap-1'>
                      <span className='font-bold text-lg'>{item.username.length > 24 ? item.username.slice(0, 24) + "..." : item.username}</span>
                      <span className={`text-xs font-bold ${item.status ? 'text-success' : 'text-error'}`}>{item.status ? "В сети" : "Не в сети"}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className='text-center text-sm text-gray-400'>No online users</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Правая часть — контент по маршрутам */}
      <div className='w-9/12 h-screen overflow-y-auto'>
        <Outlet />
      </div>
    </div>
  )
}

export default App
