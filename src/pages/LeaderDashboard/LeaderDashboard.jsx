

import React, { useState, useEffect } from "react";
import "./LeaderDashboard.css";
import { fetchWithAuth } from "../LogIn/LogInFetchWithAuth";
import { Link, useNavigate } from "react-router-dom";

const LeaderDashboard = () => {
  const [expandedPhase, setExpandedPhase] = useState(null);
  const [group, setGroup] = useState(null);
  const [phases, setPhases] = useState([]);
  const [committees, setCommittees] = useState([]);
  const [project, setProject] = useState(null); 
  const [solutionsInput, setSolutionsInput] = useState({});
  const navigate = useNavigate();

    useEffect(() => {
    const fetchGroup = async () => {
      try {
        const res = await fetchWithAuth("/api/v1/groups/me");
        const data = await res.json();
        const mappedGroup = {
          id: data.id,
          number: data.code,
          doctor: data.doctorId,
          members: data.students.map(
            (s) =>
              `${s.firstName} ${s.lastName} - ${s.univNum}${
                s.isLeader ? " (Leader)" : ""
              }`
          ),
          projectId: data.projectId,
        };
        setGroup(mappedGroup);

        if (data.id) {
          fetchProject(data.id); 
        }
        if (data.projectId) {
          fetchPhases(data.projectId);
          fetchCommittees(data.projectId);
        }
      } catch (err) {
        console.error("Error fetching group:", err);
      }
    };
    fetchGroup();
  }, []);

  
  const fetchProject = async (groupId) => {
    try {
      const res = await fetchWithAuth(`/api/v1/groups/${groupId}/project`);
      const data = await res.json();
      setProject(data);
    } catch (err) {
      console.error("Error fetching project:", err);
    }
  };


  const fetchPhases = async (projectId) => {
    try {
      const res = await fetchWithAuth(`/api/v1/projects/${projectId}/stages`);
      const data = await res.json();
      setPhases(data.stages || []);
    } catch (err) {
      console.error("Error fetching phases:", err);
    }
  };


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
          id: schedule.id,
          date: schedule.date,
          time:` ${schedule.startTime} - ${schedule.endTime}`,
          location: schedule.location,
          members: committee.members || [],
        },
      ]);
    } catch (err) {
      console.error("Error fetching committees:", err);
    }
  };
  

  
  const handleSubmitSolution = async (stageid, e) => {
    e.preventDefault();
    const file = solutionsInput[stageid];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append("submissionFile", file);
      await fetchWithAuth(`/api/v1/stages/${stageid}/submissions`, {
        method: "POST",
        body: formData,
      });
      alert(`Solution file submitted for phase ${stageid}`);
      setSolutionsInput((prev) => ({ ...prev, [stageid]: null }));
    } catch (error) {
      console.error("Error submitting solution:", error);
    }
  };

  return (
    <div className="hn-studentAll">
      <div className="hn-studentDashbord">
        <h2 className="hn-h2Student">Leader Dashboard</h2>

        {}
        <div className="bg-white shadow rounded p-4">
          <p className="hn-P">Group Number: {group?.number ?? ""}</p>
          <p className="hn-P">Doctor: {group?.doctor ?? ""}</p>
          <p className="hn-P">Members:</p>
          <ul className="list-disc list-inside ml-4">
            {group?.members?.map((member, idx) => (
              <li key={idx}>{member}</li>
            ))}
          </ul>
          <div >
                <Link to={'/projectIdeas'} className="hn-link">idea</Link>
        <Link to={'/selectdoctor'} className="hn-link">doctor</Link>
          </div>
        </div>

        {}
        {project && (
          <div className="bg-white shadow rounded p-4 mt-4">
            <h3 className="hn-h3Project">Project Info</h3>
            <p><strong>Title:</strong> {project.title}</p>
            <p><strong>Started At:</strong> {new Date(project.startedAt).toLocaleDateString()}</p>
            <p><strong>Finished At:</strong> {new Date(project.finishedAt).toLocaleDateString()}</p>
            <p>
              <strong>Final Evaluation:</strong>{" "}
              {project.finalEvaluation
                ?`${project.finalEvaluation.score} - ${project.finalEvaluation.comment}`
                : "Not evaluated yet"}
            </p>
          </div>
        )}

        {}
        <div className="bg-white shadow rounded p-4 mt-4">
          <h3 className="hn-h3Project">Project Phases</h3>
          {phases.map((phase) => (
            <div
              key={phase.id}
              className="border rounded mb-3 p-3 bg-gray-50"
            >
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() =>
                  setExpandedPhase(expandedPhase === phase.id ? null : phase.id)
                }
              >
                <h3 className="font-medium">{phase.name}</h3>
                <span>{expandedPhase === phase.id ? "▲" : "▼"}</span>
              </div>
              {expandedPhase === phase.id && (
                <div className="mt-3 text-sm space-y-2">
                  <p>Description: {phase.description}</p>
                  <p>Order: {phase.order}</p>
                  <p>Deadline: {phase.deadLine}</p>

                  <button
                    onClick={() => navigate(`/submitStage/${phase.id}`)}
                    className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
                  >
                    View Submissions
                  </button>

                  {}
                  <form
                    onSubmit={(e) => handleSubmitSolution(phase.id, e)}
                    className="mt-2 flex gap-2"
                  >
                    <input
                      type="file"
                      onChange={(e) =>
                        setSolutionsInput((prev) => ({
                          ...prev,
                          [phase.id]: e.target.files[0],
                        }))
                      }
                      className="border rounded p-2 flex-1"
                      required
                    />
                    <button
                      type="submit"
                      className="bg-green-500 text-white px-4 py-2 rounded"
                    >
                      Submit the solution
                    </button>
                  </form>
                </div>
              )}
            </div>
          ))}
        </div>

        {}
        <div className="bg-white shadow rounded p-4 mt-4">
          <h3>Discussion Committees / مواعيد المناقشات</h3>
          {committees.length > 0 ? (
            <ul className="list-disc list-inside ml-4">
              {committees.map((committee) => (
                <li key={committee.id}>
                  <strong>Location:</strong> {committee.location} <br />
                  <strong>Date:</strong> {committee.date} <br />
                  <strong>Time:</strong> {committee.time}
                  <ul>
                    {committee.members.map((m) => (
                      <li key={m.doctorId}>
                        {m.name} ({m.role})
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          ) : (
            <p className="hn-pAdmin">
              No discussion times are currently available.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaderDashboard;

