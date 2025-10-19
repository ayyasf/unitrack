import React, { useState, useEffect } from "react";
import "./AdminDashboard.css";
import { fetchWithAuth } from "../LogIn/LogInFetchWithAuth";

// New subcomponent for committee assignment
const AssignDefenseCommittee = ({ projectId, onSuccess }) => {
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [selectedMembers, setSelectedMembers] = useState({
    CommitteeChair: "",
    InternalExaminer: "",
    ExternalExaminer: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch all doctors
  const fetchDoctors = async () => {
    try {
      setLoadingDoctors(true);
      const res = await fetchWithAuth("/api/v1/doctors"); // skip pagination
      const data = await res.json();
      setDoctors(data.items || []);
    } catch (err) {
      console.error("Error fetching doctors:", err);
    } finally {
      setLoadingDoctors(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleSelectDoctor = (role, doctorId) => {
    setSelectedMembers(prev => ({
      ...prev,
      [role]: doctorId
    }));
  };

  const submitCommittee = async () => {
    if (!selectedMembers.CommitteeChair || 
        !selectedMembers.InternalExaminer || 
        !selectedMembers.ExternalExaminer) {
      alert("Please select a doctor for each role.");
      return;
    }

    const requestBody = {
      Memebers: [
        { DoctorId: selectedMembers.CommitteeChair, Role: "CommitteeChair" },
        { DoctorId: selectedMembers.InternalExaminer, Role: "InternalExaminer" },
        { DoctorId: selectedMembers.ExternalExaminer, Role: "ExternalExaminer" }
      ]
    };

    try {
      setSubmitting(true);
      const res = await fetchWithAuth(
        `/api/v1/projects/${projectId}/defense-committee`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        }
      );

      if (res.status === 204) {
        alert("Defense committee assigned successfully!");
        if (onSuccess) onSuccess();
      } else {
        const errText = await res.text();
        alert(`Failed to assign committee: ${errText}`);
      }
    } catch (err) {
      console.error("Error assigning committee:", err);
      alert("Error assigning committee.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ border: "1px solid #ccc", padding: 20, borderRadius: 5, marginBottom: 20 }}>
      <h4>Assign Defense Committee for Project: {projectId}</h4>

      {loadingDoctors ? (
        <p>Loading doctors...</p>
      ) : (
        <>
          {["CommitteeChair", "InternalExaminer", "ExternalExaminer"].map(role => (
            <div key={role} style={{ marginBottom: 15 }}>
              <label style={{ display: "block", marginBottom: 5 }}>
                {role.replace(/([A-Z])/g, " $1").trim()}:
              </label>
              <select
                value={selectedMembers[role] || ""}
                onChange={(e) => handleSelectDoctor(role, e.target.value)}
                style={{ width: "100%", padding: 5 }}
              >
                <option value="">Select a doctor</option>
                {doctors.map(doc => (
                  <option key={doc.id} value={doc.id}>
                    {doc.firstName} {doc.lastName}
                  </option>
                ))}
              </select>
            </div>
          ))}

          <button
            onClick={submitCommittee}
            disabled={submitting}
            style={{
              background: "green",
              color: "white",
              padding: "8px 15px",
              border: "none",
              cursor: "pointer"
            }}
          >
            {submitting ? "Assigning..." : "Assign Committee"}
          </button>
        </>
      )}
    </div>
  );
};

// --- AdminDashboard component ---
const AdminDashboard = () => {
  const [expandedSection, setExpandedSection] = useState(null);
  const [snapshot, setSnapshot] = useState({
    groupsCount: 0,
    doctorsCount: 0,
    accountsCount: 0,
    doctorRegisterationsCount: 0,
    defenseSchedulesCount: 0,
    defenseCommitteesCount: 0,
  });

  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupSpecialization, setGroupSpecialization] = useState("All");
  
  const [committees, setCommittees] = useState([]);

  useEffect(() => {
    fetchWithAuth("/api/v1/dashboards/admin/snapshot")
      .then(res => res.json())
      .then(data => setSnapshot(data))
      .catch(err => console.error(err));
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await fetchWithAuth("/api/v1/groups?Page=1&PageSize=20");
      const data = await res.json();
      setGroups(data.items || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroupById = async (id) => {
    try {
      const res = await fetchWithAuth(`/api/v1/groups/${id}`);
      const data = await res.json();
      setSelectedGroup(data);
    } catch (err) {
      console.error(err);
    }
  };

  const refreshCommittees = () => {
    // Re-fetch committees for the selected project
    if (selectedGroup?.projectId) {
      fetchWithAuth(`/api/v1/projects/${selectedGroup.projectId}/defense-committee`)
        .then(res => res.json())
        .then(data => setCommittees([{ projectId: selectedGroup.projectId, members: data.members || [] }]))
        .catch(err => console.error(err));
    }
  };

  const sections = [
    {
      title: `Groups (${snapshot.groupsCount})`,
      content: (
        <>
          {groups.map(g => (
            <div key={g.id} style={{ cursor: "pointer" }} onClick={() => fetchGroupById(g.id)}>
              {g.name} - {g.specialization}
            </div>
          ))}
          {selectedGroup?.projectId && (
            <AssignDefenseCommittee
              projectId={selectedGroup.projectId}
              onSuccess={refreshCommittees}
            />
          )}
          {committees.map(comm => (
            <div key={comm.projectId} style={{ border: "1px solid #ccc", padding: 10, borderRadius: 5, marginBottom: 10 }}>
              <h4>Project: {comm.projectId}</h4>
              <strong>Members:</strong>
              <ul>
                {comm.members.map(m => (
                  <li key={m.doctorId}>{m.name} ({m.role})</li>
                ))}
              </ul>
            </div>
          ))}
        </>
      )
    }
  ];

  return (
    <div>
      <h3>Admin Dashboard</h3>
      {sections.map((section, index) => (
        <div key={index} style={{ border: "1px solid #ccc", marginBottom: 10, padding: 10 }}>
          <h4 onClick={() => setExpandedSection(expandedSection === index ? null : index)} style={{ cursor: "pointer" }}>
            {section.title} {expandedSection === index ? "▲" : "▼"}
          </h4>
          {expandedSection === index && <div>{section.content}</div>}
        </div>
      ))}
    </div>
  );
};

export default AdminDashboard;
