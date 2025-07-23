import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { BsThreeDotsVertical } from "react-icons/bs";
import { PiTelegramLogo } from "react-icons/pi";
import socket from "../Socket.jsx";
import DrawerUser from "../components/DrawerUser";
import { IoCall } from "react-icons/io5";
import { MdCallEnd } from "react-icons/md";
import Phonecall from '../components/Phonecall.jsx';
import PhonecallOutgoing from '../components/PhonecallOutgoing.jsx';

const Chat = () => {
  const { user } = useParams();
  const [selectedUser, setSelectedUser] = useState(null);
  const [chat, setChat] = useState([]);
  const [status, setStatus] = useState("📞 Вызов...");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const userinfo = useSelector((state) => state?.auth?.user?.user);

  const localStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);

  const getUser = async () => {
    try {
      const res = await fetch(
        `http://localhost:8000/api/v1/auth/getUser/${user}`
      );
      const data = await res.json();
      setSelectedUser(data);
    } catch (e) {
      console.error("SERVER ERROR:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    getUser();
  }, [user]);

  useEffect(() => {
    const receiveMessage = (data) => {
      setChat((prev) => [...prev, data]);
    };
    socket.on("receive_message", receiveMessage);
    return () => socket.off("receive_message", receiveMessage);
  }, []);

  useEffect(() => {
    const getChat = async () => {
      try {
        const res = await fetch(
          `http://localhost:8000/api/v1/message/${userinfo._id}/${user}`
        );
        const data = await res.json();
        setChat(data);
      } catch (e) {
        console.error("SERVER ERROR:", e);
      }
    };
    getChat();
  }, [user]);

  // Message handlers
  const sendMessage = (e) => {
    e.preventDefault();
    const msg = {
      text: inputValue,
      from: userinfo._id,
      to: selectedUser._id,
    };
    socket.emit("send_message", msg);
    setChat((prev) => [...prev, msg]);
    setInputValue("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage(e);
  };

  const typingHandler = (e) => {
    setInputValue(e.target.value);
    socket.emit("typing", { from: userinfo, to: selectedUser });
  };

  // ------------------ ✅ Audio Call ------------------ //
  const handleCall = async () => {
    document.getElementById("my_modal_5").showModal();
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    localStreamRef.current.srcObject = stream;

    peerConnectionRef.current = new RTCPeerConnection();
    stream.getTracks().forEach((track) => {
      peerConnectionRef.current.addTrack(track, stream);
    });

    peerConnectionRef.current.ontrack = (event) => {
      const remoteAudio = new Audio();
      remoteAudio.srcObject = event.streams[0];
      remoteAudio.play();
    };

    const offer = await peerConnectionRef.current.createOffer();
    await peerConnectionRef.current.setLocalDescription(offer);

    socket.emit("call-user", {
      offer,
      to: selectedUser._id,
    });
  };

  useEffect(() => {
    socket.on("incoming-call", async ({ offer, from }) => {
      setStatus("📲 Входящий звонок...");
      document.getElementById("my_modal_5").showModal();

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current.srcObject = stream;

      peerConnectionRef.current = new RTCPeerConnection();
      stream.getTracks().forEach((track) => {
        peerConnectionRef.current.addTrack(track, stream);
      });

      peerConnectionRef.current.ontrack = (event) => {
        const remoteAudio = new Audio();
        remoteAudio.srcObject = event.streams[0];
        remoteAudio.play();
      };

      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(offer)
      );
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);

      socket.emit("answer-call", {
        answer,
        to: from,
      });
    });

    socket.on("call-answered", async ({ answer }) => {
      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
    });

    return () => {
      socket.off("incoming-call");
      socket.off("call-answered");
    };
  }, []);

  const endCall = () => {
    peerConnectionRef.current?.close();
    localStreamRef.current.srcObject
      ?.getTracks()
      .forEach((track) => track.stop());
    document.getElementById("my_modal_5").close();
  };
  // -------------------------------------------------- //

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  const formatTime = (sec) => `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;

  return (
    <div className="flex flex-col h-screen">
      <DrawerUser
        selectedUser={selectedUser}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />

      <div className="w-full p-5 bg-base-300 flex items-center justify-between">
        <div>
          {loading ? (
            <div className="flex flex-col gap-2">
              <div className="skeleton h-6 w-32 rounded-lg bg-gray-400/30 animate-pulse"></div>
              <div className="skeleton h-4 w-24 rounded-lg bg-gray-400/30 animate-pulse"></div>
            </div>
          ) : (
            <>
              <p className="font-bold text-lg">{selectedUser?.username}</p>
              <p className="text-sm">{selectedUser?.grade}</p>
            </>
          )}
        </div>
        <div>
          <button className="btn btn-soft btn-success" onClick={handleCall}>
            <IoCall />
          </button>
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="btn btn-ghost"
          >
            <BsThreeDotsVertical />
          </button>
        </div>
      </div>

      <div className="flex-1 h-[55%] px-4 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col gap-4 mt-4">
            <div className="chat chat-start">
              <div className="skeleton h-10 w-48 rounded-lg bg-gray-400/30 animate-pulse"></div>
            </div>
            <div className="chat chat-end">
              <div className="skeleton h-10 w-64 rounded-lg bg-gray-400/30 animate-pulse"></div>
            </div>
            <div className="chat chat-start">
              <div className="skeleton h-10 w-32 rounded-lg bg-gray-400/30 animate-pulse"></div>
            </div>
            <div className="chat chat-end">
              <div className="skeleton h-10 w-56 rounded-lg bg-gray-400/30 animate-pulse"></div>
            </div>
            <div className="chat chat-start">
              
              
            </div>
          </div>
        ) : (
          chat?.map((item, id) => (
            <div
              key={id}
              className={`chat flex flex-col w-full ${
                item.from === userinfo._id ? "chat-end" : "chat-start"
              }`}
            >
              <div
                className={`flex items-end gap-4 max-w-[65%] ${
                  item.from === userinfo._id ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <figure>
                  <img
                    src={
                      selectedUser?.profileImage ||
                      "https://via.placeholder.com/64"
                    }
                    className="size-10 bg-base-300 rounded-full"
                    alt=""
                  />
                </figure>
                <div
                  className={`chat-bubble flex-1 ${
                    item.from === userinfo._id
                      ? "chat-bubble-primary"
                      : "chat-bubble-secondary"
                  }`}
                >
                  <p className="break-words w-full">{item?.text}</p>
                  <p className="text-white/70 text-end text-xs">
                    {item?.timeStamp?.slice(11, 16)}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="w-full py-5 px-5 bg-base-300 flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={typingHandler}
          onKeyDown={handleKeyDown}
          className="input input-bordered w-full"
        />
        <button className="btn btn-soft btn-primary" onClick={sendMessage}>
          <PiTelegramLogo />
        </button>
      </div>

      {/* Calling Modal */}
      <dialog id="my_modal_5" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <div className="flex flex-col items-center justify-center gap-4">
            <audio
              ref={localStreamRef}
              autoPlay
              muted
              controls
              className="w-full"
            />
            <p className="text-lg font-semibold">{selectedUser?.username}</p>
            <p className="text-sm">{status}</p>
            <form method="dialog">
              <button
                className="btn btn-soft btn-error text-2xl"
                onClick={endCall}
              >
                <MdCallEnd />
              </button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default Chat;
