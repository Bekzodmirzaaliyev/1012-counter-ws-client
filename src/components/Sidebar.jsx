import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../redux/slices/authSlice'
import { TiThList } from 'react-icons/ti'
import { MdEdit, MdGroups, MdSettings } from 'react-icons/md'
import { FaUser, FaSearch } from 'react-icons/fa'
import { IoArchive, IoNotifications } from 'react-icons/io5'
import { RxExit } from 'react-icons/rx'
import { ImCross } from 'react-icons/im'
import { HiDotsVertical } from 'react-icons/hi'
import socket from '../Socket'

const Sidebar = ({ loading, selectUser }) => {
  const user = useSelector(state => state.auth?.user?.user)
  const [onlineUsers, setOnlineUsers] = useState()
  const [activeTab, setActiveTab] = useState('chats')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [isDarkTheme, setIsDarkTheme] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = () => {
    dispatch(logout())
  }

  const toggleTheme = () => {
    const newTheme = !isDarkTheme
    setIsDarkTheme(newTheme)

    // Apply theme to document
    if (newTheme) {
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.setAttribute('data-theme', 'light')
    }

    // Save to localStorage for persistence
    localStorage.setItem('theme', newTheme ? 'dark' : 'light')
  }

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled)
    // You can add notification logic here
    console.log('Notifications:', !notificationsEnabled ? 'enabled' : 'disabled')
  }

  // Load saved theme on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      const isDark = savedTheme === 'dark'
      setIsDarkTheme(isDark)
      document.documentElement.setAttribute('data-theme', savedTheme)
    }
  }, [])

  // Filter users based on search query
  const filteredUsers = onlineUsers?.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  useEffect(() => {
    socket.on("users", (updatedUsers) => {
      console.log("updatedUsers", updatedUsers)
      setOnlineUsers(updatedUsers);
    });

    return () => {
      socket.off("users");
    };
  }, [])

  const getRoleBadge = (role) => {
    const roleConfig = {
      owner: { color: 'bg-gradient-to-r from-red-500 to-pink-500', text: 'text-white', label: 'Owner' },
      admin: { color: 'bg-gradient-to-r from-blue-500 to-indigo-500', text: 'text-white', label: 'Admin' },
      moderator: { color: 'bg-gradient-to-r from-green-500 to-emerald-500', text: 'text-white', label: 'Mod' },
      vip: { color: 'bg-gradient-to-r from-yellow-400 to-orange-500', text: 'text-white', label: 'VIP' }
    }
    return roleConfig[role] || null
  }

  return (
    <div className='w-80 h-screen bg-gradient-to-b from-base-100 to-base-200 border-r border-base-300 flex flex-col shadow-lg'>
      {/* Header Section */}
      <div className='flex flex-col gap-4 p-4 bg-base-100 border-b border-base-300'>
        {/* Top Bar */}
        <div className='flex items-center justify-between'>
          <div className="drawer">
            <input id="my-drawer" type="checkbox" className="drawer-toggle" />
            <div className="drawer-content">
              <label htmlFor="my-drawer" className="btn btn-ghost btn-sm hover:bg-primary/10">
                <TiThList className="text-lg" />
              </label>
            </div>
            <div className="drawer-side z-50">
              <label htmlFor="my-drawer" className="drawer-overlay"></label>
              <div className="menu bg-base-100 text-base-content min-h-full w-96 p-0 flex-col shadow-2xl">
                {/* Enhanced Header */}
                <div className='p-6 bg-gradient-to-r from-primary/5 to-secondary/5 border-b border-base-200'>
                  <div className='flex items-center justify-between mb-6'>
                    <h2 className='text-xl font-bold text-base-content flex items-center gap-2'>
                      <FaUser className="text-primary" />
                      Мой профиль
                    </h2>
                    <div className='flex gap-2 items-center'>
                      <button className='btn btn-primary btn-sm hover:scale-105 transition-transform'>
                        <MdEdit />
                      </button>
                      <label htmlFor="my-drawer" className='btn btn-ghost btn-sm hover:bg-error/10 cursor-pointer'>
                        <ImCross className="text-error" />
                      </label>
                    </div>
                  </div>

                  {/* Enhanced Profile Info */}
                  <div className='flex items-center gap-4 mb-6'>
                    <div className='relative'>
                      <div className="ring ring-primary ring-offset-base-100 ring-offset-2 rounded-full">
                        <img
                          src={user?.profileImage}
                          className='rounded-full bg-base-300 size-20 object-cover'
                          alt="profile"
                        />
                      </div>
                      <div className='absolute -bottom-1 -right-1 w-5 h-5 bg-success rounded-full border-3 border-base-100 animate-pulse'></div>
                    </div>
                    <div className="flex-1">
                      <h3 className='font-bold text-lg text-base-content mb-1'>{user?.username}</h3>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                        <p className='text-sm text-success font-semibold'>В сети</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Details Section */}
                <div className='flex-1 p-6'>
                  <div className='space-y-6'>
                    <div className="card bg-base-200 p-4">
                      <h4 className="font-semibold mb-3 text-base-content flex items-center gap-2">
                        <MdSettings className="text-primary" />
                        Информация об аккаунте
                      </h4>
                      <div className='space-y-3'>
                        <div className='flex items-start justify-between p-2 rounded bg-base-100'>
                          <span className='text-base-content/70 text-sm font-medium'>Email:</span>
                          <span className='text-base-content text-sm text-right max-w-48 break-words font-mono'>
                            {user?.email}
                          </span>
                        </div>

                        <div className='flex items-center justify-between p-2 rounded bg-base-100'>
                          <span className='text-base-content/70 text-sm font-medium'>Класс:</span>
                          <span className='badge badge-primary'>{user?.grade}</span>
                        </div>

                        <div className='flex items-start justify-between p-2 rounded bg-base-100'>
                          <span className='text-base-content/70 text-sm font-medium'>ID:</span>
                          <span className='text-base-content text-xs font-mono max-w-48 break-all bg-base-200 p-1 rounded'>
                            {user?._id}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="card bg-base-200 p-4">
                      <h4 className="font-semibold mb-3 text-base-content flex items-center gap-2">
                        <IoNotifications className="text-secondary" />
                        Настройки
                      </h4>
                      <div className="space-y-2">
                        <div className="form-control">
                          <label className="label cursor-pointer">
                            <span className="label-text">Уведомления</span>
                            <input
                              type="checkbox"
                              className="toggle toggle-primary"
                              checked={notificationsEnabled}
                              onChange={toggleNotifications}
                            />
                          </label>
                        </div>
                        <div className="form-control">
                          <label className="label cursor-pointer">
                            <span className="label-text">Темная тема</span>
                            <input
                              type="checkbox"
                              className="toggle toggle-secondary"
                              checked={isDarkTheme}
                              onChange={toggleTheme}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Logout Button */}
                <div className='p-6 border-t border-base-200 bg-base-50'>
                  <button
                    onClick={handleLogout}
                    className='btn btn-error w-full gap-2 hover:scale-[1.02] transition-all duration-200 shadow-lg'
                  >
                    <RxExit className="text-lg" />
                    <span className="font-semibold">Выйти из аккаунта</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <h1 className="text-lg font-bold text-base-content">Чаты</h1>

          <button className="btn btn-ghost btn-sm">
            <HiDotsVertical />
          </button>
        </div>

        {/* Enhanced Search Bar */}
        <div className={`relative transition-all duration-300 ${isSearchFocused ? 'scale-[1.02]' : ''}`}>
          <div className="relative">
            <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${isSearchFocused ? 'text-primary' : 'text-base-content/50'
              }`} />
            <input
              type="search"
              className="input input-bordered w-full pl-10 pr-4 bg-base-200 hover:bg-base-100 focus:bg-base-100 transition-all duration-200"
              placeholder="Поиск пользователей..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/50 hover:text-error transition-colors"
            >
              <ImCross className="text-xs" />
            </button>
          )}
        </div>

        {/* Enhanced Tabs */}
        <div role="tablist" className="tabs tabs-boxed bg-base-200 p-1 grid grid-cols-3 gap-1">
          <a
            role="tab"
            className={`tab text-xs transition-all duration-200 ${activeTab === 'chats'
                ? 'tab-active bg-primary text-primary-content shadow-md'
                : 'hover:bg-base-300'
              }`}
            onClick={() => setActiveTab('chats')}
          >
            <FaUser className="mr-1" /> Чаты
          </a>
          <a
            role="tab"
            className={`tab text-xs transition-all duration-200 ${activeTab === 'groups'
                ? 'tab-active bg-primary text-primary-content shadow-md'
                : 'hover:bg-base-300'
              }`}
            onClick={() => setActiveTab('groups')}
          >
            <MdGroups className="mr-1" /> Группы
          </a>
          <a
            role="tab"
            className={`tab text-xs transition-all duration-200 ${activeTab === 'archive'
                ? 'tab-active bg-primary text-primary-content shadow-md'
                : 'hover:bg-base-300'
              }`}
            onClick={() => setActiveTab('archive')}
          >
            <IoArchive className="mr-1" /> Архив
          </a>
        </div>
      </div>

      {/* Content Section */}
      <div className='flex-1 overflow-hidden'>
        {loading ? (
          <div className='h-full w-full flex flex-col justify-center items-center'>
            <span className="loading loading-infinity loading-lg text-primary"></span>
            <p className="text-sm text-base-content/60 mt-4">Загрузка пользователей...</p>
          </div>
        ) : (
          <div className='h-full w-full overflow-y-auto p-3'>
            {activeTab === 'chats' && (
              <div className="space-y-2">
                {filteredUsers?.length > 0 ? (
                  [...filteredUsers]
                    .sort((a, b) => b.status - a.status)
                    .map((item, index) => {
                      const roleBadge = getRoleBadge(item.role)
                      return (
                        <div
                          key={index}
                          className={`
                            group relative overflow-hidden rounded-xl bg-base-100 hover:bg-base-200 
                            cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-md
                            border border-transparent hover:border-primary/20
                            ${roleBadge ? 'border-l-4 border-l-primary' : ''}
                          `}
                          onClick={() => selectUser(item)}
                        >
                          <div className="flex items-center gap-4 p-4">
                            <div className='relative'>
                              <div className={`ring-2 ring-offset-2 ring-offset-base-100 rounded-full transition-all duration-300 ${item.status ? 'ring-success' : 'ring-error'
                                }`}>
                                <img
                                  src={item.profileImage || "https://via.placeholder.com/64"}
                                  className='size-12 rounded-full object-cover'
                                  alt="profile"
                                />
                              </div>
                              <div className={`
                                absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-base-100
                                ${item.status ? 'bg-success animate-pulse' : 'bg-error'}
                              `}></div>
                            </div>

                            <div className='flex-1 min-w-0'>
                              <div className='flex items-center gap-2 mb-1'>
                                <span className='font-semibold text-base truncate'>
                                  {item.username.length > 20 ? item.username.slice(0, 20) + "..." : item.username}
                                </span>
                                {roleBadge && (
                                  <span className={`
                                    px-2 py-1 text-xs font-bold rounded-full ${roleBadge.color} ${roleBadge.text}
                                    shadow-sm
                                  `}>
                                    {roleBadge.label}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${item.status ? 'bg-success' : 'bg-error'}`}></div>
                                <span className={`text-sm font-medium ${item.status ? 'text-success' : 'text-error'}`}>
                                  {item.status ? "В сети" : "Не в сети"}
                                </span>
                              </div>
                            </div>

                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <button className="btn btn-ghost btn-sm">
                                <HiDotsVertical />
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })
                ) : (
                  <div className='flex flex-col items-center justify-center h-64 text-center'>
                    <div className="text-6xl mb-4 opacity-30">🔍</div>
                    <h3 className="text-lg font-semibold text-base-content mb-2">
                      {searchQuery ? 'Пользователи не найдены' : 'Нет пользователей онлайн'}
                    </h3>
                    <p className='text-sm text-base-content/60 max-w-xs'>
                      {searchQuery
                        ? 'Попробуйте изменить поисковый запрос или проверьте правильность написания'
                        : 'Дождитесь подключения других пользователей'
                      }
                    </p>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="btn btn-primary btn-sm mt-4"
                      >
                        Очистить поиск
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'groups' && (
              <div className='flex flex-col items-center justify-center h-64 text-center'>
                <div className="text-6xl mb-4 opacity-30">👥</div>
                <h3 className="text-lg font-semibold text-base-content mb-2">Групповые чаты</h3>
                <p className='text-sm text-base-content/60 max-w-xs mb-4'>
                  Создавайте группы с друзьями и общайтесь вместе
                </p>
                <button className="btn btn-primary btn-sm" disabled>
                  Скоро будет доступно
                </button>
              </div>
            )}

            {activeTab === 'archive' && (
              <div className='flex flex-col items-center justify-center h-64 text-center'>
                <div className="text-6xl mb-4 opacity-30">📁</div>
                <h3 className="text-lg font-semibold text-base-content mb-2">Архивированные чаты</h3>
                <p className='text-sm text-base-content/60 max-w-xs mb-4'>
                  Здесь будут храниться ваши архивные сообщения
                </p>
                <button className="btn btn-secondary btn-sm" disabled>
                  В разработке
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Sidebar