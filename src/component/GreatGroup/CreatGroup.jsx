

import React, { useState } from "react";
import "./CreatGroup.css";

export default function CreatGroup({ x, onCreate }) {
  const [groupName, setGroupName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");

  const generateInviteCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupName) {
      setError("Please enter group name");
      return;
    }

    if (onCreate) {
     
      await onCreate(groupName);
    } else {

      const code = generateInviteCode();
      setInviteCode(code);
      alert(`تم إنشاء المجموعة بنجاح! رمز الدعوة هو: ${code}`);
    }
  };

  return (
    <div className="hn-creatGroup">
      <h2>Creat Group</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label className="hn-label">A Group Name :</label>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Enter A Group Name"
            className="hn-inputName"
          />
        </div>

        <button type="submit" className="hn-buttonAdd">
          Creat A Group
        </button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>

      {inviteCode && !onCreate && (
        <div>
          <p>
            Your Invitation Code : <strong>{inviteCode}</strong>
          </p>
        </div>
      )}
    </div>
  );
}