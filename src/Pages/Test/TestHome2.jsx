import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CallerModal from "../../components/CallerModal";

export default function TestHome2() {
  const [socket, setSocket] = React.useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [response, setResponse] = useState(null);
  const navigate = useNavigate();
  const jwt =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzU3MTUyNTY0LCJpYXQiOjE3NTY1NDc3NjQsImp0aSI6ImZhYzRiMTkwMDM1YjRiMmNhZTUzNjBiMGJhY2ZkNjZiIiwidXNlcl9pZCI6NSwidXNlciI6eyJpZCI6NSwidXNlcm5hbWUiOiJoeWF0dGJlbmphbWluNjE0OCIsImVtYWlsIjoiaHlhdHRiZW5qYW1pbjYxNDhAZXhhbXBsZS5jb20iLCJyb2xlIjoiY3VzdG9tZXIiLCJyZXN0YXVyYW50c19pZCI6MiwiZGV2aWNlX2lkIjoyLCJzdWJzY3JpcHRpb24iOnsicGFja2FnZV9uYW1lIjoibW9udGggMSIsInN0YXR1cyI6IkFjdGl2ZSIsImN1cnJlbnRfcGVyaW9kX2VuZCI6IjIwMjUtMDktMTggMTE6NDA6MzArMDA6MDAifSwib3duZXJfaWQiOjR9fQ.OGjxuu0fACkJxlobh28IJ1G0oQ8NFt4i-8tpVUp8MzE";

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
      setResponse(data);
      console.log(data);
      if (data.action === "incoming_call") {
        setIsModalOpen(true);
      } else if (data.action === "call_accepted") {
        navigate(`/roomssss/${data.device_id}`);
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

  const handleAnswerCall = (callerId, deviceId) => {
    setIsModalOpen(false);
  };

  const handleEndCall = (callerId, deviceId) => {
    setIsModalOpen(false);
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
          className="py-2 px-4 bg-slate-600 text-white rounded-md"
          onClick={() => handleCall(5)}
        >
          {" "}
          Call res
        </button>
        <Link
          className="py-2 px-4 bg-slate-600 text-white rounded-md"
          to="/room/456"
        >
          <li>Room 2</li>
        </Link>
        <Link
          className="py-2 px-4 bg-slate-600 text-white rounded-md"
          to="/room/789"
        >
          <li>Room 3</li>
        </Link>
        <Link
          className="py-2 px-4 bg-slate-600 text-white rounded-md"
          to="/room/1011"
        >
          <li>Room 4</li>
        </Link>
        <Link
          className="py-2 px-4 bg-slate-600 text-white rounded-md"
          to="/room/1213"
        >
          <li>Room 5</li>
        </Link>
        <Link
          className="py-2 px-4 bg-slate-600 text-white rounded-md"
          to="/room/1415"
        >
          <li>Room 6</li>
        </Link>
        <Link
          className="py-2 px-4 bg-slate-600 text-white rounded-md"
          to="/room/1617"
        >
          <li>Room 7</li>
        </Link>
        <Link
          className="py-2 px-4 bg-slate-600 text-white rounded-md"
          to="/room/1819"
        >
          <li>Room 8</li>
        </Link>
        <Link
          className="py-2 px-4 bg-slate-600 text-white rounded-md"
          to="/room/2021"
        >
          <li>Room 9</li>
        </Link>
        <Link
          className="py-2 px-4 bg-slate-600 text-white rounded-md"
          to="/room/2223"
        >
          <li>Room 10</li>
        </Link>
      </ul>

      {isModalOpen && (
        <CallerModal
          email={"hyattbenjamin6148"}
          response={response}
          handleEndCall={handleEndCall}
          handleAnswerCall={handleAnswerCall}
        />
      )}
    </div>
  );
}
