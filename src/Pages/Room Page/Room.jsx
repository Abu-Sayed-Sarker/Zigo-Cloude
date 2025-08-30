import React, { useState, useEffect } from "react";

const CallInterface = ({ role = "owner" }) => {
  const [username] = useState(role === "owner" ? "Owner User" : "Device User");
  const [callStatus, setCallStatus] = useState("Status: Not connected");
  const [callNotification, setCallNotification] = useState("");
  const [currentCallId, setCurrentCallId] = useState(null);
  const [inCall, setInCall] = useState(false);
  const [audioCtx, setAudioCtx] = useState(null);
  const [seq, setSeq] = useState(0);
  const [callSocket, setCallSocket] = useState(null);

  useEffect(() => {
    // Ensure AudioContext
    if (!audioCtx) {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      setAudioCtx(ctx);
    }
  }, [audioCtx]);

  const handleConnect = () => {
    const deviceId = document.getElementById("deviceId").value;
    const socket = new WebSocket(
      `wss://sacred-renewing-dove.ngrok-free.app/ws/call/${deviceId}/?token=${jwt}`
    );
    socket.onopen = () => {
      setCallStatus("Status: Connected");
      document.getElementById("connect-btn").classList.add("hidden");
      document.getElementById("start-call").classList.remove("hidden");
    };

    socket.onerror = (e) => {
      console.error("WS error:", e);
      setCallStatus("Status: Connection error");
    };

    socket.onclose = () => {
      setCallStatus("Status: Disconnected");
      document.getElementById("connect-btn").classList.remove("hidden");
      document.getElementById("start-call").classList.add("hidden");
    };

    socket.onmessage = (event) => handleCallMessage(event);
    setCallSocket(socket);
  };

  const handleCallMessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.error) {
      setCallNotification(`Error: ${data.error}`);
      console.error("Call error:", data.error);
      return;
    }

    switch (data.action) {
      case "incoming_call":
        setCurrentCallId(data.call_id);
        setCallNotification(`Incoming call from ${data.from}`);
        setCallStatus("Status: Incoming call");
        break;
      case "call_accepted":
        setCallNotification(`Call active with ${data.from}`);
        setCallStatus(`Status: Call active (Call ID: ${data.call_id})`);
        setInCall(true);
        break;
      case "call_ended":
        setCallNotification(`Call ended by ${data.by}`);
        setCallStatus("Status: Idle");
        setInCall(false);
        setCurrentCallId(null);
        break;
      case "audio_chunk":
        // Handle incoming audio chunks
        break;
      default:
        break;
    }
  };

  const startCall = () => {
    const receiverId = document.getElementById("deviceUserId").value;
    const deviceId = document.getElementById("deviceId").value;

    if (!callSocket || callSocket.readyState !== WebSocket.OPEN) {
      setCallNotification("Please connect to WebSocket first");
      return;
    }

    if (!receiverId) {
      setCallNotification("Please enter a Device User ID");
      return;
    }

    callSocket.send(
      JSON.stringify({
        action: "start_call",
        receiver_id: parseInt(receiverId),
        device_id: parseInt(deviceId),
      })
    );

    setCallStatus("Status: Calling device...");
    document.getElementById("start-call").classList.add("hidden");
  };

  const endCall = () => {
    if (
      callSocket &&
      callSocket.readyState === WebSocket.OPEN &&
      currentCallId
    ) {
      callSocket.send(
        JSON.stringify({
          action: "end_call",
          call_id: currentCallId,
        })
      );
    }
    setCallStatus("Status: Idle");
    setInCall(false);
    setCurrentCallId(null);
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h2 className="text-2xl font-bold mb-4">
        {role === "owner" ? "Owner Call Panel" : "Device Call Panel"}
      </h2>
      <div className="mb-4">
        <p className="text-gray-700">
          User: <span id="username">{username}</span> | Role: {role}
        </p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow space-y-2">
        <h3 className="text-xl font-semibold">Call Control</h3>
        <div className="flex space-x-2">
          <div className="flex-1">
            <label className="text-gray-700">Device ID:</label>
            <input
              id="deviceId"
              type="text"
              className="w-full p-2 border rounded"
              value="2"
            />
          </div>
          <div className="flex-1">
            <label className="text-gray-700">Device User ID:</label>
            <input
              id="deviceUserId"
              type="text"
              className="w-full p-2 border rounded"
              value="5"
            />
          </div>
        </div>

        <div id="call-status" className="text-gray-700">
          {callStatus}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            id="connect-btn"
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            onClick={handleConnect}
          >
            Connect
          </button>
          <button
            id="start-call"
            className="bg-green-500 text-white p-2 rounded hover:bg-green-600 hidden"
            onClick={startCall}
          >
            Start Call
          </button>
          <button
            id="end-call"
            className="bg-red-500 text-white p-2 rounded hover:bg-red-600 hidden"
            onClick={endCall}
          >
            End Call
          </button>
        </div>

        <div id="call-notification" className="text-gray-700">
          {callNotification}
        </div>
      </div>
    </div>
  );
};

export default CallInterface;
