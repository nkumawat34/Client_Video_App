import React, { useEffect, useCallback, useState } from "react";
import ReactPlayer from "react-player";
import peer from "../services/peer";
import { useSocket } from "../context/SocketProvider.";
import { FaVolumeMute, FaVolumeUp } from 'react-icons/fa'; 
const RoomPage = () => {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();
  const [isMuted, setIsMuted] = useState(false);

  const toggleMute = () => {
    setIsMuted(prevState => !prevState);
  };
  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`Email ${email} joined room`);
    setRemoteSocketId(id);
  }, []);

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer });
    setMyStream(stream);
  }, [remoteSocketId, socket]);

  const handleIncommingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      console.log(`Incoming Call`, from, offer);
      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );

  const sendStreams = useCallback(() => {
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);

  const handleCallAccepted = useCallback(
    ({ from, ans }) => {
      peer.setLocalDescription(ans);
      console.log("Call Accepted!");
      sendStreams();
    },
    [sendStreams]
  );

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  const handleNegoNeedIncomming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
    await peer.setLocalDescription(ans);
  }, []);

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      console.log("GOT TRACKS!!");
      setRemoteStream(remoteStream[0]);
    });
  }, []);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncomming);
    socket.on("peer:nego:final", handleNegoNeedFinal);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncomming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncommingCall,
    handleCallAccepted,
    handleNegoNeedIncomming,
    handleNegoNeedFinal,
  ]);

  return (
    <div className="text-center">
      <h1 className="text-4xl mb-4">Room Page</h1>
      <h4 className="text-2xl mb-4">{remoteSocketId ? "Connected" : "No one in room"}</h4>
      {myStream && (
        <button onClick={sendStreams} className="btn btn-primary mx-2 bg-blue-500 text-white py-2 px-4 rounded">
          Send Stream
        </button>
      )}
      {remoteSocketId && (
        <button onClick={handleCallUser} className="btn btn-primary mx-2 bg-blue-500 text-white py-2 px-4 rounded">
          CALL
        </button>
      )}
      {myStream && (
        <>
          <h3 className="text-3xl mt-4 mb-2">My Stream</h3>
          <div className="flex justify-center">
            <ReactPlayer
              playing
              volume={1}
              height="200px"
              width="200px"
              muted={isMuted}
              url={myStream}
            />
          </div>
        </>
      )}
      {remoteStream && (
        <>
          <h3 className="text-3xl mt-4 mb-2">Remote Stream</h3>
          <div className="flex justify-center">
            <ReactPlayer
              playing
              volume={1}
              height="200px"
              width="200px"
              muted={isMuted}
              url={remoteStream}
            />
          </div>
          <button className="mt-2" onClick={toggleMute}>
            {isMuted ? <FaVolumeMute size={24} /> : <FaVolumeUp size={24} />}
          </button>
        </>
      )}
    </div>
  );
};

export default RoomPage;