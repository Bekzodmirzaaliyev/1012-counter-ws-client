import React from "react";
import { ImCross } from "react-icons/im";
import socket from "../Socket";
import { useSelector } from "react-redux";
import { toast } from 'react-toastify';

const DrawerUser = ({ selectedUser, isOpen, onClose }) => {
  const user = useSelector(state => state?.auth?.user?.user)
  console.log("USER: ", user)

  const makeAdmin = async ({ userID, selectedUser, role }) => {
    console.log("DEBUG MAKEADMIN: ", { userID, selectedUser, role })
    socket.emit("setAdmin", { userID, selectedUser, role })
  }

  const makeModerator = async ({ userID, selectedUser, role }) => {
    console.log("DEBUG MAKEADMIN: ", { userID, selectedUser, role })
    socket.emit("setAdmin", { userID, selectedUser, role })
  }

  const makeVIP = async ({ userID, selectedUser, role }) => {
    console.log("DEBUG MAKEADMIN: ", { userID, selectedUser, role })
    socket.emit("setAdmin", { userID, selectedUser, role })
  }

  const makeUser = async ({ userID, selectedUser, role }) => {
    console.log("DEBUG MAKEADMIN: ", { userID, selectedUser, role })
    socket.emit("setAdmin", { userID, selectedUser, role })
  }

  const handleBan = async ({ userID, selectedUser, reason }) => {
    try {
      socket.emit("ban", { userID, selectedUser, reason })
    } catch (e) {
      toast.error("F Socket: ", e)
    }
  }

  const handleUnBan = async ({ userID, selectedUser }) => {
    try {
      socket.emit("unban", { userID, selectedUser })
    } catch (e) {
      toast.error("F Socket: ", e)
    }
  }


    const handleMute = async ({ userID, selectedUser }) => {
    try {
      socket.emit("mute", { userID, selectedUser })
    } catch (e) {
      toast.error("F Socket: ", e)
    }
  }
  
  const handleWarn = async ({ userID, selectedUser, reason}) => {
    try {
      socket.emit("warn", { userID, selectedUser, reason})
    } catch (e) {
      toast.error("F Socket: ", e)
    }
  }
  
  const handleKickout = async ({ userID, selectedUser }) => {
    try {
      socket.emit("kickout", { userID, selectedUser })
    } catch (e) {
      toast.error("F Socket: ", e)
    }
  }
  


  return (
    <div className={`drawer drawer-end ${isOpen ? "drawer-open" : ""}`}>
      <input id="user-drawer" type="checkbox" className="drawer-toggle" checked={isOpen} onChange={onClose} />

      <div className="drawer-side z-50">
        {/* Qora fonli overlay - bg yo‘q qilish shart emas */}
        <label htmlFor="user-drawer" className="drawer-overlay" onClick={onClose}></label>
        <div className="menu p-4 w-96 min-h-full bg-base-200 text-base-content flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Foydalanuvchi Profili</h2>
            <button className="btn btn-ghost btn-sm" onClick={onClose}>
              <ImCross />
            </button>
          </div>

          <div className="flex flex-col items-center gap-3">
            <img
              src={selectedUser?.profileImage || "https://via.placeholder.com/150"}
              alt="avatar"
              className="rounded-full size-24 border border-primary object-cover"
            />
            <p className="text-lg font-bold">{selectedUser?.username}</p>
            <p className="text-sm text-gray-500">{selectedUser?.grade}</p>
          </div>

          <div className="mt-5 space-y-2">
            <p><span className="font-semibold">Email:</span> {selectedUser?.email || "-"}</p>
            <p><span className="font-semibold">ID:</span> {selectedUser?._id || "-"}</p>
            <p><span className="font-semibold">Role: </span> {selectedUser?.role || "-"}</p>
          </div>
          {
            user?.role === "admin" || user?.role === "owner" || user?.role === "moderator" ? (
              <>
                <div className="text-center py-2">Админ Панель</div>
                <div className="mt-5 border-y py-2 space-y-2 flex justify-center flex-wrap gap-1 rounded-xl p-4 shadow-xl border-primary">
                  <button className="btn btn-soft btn-primary btn-xs flex-1 text-nowrap" onClick={() => makeAdmin({ userID: user._id, selectedUser: selectedUser._id, role: "admin" })}>Назначить Админстратором</button>
                  <button className="btn btn-soft btn-primary btn-xs flex-1 text-nowrap" onClick={() => makeModerator({ userID: user._id, selectedUser: selectedUser._id, role: "moderator" })}>Назначить Модератор</button>
                  <button className="btn btn-soft btn-primary btn-xs flex-1 text-nowrap" onClick={() => makeVIP({ userID: user._id, selectedUser: selectedUser._id, role: "vip" })}>Назначить VIP</button>
                  <button className="btn btn-soft btn-primary btn-xs flex-1 text-nowrap" onClick={() => makeUser({ userID: user._id, selectedUser: selectedUser._id, role: "user" })}>Понизить до Пользователя</button>
                </div>

                <div className="mt-5 border-y py-2 space-y-2 flex justify-center flex-wrap gap-2 rounded-xl p-4 shadow-xl border-error">
                  <button className="btn btn-soft btn-error btn-xs flex-1 text-nowrap" onClick={() => handleBan({ userID: user._id, selectedUser: selectedUser._id, reason: "Abdulahm" })}>Заблокировать</button>
                  <button className="btn btn-soft btn-error btn-xs flex-1 text-nowrap" onClick={() => handleWarn({ userID: user._id, selectedUser: selectedUser._id, reason: "Abdulahm" })}>Предупреждение</button>
                  <button className="btn btn-soft btn-error btn-xs flex-1 text-nowrap" onClick={() => handleMute({ userID: user._id, selectedUser: selectedUser._id })}>Заглушить</button>
                  <button className="btn btn-soft btn-error btn-xs flex-1 text-nowrap" onClick={() => handleKickout({ userID: user._id, selectedUser: selectedUser._id, reason: "Abdulahm" })}>Выгнать из сайта</button>
                </div>
                <div className="mt-5 border-y py-2 space-y-2 flex justify-center flex-wrap gap-2 rounded-xl p-4 shadow-xl border-success">
                  <button className="btn btn-soft btn-success btn-xs flex-1 text-nowrap" onClick={() => handleUnBan({ userID: user._id, selectedUser: selectedUser._id })}>Разблокировать</button>
                </div>

              </>
            ) : null
          }


        </div>
        {/* Faqat shu qismga bg beramiz */}

      </div>
    </div>
  );
};

export default DrawerUser;
