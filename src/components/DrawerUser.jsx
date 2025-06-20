import React from "react";
import { ImCross } from "react-icons/im";
import socket from "../Socket";
import { useSelector } from "react-redux";

const DrawerUser = ({ selectedUser, isOpen, onClose }) => {
  const user = useSelector(state => state?.auth?.user?.user)
  console.log("USER: " , user)

  const makeAdmin = async({ userID, selectedUser, role }) => {
    console.log("DEBUG MAKEADMIN: ", {userID, selectedUser, role})
    socket.emit("setAdmin", {userID, selectedUser, role})
  }

  return (
    <div className={`drawer drawer-end ${isOpen ? "drawer-open" : ""}`}>
      <input id="user-drawer" type="checkbox" className="drawer-toggle" checked={isOpen} onChange={onClose} />
      
      <div className="drawer-side z-50">
        {/* Qora fonli overlay - bg yo‘q qilish shart emas */}
        <label htmlFor="user-drawer" className="drawer-overlay" onClick={onClose}></label>
        
        {/* Faqat shu qismga bg beramiz */}
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
          </div>

          <div className="text-center py-2">Админ Панель</div>

          <div className="mt-5 border-y py-2 space-y-2 flex justify-center flex-col rounded-xl p-4 shadow-xl border-primary">
              <button className="btn btn-soft btn-primary btn-sm" onClick={() => makeAdmin({userID: user._id, selectedUser: selectedUser._id, role: "admin"})}>Назначить Админстратором</button>
              <button className="btn btn-soft btn-primary btn-sm" onClick={() => makeAdmin({userID: user._id, selectedUser: selectedUser._id, role: "moderator"})}>Назначить Модератор</button>
              <button className="btn btn-soft btn-primary btn-sm" onClick={() => makeAdmin({userID: user._id, selectedUser: selectedUser._id, role: "user"})}>Понизить до Пользователя</button>
          </div>

           <div className="mt-5 border-y py-2 space-y-2 flex justify-center flex-col rounded-xl p-4 shadow-xl border-error">
              <button className="btn btn-soft btn-error btn-sm">Заблокировать</button>
              <button className="btn btn-soft btn-error btn-sm">Предупреждение</button>
              <button className="btn btn-soft btn-error btn-sm">Заглушить</button>
              <button className="btn btn-soft btn-error btn-sm">Выгнать из сайта</button>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default DrawerUser;
