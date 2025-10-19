

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CreatGroup from "../GreatGroup/CreatGroup";
import "./JoinGroupOrCreat.css";
import { fetchWithAuth } from "../../pages/LogIn/LogInFetchWithAuth";

export default function JoinGroupOrCreat() {
  const [inviteCode, setInviteCode] = useState("");
  const [groupId, setGroupId] = useState(""); 
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const BASE_URL = "https://dk6m8bl1-7144.asse.devtunnels.ms";

  
  const handleJoin = async (e) => {
    e.preventDefault();
    try {
      if (!inviteCode || !groupId) {
        setError("Please enter Group ID and Invitation Code");
        return;
      }

    
      const res = await fetchWithAuth(`/api/v1/groups/${groupId}/join`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ code: inviteCode }),
  credentials: "include",
});

      if (res.status === 204) {
        console.log("✅ Joined group successfully");
        navigate("/studentDashbord"); 
      } else {
        throw new Error("Invalid code or group ID");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to join group");
    }
  };


  const handleCreateGroup = async (groupName) => {
    try {
      const res = await fetchWithAuth("/api/v1/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Name: groupName }),
        credentials: "include",
      });

      if (res.status === 201) {
        const data = await res.json();
        console.log("✅ Group created:", data);
        navigate("/leader"); 
      } else {
        throw new Error("Failed to create group");
      }
    } catch (err) {
      console.error(err);
      setError("Error while creating group");
    }
  };

  return (
    <>
      <div className="hn-join">
        <h2>Joining The Group:</h2>
        <form onSubmit={handleJoin}>
          <div>
            <label className="hn-label">Group ID</label>
            <input
              type="text"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              placeholder="Enter Group ID"
              className="hn-inputName"
            />
          </div>

          <div>
            <label className="hn-label">Invitation Code:</label>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="Enter Your Invitation Code"
              className="hn-inputName"
            />
          </div>

          <button type="submit" className="hn-buttonAdd">Joining</button>
          {error && <p style={{ color: "red" }}>{error}</p>}
        </form>
      </div>

      <p className="hn-oR">OR</p>

      {}
      <CreatGroup x={false} onCreate={handleCreateGroup} />
    </>
  );
}