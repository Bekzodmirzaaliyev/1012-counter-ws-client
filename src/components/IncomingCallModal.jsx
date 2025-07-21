import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearIncomingCall } from "../redux/slices/callSlice";
import socket from "../Socket";

const IncomingCallModal = ({ onAccept }) => {
  const dispatch = useDispatch();
  const incomingCall = useSelector((state) => state.call.incomingCall);

  const handleReject = () => {
    socket.emit("reject_call", { to: incomingCall.socketId });
    dispatch(clearIncomingCall());
  };

  const handleAccept = () => {
    onAccept(incomingCall); // Parentda call logic ishlaydi
    dispatch(clearIncomingCall());
  };

  if (!incomingCall) return null;

  return (
    <dialog id="incoming_modal" className="modal modal-open">
      <div className="modal-box text-center">
        <h3 className="text-lg font-bold">Qo‘ng‘iroq kelmoqda</h3>
        <p className="py-2">{incomingCall?.from?.username}</p>
        <div className="modal-action justify-center gap-4">
          <button className="btn btn-success" onClick={handleAccept}>Qabul qilish</button>
          <button className="btn btn-error" onClick={handleReject}>Rad etish</button>
        </div>
      </div>
    </dialog>
  );
};

export default IncomingCallModal;
