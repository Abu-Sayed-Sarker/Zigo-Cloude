import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ReceiverModal from "../../components/ReceiverModal";
import CallerModal from "../../components/CallerModal";

export default function TestHome() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [socket, setSocket] = React.useState(null);
  const [response, setResponse] = useState(null);
  const navigate = useNavigate();
  const jwt =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzU3MTUxNTQzLCJpYXQiOjE3NTY1NDY3NDMsImp0aSI6Ijk4NGZkZDc0NWEzNjRkNTU5ZDNiYWQ2MTg0Y2IwZmE5IiwidXNlcl9pZCI6NCwidXNlciI6eyJpZCI6NCwidXNlcm5hbWUiOiJTYW5qaWRhIEtoYW5hbSIsImVtYWlsIjoic2FuamlkYS5pY2UuNzc4QGdtYWlsLmNvbSIsInJvbGUiOiJvd25lciIsInJlc3RhdXJhbnRzX2lkIjoyLCJkZXZpY2VfaWQiOm51bGwsInN1YnNjcmlwdGlvbiI6eyJwYWNrYWdlX25hbWUiOiJtb250aCAxIiwic3RhdHVzIjoiQWN0aXZlIiwiY3VycmVudF9wZXJpb2RfZW5kIjoiMjAyNS0wOS0xOCAxMTo0MDozMCswMDowMCJ9LCJvd25lcl9pZCI6NH19.R_NQBcouIW1MbWj4cDtTVajBajxf13Etb8cygq8rVuk";

  React.useEffect(() => {
    if (!jwt) {
      return;
    }
    const newSoket = new WebSocket(
      `ws://10.10.13.26:8000/ws/call/2/?token=${jwt}`
    );
    newSoket.onopen = () => {
      console.log("Socket Opened");
    };
    newSoket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log(data);
      setResponse(data);
      if (data.action === "incoming_call") {
        setIsModalOpen(true);
      }
      if (data.action === "call_accepted") {
        navigate(`/room/${data.device_id}`);
      }
    };

    newSoket.onclose = () => {
      console.log("Socket Closed");
    };

    newSoket.onerror = () => {
      console.log("Socket Error");
    };

    setSocket(newSoket);

    return () => {
      newSoket.close();
    };
  }, [jwt]);

  const handleEndCall = (callerId, deviceId) => {
    const data = {
      action: "end_call",
      call_id: callerId,
      device_id: deviceId,
    };
    socket.send(JSON.stringify(data));
  };

  const handleAnswerCall = (callerId, deviceId) => {
    const data = {
      action: "accept_call",
      call_id: callerId,
      device_id: deviceId,
    };
    socket.send(JSON.stringify(data));
  };

  const handleCall = (receiver_id) => {
    const data = {
      action: "start_call",
      receiver_id: receiver_id,
      device_id: 2,
    };
    socket.send(JSON.stringify(data));
  };
  return (
    <div>
      <h1>Room List</h1>
      <ul className="flex gap-2">
        <button
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          onClick={() => handleCall(5)}
        >
          Call
        </button>

        {isModalOpen && (
          <CallerModal
            email={"sanjida.ice.778@gmail"}
            handleEndCall={handleEndCall}
            handleAnswerCall={handleAnswerCall}
            response={response}
          />
        )}
      </ul>
    </div>
  );
}
