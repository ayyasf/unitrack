  
import React, { useEffect, useState } from "react";
import { fetchWithAuth } from "../LogIn/LogInFetchWithAuth";
import "./DoctorDashboard.css";

const DoctorDashboard = () => {
  const [doctorId, setDoctorId] = useState(null);
  const [groups, setGroups] = useState([]);
  const [projects, setProjects] = useState([]);
  const [committees, setCommittees] = useState([]);
  const [activeTab, setActiveTab] = useState("groups");
  const [loading, setLoading] = useState(true);

  // Fetch doctor info
  const fetchDoctorInfo = async () => {
    try {
      const res = await fetchWithAuth("/api/v1/auth/me");
      if (!res.ok) throw new Error("Failed to fetch doctor info");
      const data = await res.json();
      setDoctorId(data.id);
      return data.id;
    } catch (err) {
      console.error("Error fetching doctor info:", err);
      throw err;
    }
  };

  // Fetch doctor groups
  const fetchDoctorGroups = async (id) => {
    try {
      const res = await fetchWithAuth(`/api/v1/doctors/${id}/groups`);
      if (!res.ok) throw new Error("Failed to fetch doctor groups");
      const data = await res.json();
      setGroups(data.groups || []);
    } catch (err) {
      console.error("Error fetching doctor groups:", err);
    }
  };

  // Fetch all projects for doctor
  const fetchDoctorProjects = async () => {
    try {
      const res = await fetchWithAuth("/api/v1/projects");
      if (!res.ok) throw new Error("Failed to fetch doctor projects");
      const data = await res.json();
      setProjects(data || []);
    } catch (err) {
      console.error("Error fetching doctor projects:", err);
    }
  };

  // Fetch committees for doctor
  const fetchDoctorCommittees = async (id) => {
    try {
      const res = await fetchWithAuth(`/api/v1/defense-committees/doctor/${id}`);
      if (!res.ok) throw new Error("Failed to fetch doctor committees");
      const data = await res.json();
      setCommittees(data.items || []);
    } catch (err) {
      console.error("Error fetching doctor committees:", err);
    }
  };

  // Load all data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const id = await fetchDoctorInfo();
        await Promise.all([
          fetchDoctorGroups(id),
          fetchDoctorProjects(),
          fetchDoctorCommittees(id)
        ]);
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) return <div className="doctor-loading">Loading...</div>;
  if (!doctorId) return <p className="doctor-error">Doctor not found</p>;

  return (
    <div className="doctor-dashboard">
      <header className="doctor-header">
        <h1>Supervisor Dashboard</h1>
        <p>Manage your groups, projects, and committees</p>
      </header>

      {/* Navigation Tabs */}
      <div className="doctor-tabs">
        <button
          className={`doctor-tab ${activeTab === "groups" ? "active" : ""}`}
          onClick={() => setActiveTab("groups")}
        >
          Groups ({groups.length})
        </button>
        <button
          className={`doctor-tab ${activeTab === "projects" ? "active" : ""}`}
          onClick={() => setActiveTab("projects")}
        >
          Projects ({projects.length})
        </button>
        <button
          className={`doctor-tab ${activeTab === "committees" ? "active" : ""}`}
          onClick={() => setActiveTab("committees")}
        >
          Committees ({committees.length})
        </button>
      </div>

      {/* Content based on active tab */}
      <div className="doctor-content">
        {activeTab === "groups" && <GroupsSection groups={groups} />}
        {activeTab === "projects" && <ProjectsSection projects={projects} />}
        {activeTab === "committees" && <CommitteesSection committees={committees} />}
      </div>
    </div>
  );
};

