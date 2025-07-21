import React, { useEffect, useRef, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "./Components/Sidebar";
import socket from "./Socket";
import { setIncomingCall, clearIncomingCall } from "./redux/slices/callSlice";
import { MdCallEnd } from "react-icons/md";

const App = () => {
  const dispatch = useDispatch();
  const userinfo = useSelector((state) => state.auth.user?.user);
  const incomingCall = useSelector((state) => state.call.incomingCall);
  const navigate = useNavigate();


  const [peerConnection, setPeerConnection] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const [status, setStatus] = useState("Qo‘ng‘iroq...");
  const timerRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(new MediaStream());
  const remoteAudioRef = useRef(null);

  useEffect(() => {
    if (userinfo) {
      socket.emit("connected", userinfo);
    }
  }, [userinfo]);

  const handleSelectUser = (user) => {
    navigate(`/chat/${user._id}`);
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  const stopCall = () => {
    if (peerConnection) peerConnection.close();
    setPeerConnection(null);
    clearInterval(timerRef.current);
    setCallDuration(0);
    setStatus("Qo‘ng‘iroq tugatildi");
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    remoteStreamRef.current = new MediaStream();
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;
  };

  const acceptCall = async (data) => {
    document.getElementById("my_modal_call").showModal();
    setStatus("Qabul qilindi");

    const localStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
    localStreamRef.current = localStream;

    const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("ice_candidate", {
          to: data.socketId,
          candidate: e.candidate,
          from: socket.id,
        });
      }
    };

    pc.ontrack = (e) => {
      e.streams[0].getTracks().forEach((track) => remoteStreamRef.current.addTrack(track));
      if (remoteAudioRef.current) remoteAudioRef.current.srcObject = remoteStreamRef.current;
    };

    setPeerConnection(pc);
    socket.emit("accept_call", { to: data.socketId, from: socket.id });
    startTimer();
  };

  useEffect(() => {
    socket.on("incoming_call", (data) => {
      console.log("📞 Incoming call:", data);
      dispatch(setIncomingCall(data));
    });

    socket.on("call_ended", stopCall);

    socket.on("offer_received", async ({ offer, from }) => {
      const localStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
      localStreamRef.current = localStream;

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

      pc.onicecandidate = (e) => {
        if (e.candidate) {
          socket.emit("ice_candidate", {
            to: from,
            candidate: e.candidate,
            from: socket.id,
          });
        }
      };

      pc.ontrack = (e) => {
        e.streams[0].getTracks().forEach((track) => remoteStreamRef.current.addTrack(track));
        if (remoteAudioRef.current) remoteAudioRef.current.srcObject = remoteStreamRef.current;
      };

      await pc.setRemoteDescription(offer);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit("make_answer", { to: from, answer, from: socket.id });
      setPeerConnection(pc);
      startTimer();
      document.getElementById("my_modal_call").showModal();
    });

    socket.on("ice_candidate_received", async ({ candidate }) => {
      if (peerConnection) {
        await peerConnection.addIceCandidate(candidate);
      }
    });

    return () => {
      socket.off("incoming_call");
      socket.off("offer_received");
      socket.off("ice_candidate_received");
      socket.off("call_ended");
    };
  }, [peerConnection]);

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="flex h-screen">
      <Sidebar selectUser={handleSelectUser} />
      <div className="flex-1">
        {/* Incoming Call Modal */}
        {incomingCall && (
          <dialog id="incoming_modal" className="modal modal-bottom sm:modal-middle" open>
            <div className="modal-box">
              <h3 className="font-bold text-lg">Qo‘ng‘iroq</h3>
              <p className="py-4">Sizga {incomingCall.from?.username} dan qo‘ng‘iroq kelyapti</p>
              <div className="modal-action">
                <form method="dialog" className="flex gap-3">
                  <button className="btn btn-success" onClick={() => {
                    acceptCall(incomingCall);
                    dispatch(clearIncomingCall());
                  }}>Qabul qilish</button>
                  <button className="btn btn-error" onClick={() => {
                    socket.emit("reject_call", { to: incomingCall.socketId });
                    dispatch(clearIncomingCall());
                  }}>Rad etish</button>
                </form>
              </div>
            </div>
          </dialog>
        )}

        {/* Active Call Modal */}
        <dialog id="my_modal_call" className="modal modal-bottom sm:modal-middle">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Audio qo‘ng‘iroq</h3>
            <p className="py-2">{status} | {formatTime(callDuration)}</p>
            <div className="modal-action">
              <form method="dialog">
                <button className="btn btn-error" onClick={stopCall}>
                  <MdCallEnd className="text-xl" />
                </button>
              </form>
            </div>
            <audio ref={remoteAudioRef} autoPlay></audio>
          </div>
        </dialog>

        <Outlet />
      </div>
    </div>
  );
};

export default App;
