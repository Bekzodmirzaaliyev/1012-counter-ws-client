import React from "react";
import { ImCross } from "react-icons/im";

const DrawerUser = ({ selectedUser, isOpen, onClose }) => {
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
              src={selectedUser?.avatar || "https://via.placeholder.com/150"}
              alt="avatar"
              className="rounded-full size-24 border border-primary"
            />
            <p className="text-lg font-bold">{selectedUser?.username}</p>
            <p className="text-sm text-gray-500">{selectedUser?.grade}</p>
          </div>

          <div className="mt-5 space-y-2">
            <p><span className="font-semibold">Email:</span> {selectedUser?.email || "-"}</p>
            <p><span className="font-semibold">ID:</span> {selectedUser?._id || "-"}</p>
          </div>

          
        </div>
      </div>
    </div>
  );
};

export default DrawerUser;
