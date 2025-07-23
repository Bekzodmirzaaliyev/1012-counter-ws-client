import React from "react";
import { ImPhoneHangUp } from "react-icons/im";
import { useSelector } from "react-redux";
import { toast } from 'react-toastify';

const PhonecallOutgoing = ({ selectedUser, isOpen, onCancel }) => {
  const user = useSelector(state => state?.auth?.user?.user);

  if (!isOpen) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box bg-gray-900 text-white p-6 rounded-xl shadow-lg flex flex-col items-center">
        <img
          src={selectedUser?.profileImage || "https://via.placeholder.com/150"}
          alt="avatar"
          className="rounded-full size-24 border border-primary object-cover"
        />
        <p className="text-xl font-bold mt-2">{selectedUser?.username}</p>
        <p className="text-sm text-gray-400">Calling...</p>

        <div className="flex gap-4 mt-6">
          <button
            onClick={() => {
              toast.error("Call Cancelled");
              onCancel();
            }}
            className="bg-red-600 hover:bg-red-700 p-4 rounded-full"
          >
            <ImPhoneHangUp size={20} />
          </button>
        </div>
      </div>

      <form method="dialog" className="modal-backdrop bg-black/40 backdrop-blur-sm">
        <button onClick={onCancel}>Close</button>
      </form>
    </dialog>
  );
};

export default PhonecallOutgoing;
