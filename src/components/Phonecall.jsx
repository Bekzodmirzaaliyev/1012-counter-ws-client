import React from "react";
import { ImPhoneHangUp, ImPhone } from "react-icons/im";
import { useSelector } from "react-redux";
import { toast } from 'react-toastify';

const Phonecall = ({ selectedUser, isOpen, onClose }) => {
  const user = useSelector(state => state?.auth?.user?.user);

  if (!isOpen) return null;

  return (
    <dialog id="phone_call_modal" className="modal modal-open">
      <div className="modal-box bg-gray-900 text-white p-6 relative rounded-xl shadow-lg flex flex-col items-center">
        <img
          src={selectedUser?.profileImage || "https://via.placeholder.com/150"}
          alt="avatar"
          className="rounded-full size-24 border border-primary object-cover"
        />

        <p className="text-lg font-bold">{selectedUser?.username}</p>
        <p className="text-sm text-gray-500">{selectedUser?.grade}</p>

        <div className="flex gap-10 mt-6">
          <button
            onClick={() => {
              toast.info("Call Rejected");
              onClose(); 
            }}
            className="bg-red-600 hover:bg-red-700 transition p-4 rounded-full text-white"
          >
            <ImPhoneHangUp size={20} />
          </button>

          <button
            onClick={() => {
              toast.success("Call Accepted");
              onClose(); 
            }}
            className="bg-green-600 hover:bg-green-700 transition p-4 rounded-full text-white"
          >
            <ImPhone size={20} />
          </button>
        </div>
      </div>

      <form method="dialog" className="modal-backdrop bg-black/40 backdrop-blur-sm">
        <button onClick={onClose}>Close</button>
      </form>
    </dialog>
  );
};

export default Phonecall;