// Groups Section Component
const GroupsSection = ({ groups }) => {
  const [expandedGroup, setExpandedGroup] = useState(null);
  const [expandedProposals, setExpandedProposals] = useState(null);

  if (groups.length === 0) {
    return (
      <div className="doctor-card">
        <p className="no-data">No groups found</p>
      </div>
    );
  }

  return (
    <div className="groups-section">
      <h2>Supervised Groups</h2>

      {groups.map((group) => (
        <div key={group.groupid} className="doctor-card group-card">
          <div
            className="group-header"
            onClick={() => setExpandedGroup(expandedGroup === group.groupid ? null : group.groupid)}
          >
            <div>
              <h3>{group.name} ({group.code})</h3>
              <p>
                {group.totalStudents} students • Created: {new Date(group.createdAt).toLocaleDateString()}
              </p>
            </div>
            <span className="expand-icon">
              {expandedGroup === group.groupid ? '▲' : '▼'}
            </span>
          </div>

          {expandedGroup === group.groupid && (
            <div className="group-details">
              {/* Students List */}
              <div className="students-list">
                <h4>Students</h4>
                <div className="students-grid">
                  {group.students.map((student) => (
                    <div key={student.id} className="student-item">
                      <div className="student-avatar">
                        {student.firstName[0]}{student.lastName[0]}
                      </div>
                      <div className="student-info">
                        <p className="student-name">{student.firstName} {student.lastName}</p>
                        <p className="student-id">{student.univNum}{student.isLeader && " • Leader"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Proposals Section */}
              <div className="proposals-section">
                <div className="proposals-header">
                  <h4>Proposals</h4>
                  <button
                    className="toggle-proposals"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedProposals(expandedProposals === group.groupid ? null : group.groupid);
                    }}
                  >
                    {expandedProposals === group.groupid ? 'Hide' : 'Show'} Proposals
                  </button>
                </div>

                {expandedProposals === group.groupid && (
                  <GroupProposals groupId={group.groupid} />
                )}
              </div>

              {/* Project Section */}
              {group.projectId && (
                <div className="project-section">
                  <h4>Project</h4>
                  <GroupProject projectId={group.projectId} groupId={group.groupid} />
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Group Proposals Component
const GroupProposals = ({ groupId }) => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const res = await fetchWithAuth(`/api/v1/groups/${groupId}/proposals`);
        const data = await res.json();
        setProposals(data.proposalsByRound || []);
      } catch (err) {
        console.error("Error fetching proposals:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProposals();
  }, [groupId]);

  const handleProposalAction = async (proposalId, action) => {
    try {
      const endpoint = action === 'accept'
        ? `/api/v1/groups/${groupId}/proposals/${proposalId}/accept`
        : `/api/v1/groups/${groupId}/proposals/${proposalId}/reject`;

      const res = await fetchWithAuth(endpoint, { method: 'POST' });

      if (res.ok) {
        // Refresh proposals after action
        const updatedRes = await fetchWithAuth(`/api/v1/groups/${groupId}/proposals`);
        const data = await updatedRes.json();
        setProposals(data.proposalsByRound || []);
      } else {
        console.error(`Failed to ${action} proposal`);
      }
    } catch (err) {
      console.error(`Error ${action}ing proposal:`, err);
    }
  };

  if (loading) return <div className="loading-small">Loading proposals...</div>;

  if (proposals.length === 0) return <p className="no-data">No proposals found</p>;

  return (
    <div className="proposals-list">
      {proposals.map((round) => (
        <div key={round.submissionRound} className="proposal-round">
          <h5>Round {round.submissionRound}</h5>

          {round.proposals.map((proposal) => (
            <div key={proposal.id} className="proposal-item">
              <div className="proposal-content">
                <h6>{proposal.title}</h6>
                <p>{proposal.description}</p>
                <div className="proposal-meta">
                  <span>Priority: {proposal.priority}</span>
                  <span className={`status status-${proposal.status.toLowerCase()}`}>
                    {proposal.status}
                  </span>
                </div>
              </div>

              {proposal.status === 'Pending' && (
                <div className="proposal-actions">
                  <button
                    onClick={() => handleProposalAction(proposal.id, 'accept')}
                    className="btn btn-success"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleProposalAction(proposal.id, 'reject')}
                    className="btn btn-danger"
                  >
                    Reject
                  </button>
                </div>
              )}

              {proposal.filePath && (
                <div className="proposal-file">
                  <a
                    href={proposal.filePath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="file-link"
                  >
                    View Proposal
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

// Group Project Component
const GroupProject = ({ projectId, groupId }) => {
  const [project, setProject] = useState(null);
  const [expandedStages, setExpandedStages] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetchWithAuth(`/api/v1/groups/${groupId}/project`);
        const data = await res.json();
        setProject(data);
      } catch (err) {
        console.error("Error fetching project:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [groupId, projectId]);

  if (loading) return <div className="loading-small">Loading project...</div>;
  if (!project) return <p className="no-data">No project found</p>;

  return (
    <div className="project-card">
      <div className="project-header">
        <div>
          <h5>{project.title}</h5>
          <p>{project.description}</p>
          <div className="project-meta">
            <span className={`status status-${project.status.toLowerCase()}`}>
              {project.status}
            </span>
            {project.finalEvaluation && (
              <span className="score">
                Score: {project.finalEvaluation.score}/10
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => setExpandedStages(!expandedStages)}
          className="toggle-stages"
        >
          {expandedStages ? 'Hide' : 'Show'} Stages
        </button>
      </div>

      {project.filePath && (
        <div className="project-file">
          <a
            href={project.filePath}
            target="_blank"
            rel="noopener noreferrer"
            className="file-link"
          >
            Project Document
          </a>
        </div>
      )}

      {expandedStages && (
        <ProjectStages projectId={projectId} />
      )}
    </div>
  );
};

// Project Stages Component
const ProjectStages = ({ projectId }) => {
  const [stages, setStages] = useState([]);
  const [expandedStage, setExpandedStage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStages = async () => {
      try {
        const res = await fetchWithAuth(`/api/v1/projects/${projectId}/stages`);
        const data = await res.json();
        setStages(data.stages || []);
      } catch (err) {
        console.error("Error fetching stages:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStages();
  }, [projectId]);

  if (loading) return <div className="loading-small">Loading stages...</div>;
  if (stages.length === 0) return <p className="no-data">No stages found</p>;

  return (
    <div className="stages-list">
      <h6>Project Stages</h6>
      <div className="stages-container">
        {stages.map((stage) => (
          <div key={stage.id} className="stage-item">
            <div
              className="stage-header"
              onClick={() => setExpandedStage(expandedStage === stage.id ? null : stage.id)}
            >
              <div>
                <p className="stage-name">{stage.name}</p>
                <p className="stage-deadline">Deadline: {new Date(stage.deadLine).toLocaleDateString()}</p>
              </div>
              <span className="expand-icon">
                {expandedStage === stage.id ? '▲' : '▼'}
              </span>
            </div>

            {expandedStage === stage.id && (
              <StageSubmissions stageId={stage.id} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Stage Submissions Component
const StageSubmissions = ({ stageId }) => {
  const [submissions, setSubmissions] = useState([]);
  const [expandedSubmission, setExpandedSubmission] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await fetchWithAuth(`/api/v1/project-stages/${stageId}/submissions`);
        const data = await res.json();
        setSubmissions(data.submissions || []);
      } catch (err) {
        console.error("Error fetching submissions:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, [stageId]);

  if (loading) return <div className="loading-small">Loading submissions...</div>;
  if (submissions.length === 0) return <p className="no-data">No submissions yet</p>;

  return (
    <div className="submissions-list">
      <h6>Submissions</h6>
      <div className="submissions-container">
        {submissions.map((submission) => (
          <div key={submission.id} className="submission-item">
            <div
              className="submission-header"
              onClick={() => setExpandedSubmission(expandedSubmission === submission.id ? null : submission.id)}
            >
              <div>
                <p className="submission-attempt">Attempt #{submission.attempNumber}</p>
                <p className="submission-date">
                  Submitted: {new Date(submission.submittedAt).toLocaleString()}
                  {submission.isFinal && <span className="final-badge">Final</span>}
                </p>
              </div>
              <span className="expand-icon">
                {expandedSubmission === submission.id ? '▲' : '▼'}
              </span>
            </div>

            {expandedSubmission === submission.id && (
              <SubmissionEvaluation
                submission={submission}
                stageId={stageId}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Submission Evaluation Component
const SubmissionEvaluation = ({ submission, stageId }) => {
  const [score, setScore] = useState(submission.evaluation?.score || '');
  const [comment, setComment] = useState(submission.evaluation?.comment || '');
  const [evaluationResult, setEvaluationResult] = useState(submission.evaluation?.evaluationResult || 'NeedsReSubmission');
  const [saving, setSaving] = useState(false);

  const handleEvaluate = async () => {
    if (score === '' || comment === '') {
      alert('Please provide both score and comment');
      return;
    }

    const numScore = parseFloat(score);
    if (isNaN(numScore) || numScore < 0 || numScore > 10) {
      alert('Score must be a number between 0 and 10');
      return;
    }

    setSaving(true);
    try {
      const res = await fetchWithAuth(
        `/api/v1/project-submissions/${submission.id}/evaluate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            score: numScore,
            comment,
            evaluationResult
          }),
        }
      );

      if (res.ok) {
        alert('Evaluation submitted successfully');
        // Refresh the submissions
        const updatedRes = await fetchWithAuth(`/api/v1/project-stages/${stageId}/submissions`);
        const data = await updatedRes.json();
        // You would need to update the parent state here, but for simplicity we'll just reload the page
        window.location.reload();
      } else {
        alert('Failed to submit evaluation');
      }
    } catch (err) {
      console.error('Error evaluating submission:', err);
      alert('Error submitting evaluation');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="evaluation-form">
      <h6>Evaluate Submission</h6>

      <div className="form-grid">
        <div className="form-group">
          <label>Score (0-10)</label>
          <input
            type="number"
            min="0"
            max="10"
            step="0.1"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            placeholder="Enter score"
          />
        </div>

        <div className="form-group">
          <label>Result</label>
          <select
            value={evaluationResult}
            onChange={(e) => setEvaluationResult(e.target.value)}
          >
            <option value="NeedsReSubmission">Needs Re-Submission</option>
            <option value="Accepted">Accepted</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>Comments</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows="3"
          placeholder="Provide evaluation comments"
        />
      </div>

      {submission.filePath && (
        <div className="file-link-container">
          <a
            href={submission.filePath}
            target="_blank"
            rel="noopener noreferrer"
            className="file-link"
          >
            View Submission
          </a>
        </div>
      )}

      <button
        onClick={handleEvaluate}
        disabled={saving}
        className="btn btn-primary evaluate-btn"
      >
        {saving ? 'Submitting...' : 'Submit Evaluation'}
      </button>

      {submission.evaluation && (
        <div className="previous-evaluation">
          <h6>Previous Evaluation</h6>
          <p>Score: {submission.evaluation.score}</p>
          <p>Result: {submission.evaluation.evaluationResult}</p>
          <p>Comment: {submission.evaluation.comment}</p>
          <p className="evaluation-date">
            Evaluated on: {new Date(submission.evaluation.evaluatedAt).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
};

// Projects Section Component
const ProjectsSection = ({ projects }) => {
  const [expandedProject, setExpandedProject] = useState(null);

  if (projects.length === 0) {
    return (
      <div className="doctor-card">
        <p className="no-data">No projects found</p>
      </div>
    );
  }

  return (
    <div className="projects-section">
      <h2>All Projects</h2>

      {projects.map((project) => (
        <div key={project.id} className="doctor-card project-card-expandable">
          <div
            className="project-expandable-header"
            onClick={() => setExpandedProject(expandedProject === project.id ? null : project.id)}
          >
            <div>
              <h3>{project.title}</h3>
              <p>
                Status: {project.status} • Started: {new Date(project.startedAt).toLocaleDateString()}
              </p>
            </div>
            <span className="expand-icon">
              {expandedProject === project.id ? '▲' : '▼'}
            </span>
          </div>

          {expandedProject === project.id && (
            <div className="project-expandable-details">
              <p className="project-description">{project.description}</p>

              {project.filePath && (
                <div className="project-file">
                  <a
                    href={project.filePath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="file-link"
                  >
                    Project Document
                  </a>
                </div>
              )}

              {project.finalEvaluation && (
                <div className="final-evaluation">
                  <h4>Final Evaluation</h4>
                  <p>Score: {project.finalEvaluation.score}/10</p>
                  <p>Comment: {project.finalEvaluation.comment}</p>
                </div>
              )}

              <ProjectStages projectId={project.id} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Committees Section Component
const CommitteesSection = ({ committees }) => {
  if (committees.length === 0) {
    return (
      <div className="doctor-card">
        <p className="no-data">No committees found</p>
      </div>
    );
  }

  return (
    <div className="committees-section">
      <h2>Defense Committees</h2>

      {committees.map((committee) => (
        <div key={committee.projectId} className="doctor-card committee-card">
          <div className="committee-content">
            <h3>Committee for Project #{committee.projectId}</h3>

            <div className="committee-schedule">
              <h4>Schedule</h4>
              <p>
                Date: {committee.schedule.date} • Time: {committee.schedule.startTime} - {committee.schedule.endtime}
              </p>
              <p>Location: {committee.schedule.location}</p>
            </div>

            <div className="committee-members">
              <h4>Members</h4>
              <div className="members-grid">
                {committee.members.map((member) => (
                  <div key={member.doctorId} className="member-item">
                    <div className="member-avatar">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="member-info">
                      <p className="member-name">{member.name}</p>
                      <p className="member-role">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DoctorDashboard;
