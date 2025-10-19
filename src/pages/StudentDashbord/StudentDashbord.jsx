


import React, { useEffect, useState } from "react";
import "./StudentDashbord.css";
import { fetchWithAuth } from "../LogIn/LogInFetchWithAuth";

const StudentDashboard = () => {
  const [group, setGroup] = useState(null);
  const [project, setProject] = useState(null);
  const [stages, setStages] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [defense, setDefense] = useState(null);
  const [committee, setCommittee] = useState(null);
  const [expandedPhase, setExpandedPhase] = useState(null);


  useEffect(() => {
    const loadGroup = async () => {
      try {
        const res = await fetchWithAuth("/api/v1/groups/me");
        const data = await res.json();
        setGroup(data);

        if (data?.id) {
          loadProject(data.id);
          loadProposals(data.id);
        }
      } catch (err) {
        console.error("Error fetching group:", err);
      }
    };
    loadGroup();
  }, []);

  // 🟢 تحميل المشروع
  const loadProject = async (groupId) => {
    try {
      const res = await fetchWithAuth( `/api/v1/groups/${groupId}/project`);
      const proj = await res.json();
      setProject(proj);

      if (proj?.id) {
        loadStages(proj.id);
        loadDefense(proj.id);
        loadCommittee(proj.id);
      }
    } catch (err) {
      console.error("Error fetching project:", err);
    }
  };

  
  const loadStages = async (projectId) => {
    try {
      const res = await fetchWithAuth(`/api/v1/projects/${projectId}/stages`);
      const data = await res.json();
      setStages(data.stages || []);
    } catch (err) {
      console.error("Error fetching stages:", err);
    }
  };

 
  const loadProposals = async (groupId) => {
    try {
      const res = await fetchWithAuth(`/api/v1/groups/${groupId}/proposals`);
      const data = await res.json();
      setProposals(data.proposalsByRound || []);
    } catch (err) {
      console.error("Error fetching proposals:", err);
    }
  };

  
  const loadDefense = async (projectId) => {
    try {
      const res = await fetchWithAuth(`/api/v1/projects/${projectId}/defense-schedule`);
      const data = await res.json();
      setDefense(data);
    } catch (err) {
      console.error("Error fetching defense schedule:", err);
    }
  };

 
  const loadCommittee = async (projectId) => {
    try {
      const res = await fetchWithAuth(`/api/v1/projects/${projectId}/defense-committee`);
      const data = await res.json();
      setCommittee(data);
    } catch (err) {
      console.error("Error fetching defense committee:", err);
    }
  };

  return (
    <div className="hn-studentAll">
      <div className="hn-studentDashbord">
        <h2 className="hn-h2Student">Student Dashboard</h2>

        {}
        <div className="bg-white shadow rounded p-4">
          <p className="hn-P">Group Code: {group?.code ?? ""}</p>
          <p className="hn-P">Doctor ID: {group?.doctorId ?? ""}</p>
          <p className="hn-P">Members:</p>
          <ul className="list-disc list-inside ml-4">
            {group?.students?.map((student) => (
              <li key={student.id}>
                {student.firstName} {student.lastName} ({student.univNum}){" "}
                {student.isLeader && <strong>(Leader)</strong>}
              </li>
            ))}
          </ul>
        </div>

        {}
        {project && (
          <div className="bg-white shadow rounded p-4 mt-4">
            <h3 className="hn-h3Project">Project Details</h3>
            <p><strong>Title:</strong> {project.title}</p>
            <p><strong>Description:</strong> {project.description}</p>
            <p><strong>Status:</strong> {project.status}</p>
            {project.filePath && (
              <p>
                <a
                  href={project.filePath}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 underline"
                >
                  Download Project File
                </a>
              </p>
            )}
          </div>
        )}

        {}
        <div className="bg-white shadow rounded p-4 mt-4">
          <h3 className="hn-h3Project">Project Proposals</h3>
          {proposals.length > 0 ? (
            proposals.map((round) => (
              <div key={round.submissionRound} className="mb-3">
                <h4>Round {round.submissionRound}</h4>
                <ul className="list-disc list-inside ml-4">
                  {round.proposals.map((p) => (
                    <li key={p.id}>
                      <strong>{p.title}</strong> ({p.status}) -{" "}
                      <a
                        href={p.filePath || p.file}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 underline"
                      >
                        File
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <p className="hn-pAdmin">No proposals submitted yet.</p>
          )}
        </div>

        {}
        <div className="bg-white shadow rounded p-4 mt-4">
          <h3 className="hn-h3Project">Project Phases</h3>
          {stages.map((phase) => (
            <div key={phase.id} className="border rounded mb-3 p-3 bg-gray-50">
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
                  <p><strong>Description:</strong> {phase.description}</p>
                  <p><strong>Order:</strong> {phase.order}</p>
                  <p><strong>Deadline:</strong> {phase.deadLine || phase.deadline}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {}
        <div className="bg-white shadow rounded p-4 mt-4">
          <h3>Defense Schedule / مواعيد المناقشة</h3>
          {defense ? (
            <p>
              {defense.date} ({defense.startTime} - {defense.endTime}) @{" "}
              {defense.location}
            </p>
          ) : (
            <p className="hn-pAdmin">No defense scheduled yet.</p>
          )}
        </div>

        {}
        <div className="bg-white shadow rounded p-4 mt-4">
          <h3>Defense Committee</h3>
          {committee?.members?.length > 0 ? (
            <ul className="list-disc list-inside ml-4">
              {committee.members.map((m) => (
                <li key={m.doctorId}>
                  {m.name} - {m.role}
                </li>
              ))}
            </ul>
          ) : (
            <p className="hn-pAdmin">No committee assigned yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;