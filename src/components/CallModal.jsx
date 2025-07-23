import React, { useEffect, useState } from 'react';
import { IoCall } from "react-icons/io5";
import { MdCallEnd } from "react-icons/md";
import { useSelector } from 'react-redux';
import socket from "../Socket";

const CallModal = ({ selectedUser }) => {
    const [status, setStatus] = useState("Входящий вызов...");
    const userinfo = useSelector((state) => state.auth.user);

    const handleAcceptCall = () => {
        socket.emit("accept_call", {
            from: userinfo?._id,
            to: selectedUser?._id
        });
        setStatus("Звонок принят");
    };

    const handleEndCall = () => {
        socket.emit("end_call", {
            from: userinfo?._id,
            to: selectedUser?._id
        });
        setStatus("Звонок завершён");
        document.getElementById("my_modal_5")?.close();
    };

    useEffect(() => {
        socket.on("call_accepted", ({ from }) => {
            setStatus("Пользователь принял вызов");
        });

        socket.on("call_ended", ({ from }) => {
            setStatus("Пользователь завершил звонок");
            document.getElementById("my_modal_5")?.close();
        });

        return () => {
            socket.off("call_accepted");
            socket.off("call_ended");
        };
    }, []);

    return (
        <dialog id="my_modal_5" className="modal modal-bottom sm:modal-middle">
            <div className="modal-box">
                <div className='flex flex-col items-center justify-center'>
                    <div className='flex flex-col items-center gap-5'>
                        <figure>
                            <img src={selectedUser?.profileImage || "https://via.placeholder.com/64"} className='size-24 bg-base-300 rounded-full' alt="" />
                        </figure>
                        <div className='flex flex-col items-center gap-1'>
                            <p className='text-xl font-semibold'>{selectedUser?.username}</p>
                            <p className='text-sm'>{status}</p>
                        </div>
                    </div>
                    <div className="modal-action flex gap-4">
                        <button
                            className="btn btn-success text-2xl"
                            onClick={handleAcceptCall}
                        >
                            <IoCall />
                        </button>
                        <button
                            className="btn btn-error text-2xl"
                            onClick={handleEndCall}
                        >
                            <MdCallEnd />
                        </button>
                    </div>
                </div>
            </div>
        </dialog>
    );
};

export default CallModal;
