import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import { TiThList } from 'react-icons/ti';
import { MdEdit, MdGroups } from 'react-icons/md';
import { FaUser } from 'react-icons/fa';
import { IoArchive } from 'react-icons/io5';
import { RxExit } from 'react-icons/rx';
import { ImCross } from 'react-icons/im';
import socket from '../Socket';
import { toast } from "react-toastify";

const Sidebar = ({ loading, selectUser }) => {
  const user = useSelector(state => state.auth?.user?.user);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [searchUser, setSearchUser] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleDeleteUser = (targetUser) => {
    const confirmDelete = window.confirm(`${targetUser.username} ni rostdan ham o‘chirmoqchimisiz?`);
    if (!confirmDelete) return;

    socket.emit("delete_user", {
      userID: user._id,
      selectedUser: targetUser._id,
    });
  };

  // 🔍 Faqat online foydalanuvchilarni filter qiladi
  const filteredUsers = onlineUsers.filter((u) =>
    u.username.toLowerCase().includes(searchUser.toLowerCase())
  );

  const handleCloseDrawer = () => {
    const drawerToggle = document.getElementById('my-drawer');
    if (drawerToggle) {
      drawerToggle.checked = false;
    }
  };

  useEffect(() => {
    socket.on("deleted_notice", (data) => {
      toast.error(data.message);
      dispatch(logout());
      navigate("/login");
    });

    socket.on("admin_notification", (data) => {
      data.success ? toast.success(data.message) : toast.error(data.message);
    });

    return () => {
      socket.off("deleted_notice");
      socket.off("admin_notification");
    };
  }, [dispatch, navigate]);

  useEffect(() => {
    socket.on('users', (updatedUsers) => {
      setOnlineUsers(updatedUsers);
    });

    return () => {
      socket.off('users');
    };
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'users':
        return (
          <div className='h-full w-full overflow-y-auto p-2 flex flex-col gap-5'>
            {onlineUsers?.length > 0 ? (
              onlineUsers.map((item, index) => (
                <div key={index} className={`${item?.role === "owner" ? "shadow-md shadow-error" : item.role === "admin" ? "shadow-md shadow-info" : item?.role === "moderator" ? "shadow-success shadow-md" : item.role === "vip" ? "shadow-md shadow-warning": ""} flex items-center justify-between gap-5 p-2 bg-base-100 rounded-xl cursor-pointer shadow`} onClick={() => selectUser(item)}>
                  <div className='flex items-center gap-5'>
                    <img src={item.profileImage || "https://via.placeholder.com/64"} className='size-16 rounded-full object-cover' alt="profile" />
                    <div className='flex flex-col gap-1'>
                      <span className='font-bold text-lg'>{item.username.length > 24 ? item.username.slice(0, 24) + "..." : item.username}</span>
                      <span className={`text-xs font-bold ${item.status ? 'text-success' : 'text-error'}`}>{item.status ? "В сети" : "Не в сети"}</span>
                    </div>
                  </div>
                  <div className='text-sm capitalize '>
                    {item?.role === "owner" && <p className='text-shadow-md text-error text-shadow-error/80'>{item?.role}</p>}
                    {item?.role === "admin" && <p className='text-shadow-md text-info text-shadow-info/80'>{item?.role}</p>}
                    {item?.role === "moderator" && <p className='text-shadow-md text-success text-shadow-success/80'>{item?.role}</p>}
                    {item?.role === "vip" && <p className='text-shadow-md text-warning text-shadow-warning/80'>{item?.role}</p>}
                  </div>
                </div>
              ))
            ) : (
              <div className='text-center text-sm text-gray-400'>No online users</div>
            )}
          </div>
        )
      case 'groups':
        return (
          <div className='h-full w-full overflow-y-auto p-2 flex flex-col gap-5'>
            {/* Groups content here */}
            <div className='text-center text-sm text-gray-400'>Groups will appear here</div>
          </div>
        )
      case 'archive':
        return (
          <div className='h-full w-full overflow-y-auto p-2 flex flex-col gap-5'>
            {/* Archive content here */}
            <div className='text-center text-sm text-gray-400'>Archived chats will appear here</div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className='w-3/12 h-screen bg-base-300 border-r flex flex-col'>
      <div className='flex flex-col gap-2'>
        <div className='flex w-full py-1 px-3 gap-1'>
          <div className='drawer w-1/5'>
            <input id='my-drawer' type='checkbox' className='drawer-toggle' />
            <div className='drawer-content'>
              <label htmlFor='my-drawer' className='btn btn-primary drawer-button'>
                <TiThList />
              </label>
            </div>
            <div className='drawer-side'>
              <label htmlFor='my-drawer' className='drawer-overlay'></label>
              <div className='menu bg-base-200 text-base-content min-h-full w-80 p-4 flex flex-col'>
                <div className='flex-1'>
                  <div className='flex items-center justify-between'>
                    <p className='font-semibold'>Мой профиль</p>
                    <div className='flex gap-2 items-center'>
                      <button className="btn" onClick={() => document.getElementById('my_modal_1').showModal()}>
                        <MdEdit />
                      </button>
                      <dialog id="my_modal_1" className="modal">
                        <div className="modal-box">
                          <h3 className="text-lg font-bold">Hello!</h3>
                          <p className="py-4">Press ESC key or click the button below to close</p>
                          <div className="modal-action">
                            <form method="dialog">
                              <button className="btn">Close</button>
                            </form>
                          </div>
                        </div>
                      </dialog>

                      <button className='btn btn-ghost' onClick={handleCloseDrawer}>
                        <ImCross />
                      </button>
                    </div>
                  </div>
                  <div className='flex items-center gap-5'>
                    <figure>
                      <img
                        src={user?.profileImage}
                        className='rounded-full bg-base-300 size-16 border border-primary'
                        alt='profile'
                      />
                    </figure>
                    <div>
                      <p className='font-semibold'>{user?.username}</p>
                      <p className='text-success font-semibold'>В сети</p>
                    </div>
                  </div>
                  <div className='flex-1 py-5 mt-5 flex flex-col gap-2'>
                    <div className='flex items-center justify-between'>
                      <p className='font-semibold'>email:</p>
                      <p>{user?.email}</p>
                    </div>
                    <div className='flex items-center justify-between'>
                      <p className='font-semibold'>grade:</p>
                      <p>{user?.grade}</p>
                    </div>
                    <div className='flex items-center justify-between'>
                      <p className='font-semibold'>ID:</p>
                      <p>{user?._id}</p>
                    </div>
                  </div>
                </div>
                <div className='flex-1 flex items-end'>
                  <button onClick={handleLogout} className='btn btn-error btn-soft w-full'>
                    <span>Выйти из аккаунта</span>
                    <span>
                      <RxExit />
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <label className='input flex-1'>
            <svg className='h-[1em] opacity-50' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'>
              <g strokeLinejoin='round' strokeLinecap='round' strokeWidth='2.5' fill='none' stroke='currentColor'>
                <circle cx='11' cy='11' r='8'></circle>
                <path d='m21 21-4.3-4.3'></path>
              </g>
            </svg>
            <input
              type='search'
              onChange={(e) => setSearchUser(e.target.value)}
              className='grow flex-1'
              placeholder='Search'
            />
          </label>
        </div>

        <div className='px-3'>
          <div role='tablist' className='tabs tabs-lift'>
            <a role='tab' className='tab tab-active'>
              <FaUser />
            </a>
            <a role='tab' className='tab text-xl'>
              <MdGroups />
            </a>
            <a role='tab' className='tab text-xl'>
              <IoArchive />
            </a>
          </div>
        </div>
      </div>

      <div className='flex-1 bg-base-200 py-5 h-[87.5%]'>
        {loading ? (
          <div className='h-full w-full flex justify-center items-center'>
            <span className='loading loading-bars loading-xl'></span>
          </div>
        ) : (
          <div className='h-full w-full overflow-y-auto p-2 flex flex-col gap-5'>
            {filteredUsers?.length > 0 ? (
              filteredUsers.map((item, index) => (
                <div
                  key={index}
                  className={`${item?.role === 'owner'
                    ? 'shadow-md shadow-error'
                    : item.role === 'admin'
                      ? 'shadow-md shadow-info'
                      : item?.role === 'moderator'
                        ? 'shadow-success shadow-md'
                        : item.role === 'vip'
                          ? 'shadow-md shadow-warning'
                          : ''
                    } flex items-center justify-between gap-5 p-2 bg-base-100 rounded-xl cursor-pointer shadow`}
                  onClick={() => selectUser(item)}
                >
                  <div className='flex items-center gap-5'>
                    <img
                      src={item.profileImage || 'https://via.placeholder.com/64'}
                      className='size-16 rounded-full object-cover'
                      alt='profile'
                    />
                    <div className='flex flex-col gap-1'>
                      <span className='font-bold text-lg'>
                        {item.username.length > 24 ? item.username.slice(0, 24) + '...' : item.username}
                      </span>
                      <span className={`text-xs font-bold ${item.status ? 'text-success' : 'text-error'}`}>
                        {item.status ? 'В сети' : 'Не в сети'}
                      </span>
                    </div>
                  </div>
                  <div className='text-sm capitalize flex items-center gap-2'>
                    {["owner", "admin", "moderator", "vip"].includes(item?.role) && (
                      <p className={`text-shadow-md ${{
                        owner: 'text-error',
                        admin: 'text-info',
                        moderator: 'text-success',
                        vip: 'text-warning',
                      }[item.role]}`}>{item?.role}</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className='text-center text-sm text-gray-400'>No matching users</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
