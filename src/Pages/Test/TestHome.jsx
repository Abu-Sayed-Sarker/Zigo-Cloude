import React from "react";
import { Link } from "react-router-dom";

export default function TestHome() {
  return (
    <div>
      <h1>Room List</h1>
      <ul className="flex gap-2">
        <Link
          className="py-2 px-4 bg-slate-600 text-white rounded-md"
          to="/room/123"
        >
          <li>Room 1</li>
        </Link>
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
    </div>
  );
}
