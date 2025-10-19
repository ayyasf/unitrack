

import React, { useState, useEffect } from "react";
import "./AdminDashboard.css";
import { fetchWithAuth } from "../LogIn/LogInFetchWithAuth";

const AdminDashboard = () => {
  const [expandedSection, setExpandedSection] = useState(null);

  // Add state for schedule creation form
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    projectId: "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
  });

  // Add state for doctor assignment
  const [assigningDoctors, setAssigningDoctors] = useState(false);
  const [assignmentMessage, setAssignmentMessage] = useState("");

  // snapshot
  const [snapshot, setSnapshot] = useState({
    groupsCount: 0,
    doctorsCount: 0,
    accountsCount: 0,
    doctorRegisterationsCount: 0,
    defenseSchedulesCount: 0,
    defenseCommitteesCount: 0,
  });

  // groups
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupSpecialization, setGroupSpecialization] = useState("All");
  const [groupsPage, setGroupsPage] = useState(1);
  const [groupsTotalPages, setGroupsTotalPages] = useState(1);

  // doctors
  const [doctors, setDoctors] = useState([]);
  const [doctorFilter, setDoctorFilter] = useState("All");

  // accounts
  const [accounts, setAccounts] = useState([]);
  const [roleFilter, setRoleFilter] = useState("All");
  const [accountsPage, setAccountsPage] = useState(1);
  const [accountsPageSize] = useState(5);
  const [accountsTotalPages, setAccountsTotalPages] = useState(1);

  // doctor requests
  const [doctorRequests, setDoctorRequests] = useState([]);

  // group preferences
  const [groupPreferences, setGroupPreferences] = useState([]);

  // committees
  const [committees, setCommittees] = useState([]);
  const [committeesPage, setCommitteesPage] = useState(1);
  const [committeesPageSize] = useState(5);
  const [committeesTotalPages, setCommitteesTotalPages] = useState(1);

  // New state for committee assignment
  const [showCommitteeForm, setShowCommitteeForm] = useState(false);
  const [committeeProjectId, setCommitteeProjectId] = useState("");
  const [committeeMembers, setCommitteeMembers] = useState({
    CommitteeChair: null,
    InternalExaminer: null,
    ExternalExaminer: null,
  });
  const [allDoctorsForCommittee, setAllDoctorsForCommittee] = useState([]);

  // fetch snapshot
  useEffect(() => {
    fetchWithAuth("/api/v1/dashboards/admin/snapshot")
      .then((res) => res.json())
      .then((data) => setSnapshot(data))
      .catch((err) => console.error("Error fetching snapshot:", err));
  }, []);

  // fetch groups
  const fetchGroups = async (specialization = "All", page = 1) => {
    try {
      let url = `/api/v1/groups?Page=${page}&PageSize=20`;
      if (specialization !== "All") url += `&Specialization=${specialization}`;
      const res = await fetchWithAuth(url);
      const data = await res.json();
      setGroups(data.items || []);
      setGroupsPage(page);
      setGroupsTotalPages(Math.ceil((data.totalCount || 0) / 20));
    } catch (err) {
      console.error("Error fetching groups:", err);
      setGroups([]);
    }
  };

  useEffect(() => {
    fetchGroups(groupSpecialization, groupsPage);
  }, [groupSpecialization, groupsPage]);

  // fetch group by id
  const fetchGroupById = async (id) => {
    try {
      const res = await fetchWithAuth(`/api/v1/groups/${id}`);
      const data = await res.json();
      setSelectedGroup(data);

      // fetch committees if project exists
      if (data.projectId) {
        fetchCommittees(data.projectId);
      }
    } catch (err) {
      console.error("Error fetching group by id:", err);
    }
  };

  // fetch doctors
  const fetchDoctors = async () => {
    try {
      let url = "/api/v1/doctors?page=1&pageSize=20";
      if (doctorFilter !== "All") url += `&Specialization=${doctorFilter}`;
      const res = await fetchWithAuth(url);
      const data = await res.json();
      setDoctors(data.items || []);
    } catch (err) {
      console.error("Error fetching doctors:", err);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [doctorFilter]);

  // fetch accounts
  const fetchAccounts = async (page = 1, role = "All") => {
    try {
      let url = `/api/v1/accounts?page=${page}&pageSize=${accountsPageSize}`;
      if (role !== "All") url += `&role=${role}`;
      const res = await fetchWithAuth(url);
      const data = await res.json();
      setAccounts(data.items || []);
      setAccountsPage(data.page || 1);
      setAccountsTotalPages(
        Math.ceil((data.totalCount || 0) / accountsPageSize)
      );
    } catch (err) {
      console.error("Error fetching accounts:", err);
      setAccounts([]);
      setAccountsPage(1);
      setAccountsTotalPages(1);
    }
  };

  useEffect(() => {
    fetchAccounts(accountsPage, roleFilter);
  }, [accountsPage, roleFilter]);

  const toggleActive = async (id, isActive) => {
    try {
      const url = isActive
        ? `/api/v1/accounts/${id}/deactivate`
        : `/api/v1/accounts/${id}/activate`;
      await fetchWithAuth(url, { method: "PATCH" });
      fetchAccounts(accountsPage, roleFilter);
      setAccounts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a))
      );
    } catch (err) {
      console.error("Error toggling account:", err);
    }
  };

  // doctor registrations
  const fetchDoctorRequests = async () => {
    try {
      const res = await fetchWithAuth(
        "/api/v1/doctor-registerations?status=Pending"
      );
      const data = await res.json();
      setDoctorRequests(data.items || []);
    } catch (err) {
      console.error("Error fetching doctor requests:", err);
    }
  };

  const acceptRequest = async (id) => {
    await fetchWithAuth(`/api/v1/doctor-registerations/${id}/accept`, {
      method: "PATCH",
    });
    fetchDoctorRequests();
  };

  const rejectRequest = async (id) => {
    await fetchWithAuth(`/api/v1/doctor-registerations/${id}/reject`, {
      method: "PATCH",
    });
    fetchDoctorRequests();
  };

  useEffect(() => {
    fetchDoctorRequests();
  }, []);

  // group preferences
  const fetchPreferences = async () => {
    try {
      const res = await fetchWithAuth(
        "/api/v1/groups/preferences?page=1&pageSize=10"
      );
      const data = await res.json();
      setGroupPreferences(data.items || []);
    } catch (err) {
      console.error("Error fetching preferences:", err);
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, []);

  // committees
  const fetchCommittees = async (projectId) => {
    try {
      const [scheduleRes, committeeRes] = await Promise.all([
        fetchWithAuth(`/api/v1/projects/${projectId}/defense-schedule`),
        fetchWithAuth(`/api/v1/projects/${projectId}/defense-committee`),
      ]);

      const schedule = await scheduleRes.json();
      const committee = await committeeRes.json();

      setCommittees([
        {
          projectId,
          schedule,
          members: committee.members || [],
        },
      ]);
    } catch (err) {
      console.error("Error fetching committees:", err);
      setCommittees([]);
    }
  };

  const assignCommittee = async (projectId, members) => {
    try {
      const res = await fetchWithAuth(
        `/api/v1/projects/${projectId}/defense-committee`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ Memebers: members }),
        }
      );

      if (res.ok) {
        await fetchCommittees(projectId);
        alert("Committee assigned successfully!");
        return true;
      } else {
        alert("Failed to assign committee");
        return false;
      }
    } catch (err) {
      console.error("Error assigning committee:", err);
      alert("Error assigning committee");
      return false;
    }
  };

  // **Assign doctors to groups**
  const assignDoctorsToGroups = async () => {
    setAssigningDoctors(true);
    setAssignmentMessage("");

    try {
      const res = await fetchWithAuth("/api/v1/groups/assign-doctors", {
        method: "POST",
      });

      if (res.status === 204) {
        setAssignmentMessage("Doctors assigned to groups successfully!");
        fetchGroups(groupSpecialization, groupsPage);
      } else {
        setAssignmentMessage("Failed to assign doctors to groups");
      }
    } catch (err) {
      console.error("Error assigning doctors:", err);
      setAssignmentMessage("Error assigning doctors to groups");
    } finally {
      setAssigningDoctors(false);
    }
  };

  // Handle schedule form changes
  const handleScheduleFormChange = (e) => {
    const { name, value } = e.target;
    setScheduleForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Create defense schedule
  const createDefenseSchedule = async () => {
    try {
      const { projectId, date, startTime, endTime, location } = scheduleForm;

      if (!projectId || !date || !startTime || !endTime || !location) {
        alert("Please fill all fields");
        return;
      }

      const res = await fetchWithAuth(
        `/api/v1/projects/${projectId}/defense-schedule`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date, startTime, endTime, location }),
        }
      );

      if (res.status === 201) {
        alert("Schedule created successfully! Now you can add a committee.");
        setShowScheduleForm(false);
        setScheduleForm({
          projectId: "",
          date: "",
          startTime: "",
          endTime: "",
          location: "",
        });

        // Show committee form instead of prompting
        setCommitteeProjectId(projectId);
        setShowCommitteeForm(true);
        fetchAllDoctorsForCommittee();
      } else {
        alert("Failed to create schedule");
      }
    } catch (err) {
      console.error("Error creating schedule:", err);
    }
  };

  // New function to fetch all doctors for committee selection
  const fetchAllDoctorsForCommittee = async () => {
    try {
      const res = await fetchWithAuth("/api/v1/doctors?page=1&pageSize=100");
      const data = await res.json();
      setAllDoctorsForCommittee(data.items || []);
    } catch (err) {
      console.error("Error fetching doctors for committee:", err);
    }
  };

  // Handle committee member selection
  const handleCommitteeMemberSelect = (role, doctorId) => {
    setCommitteeMembers((prev) => ({
      ...prev,
      [role]: doctorId,
    }));
  };

  // Submit committee assignment
  const submitCommitteeAssignment = async () => {
    try {
      // Validate all roles are selected
      if (
        !committeeMembers.CommitteeChair ||
        !committeeMembers.InternalExaminer ||
        !committeeMembers.ExternalExaminer
      ) {
        alert("Please select doctors for all committee roles");
        return;
      }

      // Prepare the request body according to the API specification
      const members = [
        {
          doctorId: committeeMembers.CommitteeChair,
          role: "CommitteeChair",
        },
        {
          doctorId: committeeMembers.InternalExaminer,
          role: "InternalExaminer",
        },
        {
          doctorId: committeeMembers.ExternalExaminer,
          role: "ExternalExaminer",
        },
      ];

      // Call the API to assign committee
      const success = await assignCommittee(committeeProjectId, members);

      if (success) {
        // Reset form
        setShowCommitteeForm(false);
        setCommitteeProjectId("");
        setCommitteeMembers({
          CommitteeChair: null,
          InternalExaminer: null,
          ExternalExaminer: null,
        });
      }
    } catch (err) {
      console.error("Error submitting committee assignment:", err);
    }
  };

  // Function to assign committee to existing project without schedule
  const assignCommitteeToProject = async (projectId) => {
    setCommitteeProjectId(projectId);
    setShowCommitteeForm(true);
    fetchAllDoctorsForCommittee();
  };

  const sections = [
    {
      title: `Display of Groups (${snapshot.groupsCount})`,
      content: (
        <>
          <button
            className="hn-select"
            style={{ marginBottom: 10 }}
            onClick={assignDoctorsToGroups}
            disabled={assigningDoctors}
          >
            {assigningDoctors
              ? "Assigning Doctors..."
              : "Assign Doctors to Groups"}
          </button>

          {assignmentMessage && (
            <div
              className={`assignment-message ${
                assignmentMessage.includes("successfully") ? "success" : "error"
              }`}
              style={{
                padding: "10px",
                marginBottom: "10px",
                borderRadius: "4px",
                backgroundColor: assignmentMessage.includes("successfully")
                  ? "#d4edda"
                  : "#f8d7da",
                color: assignmentMessage.includes("successfully")
                  ? "#155724"
                  : "#721c24",
                border: assignmentMessage.includes("successfully")
                  ? "1px solid #c3e6cb"
                  : "1px solid #f5c6cb",
              }}
            >
              {assignmentMessage}
            </div>
          )}

          <div className="filter-bar">
            <label className="hn-labelFilter">Filter by specialty:</label>
            <select
              className="hn-select"
              value={groupSpecialization}
              onChange={(e) => setGroupSpecialization(e.target.value)}
            >
              <option>All</option>
              <option>Software</option>
              <option>AI</option>
              <option>Networking</option>
            </select>
          </div>
          {groups.length === 0 ? (
            <p className="hn-pAdmin">No groups found</p>
          ) : (
            groups.map((g) => (
              <div
                key={g.id}
                className="list-item"
                style={{ cursor: "pointer" }}
                onClick={() => fetchGroupById(g.id)}
              >
                {g.name} - {g.specialization}
              </div>
            ))
          )}
          {selectedGroup && (
            <div className="group-details">
              <h4>{selectedGroup.name}</h4>
              <p>Code: {selectedGroup.code}</p>
              <p>Doctor ID: {selectedGroup.doctorId}</p>
              <p>Total Students: {selectedGroup.totalStudents}</p>
              <ul>
                {selectedGroup.students.map((s) => (
                  <li key={s.id}>
                    {s.firstName} {s.lastName} - {s.univNum}{" "}
                    {s.isLeader && "(Leader)"}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ),
    },
    {
      title: `Display of Doctors (${snapshot.doctorsCount})`,
      content: (
        <>
          <div className="filter-bar">
            <label className="hn-labelFilter">Filter by specialty:</label>
            <select
              className="hn-select"
              value={doctorFilter}
              onChange={(e) => setDoctorFilter(e.target.value)}
            >
              <option>All</option>
              <option>Software</option>
              <option>AI</option>
              <option>Networking</option>
            </select>
          </div>
          {doctors.length === 0 ? (
            <p className="hn-pAdmin">No doctors found</p>
          ) : (
            doctors.map((d) => (
              <div key={d.id} className="list-item">
                {d.firstName} {d.lastName} - {d.specialization}
              </div>
            ))
          )}
        </>
      ),
    },
    {
      title: `Display of accounts (${snapshot.accountsCount})`,
      content: (
        <>
          <div className="filter-bar">
            <label className="hn-labelFilter">Filter By Role:</label>
            <select
              className="hn-select"
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setAccountsPage(1);
              }}
            >
              <option>All</option>
              <option>Student</option>
              <option>Doctor</option>
              <option>Admin</option>
            </select>
          </div>
          {accounts.length === 0 ? (
            <p className="hn-pAdmin">No account found</p>
          ) : (
            accounts.map((a) => (
              <div
                key={a.id}
                className="list-item"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>
                  {a.firstName} {a.lastName} - {a.role} - Status:{" "}
                  {a.isActive ? "Active" : "Inactive"}
                </span>
                <button
                  onClick={() => toggleActive(a.id, a.isActive)}
                  style={{
                    background: a.isActive ? "red" : "green",
                    color: "white",
                    border: "none",
                    padding: "5px 10px",
                    cursor: "pointer",
                  }}
                >
                  {a.isActive ? "DeActivation" : "Activation"}
                </button>
              </div>
            ))
          )}
          <div className="pagination" style={{ marginTop: 10 }}>
            <button
              onClick={() => fetchAccounts(accountsPage - 1, roleFilter)}
              disabled={accountsPage === 1}
            >
              Prev
            </button>
            <span style={{ margin: "0 10px" }}>
              Page {accountsPage} of {accountsTotalPages}
            </span>
            <button
              onClick={() => fetchAccounts(accountsPage + 1, roleFilter)}
              disabled={accountsPage === accountsTotalPages}
            >
              Next
            </button>
          </div>
        </>
      ),
    },
    {
      title: ` Doctor registration requests (${snapshot.doctorRegisterationsCount})`,
      content: (
        <>
          {doctorRequests && doctorRequests.length > 0 ? (
            doctorRequests.map((r) => (
              <div key={r.id} className="list-item">
                Request ID: {r.id} - Status: {r.status}
                <button
                  style={{
                    marginLeft: 10,
                    background: "green",
                    color: "white",
                  }}
                  onClick={() => acceptRequest(r.id)}
                >
                  Accept
                </button>
                <button
                  className="hn-select"
                  onClick={() => rejectRequest(r.id)}
                >
                  Rejection
                </button>
              </div>
            ))
          ) : (
            <p className="hn-pAdmin">No Request found</p>
          )}
        </>
      ),
    },
    {
      title: "Display of group selection preferences",
      content: (
        <>
          {groupPreferences.length === 0 ? (
            <p className="hn-pAdmin">No preferences found</p>
          ) : (
            groupPreferences.map((p) => (
              <div key={p.groupId} className="list-item">
                {p.groupId}
                <ul>
                  {p.preferences.map((pref, i) => (
                    <li key={i}>
                      {pref.name} (Priority: {pref.priority})
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </>
      ),
    },
    {
      title: `Discussion Committees and Schedules (${snapshot.defenseCommitteesCount})`,
      content: (
        <>
          <button
            onClick={() => setShowScheduleForm(true)}
            className="hn-select"
            style={{ marginBottom: 10 }}
          >
            Add New Schedule
          </button>

          {showScheduleForm && (
            <div
              className="schedule-form"
              style={{
                border: "1px solid #ccc",
                padding: "15px",
                borderRadius: "5px",
                marginBottom: "15px",
              }}
            >
              <h4>Create Defense Schedule</h4>
              <div style={{ marginBottom: "10px" }}>
                <label style={{ display: "block", marginBottom: "5px" }}>
                  Project ID:
                </label>
                <input
                  type="text"
                  name="projectId"
                  value={scheduleForm.projectId}
                  onChange={handleScheduleFormChange}
                  style={{ width: "100%", padding: "5px" }}
                />
              </div>
              <div style={{ marginBottom: "10px" }}>
                <label style={{ display: "block", marginBottom: "5px" }}>
                  Date (YYYY-MM-DD):
                </label>
                <input
                  type="date"
                  name="date"
                  value={scheduleForm.date}
                  onChange={handleScheduleFormChange}
                  style={{ width: "100%", padding: "5px" }}
                />
              </div>
              <div style={{ marginBottom: "10px" }}>
                <label style={{ display: "block", marginBottom: "5px" }}>
                  Start Time (HH:MM:SS):
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={scheduleForm.startTime}
                  onChange={handleScheduleFormChange}
                  style={{ width: "100%", padding: "5px" }}
                />
              </div>
              <div style={{ marginBottom: "10px" }}>
                <label style={{ display: "block", marginBottom: "5px" }}>
                  End Time (HH:MM:SS):
                </label>
                <input
                  type="time"
                  name="endTime"
                  value={scheduleForm.endTime}
                  onChange={handleScheduleFormChange}
                  style={{ width: "100%", padding: "5px" }}
                />
              </div>
              <div style={{ marginBottom: "10px" }}>
                <label style={{ display: "block", marginBottom: "5px" }}>
                  Location:
                </label>
                <input
                  type="text"
                  name="location"
                  value={scheduleForm.location}
                  onChange={handleScheduleFormChange}
                  style={{ width: "100%", padding: "5px" }}
                />
              </div>
              <div>
                <button
                  onClick={createDefenseSchedule}
                  style={{
                    background: "green",
                    color: "white",
                    padding: "8px 15px",
                    border: "none",
                    marginRight: "10px",
                  }}
                >
                  Create Schedule
                </button>
                <button
                  onClick={() => setShowScheduleForm(false)}
                  style={{
                    background: "red",
                    color: "white",
                    padding: "8px 15px",
                    border: "none",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {showCommitteeForm && (
            <div
              className="committee-form"
              style={{
                border: "1px solid #ccc",
                padding: "15px",
                borderRadius: "5px",
                marginBottom: "15px",
              }}
            >
              <h4>Assign Committee for Project: {committeeProjectId}</h4>

              {allDoctorsForCommittee.length > 0 ? (
                <>
                  <div style={{ marginBottom: "15px" }}>
                    <label style={{ display: "block", marginBottom: "5px" }}>
                      Committee Chair:
                    </label>
                    <select
                      value={committeeMembers.CommitteeChair || ""}
                      onChange={(e) =>
                        handleCommitteeMemberSelect(
                          "CommitteeChair",
                          e.target.value
                        )
                      }
                      style={{ width: "100%", padding: "5px" }}
                    >
                      <option value="">Select Committee Chair</option>
                      {allDoctorsForCommittee.map((doctor) => (
                        <option key={doctor.id} value={doctor.id}>
                          {doctor.firstName} {doctor.lastName} -{" "}
                          {doctor.specialization}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginBottom: "15px" }}>
                    <label style={{ display: "block", marginBottom: "5px" }}>
                      Internal Examiner:
                    </label>
                    <select
                      value={committeeMembers.InternalExaminer || ""}
                      onChange={(e) =>
                        handleCommitteeMemberSelect(
                          "InternalExaminer",
                          e.target.value
                        )
                      }
                      style={{ width: "100%", padding: "5px" }}
                    >
                      <option value="">Select Internal Examiner</option>
                      {allDoctorsForCommittee.map((doctor) => (
                        <option key={doctor.id} value={doctor.id}>
                          {doctor.firstName} {doctor.lastName} -{" "}
                          {doctor.specialization}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginBottom: "15px" }}>
                    <label style={{ display: "block", marginBottom: "5px" }}>
                      External Examiner:
                    </label>
                    <select
                      value={committeeMembers.ExternalExaminer || ""}
                      onChange={(e) =>
                        handleCommitteeMemberSelect(
                          "ExternalExaminer",
                          e.target.value
                        )
                      }
                      style={{ width: "100%", padding: "5px" }}
                    >
                      <option value="">Select External Examiner</option>
                      {allDoctorsForCommittee.map((doctor) => (
                        <option key={doctor.id} value={doctor.id}>
                          {doctor.firstName} {doctor.lastName} -{" "}
                          {doctor.specialization}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <button
                      onClick={submitCommitteeAssignment}
                      style={{
                        background: "green",
                        color: "white",
                        padding: "8px 15px",
                        border: "none",
                        marginRight: "10px",
                      }}
                    >
                      Assign Committee
                    </button>
                    <button
                      onClick={() => setShowCommitteeForm(false)}
                      style={{
                        background: "red",
                        color: "white",
                        padding: "8px 15px",
                        border: "none",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <p>Loading doctors...</p>
              )}
            </div>
          )}

          <div style={{ marginBottom: "15px" }}>
            <h4>Assign Committee to Existing Project</h4>
            <div style={{ display: "flex", alignItems: "center" }}>
              <input
                type="text"
                placeholder="Enter Project ID"
                value={committeeProjectId}
                onChange={(e) => setCommitteeProjectId(e.target.value)}
                style={{ padding: "5px", marginRight: "10px" }}
              />
              <button
                onClick={() => assignCommitteeToProject(committeeProjectId)}
                style={{
                  background: "#007bff",
                  color: "white",
                  padding: "5px 10px",
                  border: "none",
                }}
              >
                Load Project
              </button>
            </div>
          </div>

          {committees.length === 0 ? (
            <p className="hn-pAdmin">No committees found</p>
          ) : (
            committees.map((comm) => (
              <div
                key={comm.projectId}
                className="list-item"
                style={{
                  marginBottom: 25,
                  border: "1px solid #ccc",
                  padding: 10,
                  borderRadius: 5,
                }}
              >
                <h4>Project: {comm.projectId}</h4>
                {comm.schedule && (
                  <p>
                    Schedule: {comm.schedule.date} | {comm.schedule.startTime} -{" "}
                    {comm.schedule.endTime} | Location: {comm.schedule.location}
                  </p>
                )}
                <strong>Members:</strong>
                <ul>
                  {comm.members.map((m) => (
                    <li key={m.doctorId}>
                      {m.name} ({m.role})
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}

          <div className="pagination" style={{ marginTop: 10 }}>
            <button
              onClick={() => setCommitteesPage((p) => Math.max(p - 1, 1))}
              disabled={committeesPage === 1}
            >
              Prev
            </button>
            <span style={{ margin: "0 10px" }}>
              Page {committeesPage} of {committeesTotalPages}
            </span>
            <button
              onClick={() =>
                setCommitteesPage((p) => Math.min(p + 1, committeesTotalPages))
              }
              disabled={
                committeesPage === committeesTotalPages ||
                committeesTotalPages === 0
              }
            >
              Next
            </button>
          </div>
        </>
      ),
    },
  ];

  return (
    <div>
      <h3 className="adminDash">Admin Dashboard</h3>
      {sections.map((section, index) => (
        <div key={index} className="group-card">
          <div
            className="group-header"
            style={{
              display: "flex",
              justifyContent: "space-between",
              cursor: "pointer",
            }}
            onClick={() =>
              setExpandedSection(expandedSection === index ? null : index)
            }
          >
            <h4>{section.title}</h4>
            <span>{expandedSection === index ? "▲" : "▼"}</span>
          </div>
          {expandedSection === index && (
            <div style={{ marginTop: 10 }}>{section.content}</div>
          )}
        </div>
      ))}
    </div>
  );
};

export default AdminDashboard;
