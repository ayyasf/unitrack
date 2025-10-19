import React, { useEffect, useState } from 'react';
import './ProjectIdeaApproval.css'; 
export default function ProjectIdeaApproval() {
  const [groupIdeas, setGroupIdeas] = useState({});
  const [selectedIdeas, setSelectedIdeas] = useState({});

  useEffect(() => {
    const savedIdeas = JSON.parse(localStorage.getItem("allGroupIdeas")) || {};
    const selected = JSON.parse(localStorage.getItem("selectedIdeas")) || {};
    setGroupIdeas(savedIdeas);
    setSelectedIdeas(selected);
  }, []);

  const handleSelectIdea = (groupId, ideaIndex) => {
    const updatedSelection = {
      ...selectedIdeas,
      [groupId]: ideaIndex
    };
    setSelectedIdeas(updatedSelection);
    localStorage.setItem("selectedIdeas", JSON.stringify(updatedSelection));
  };

  return (
    <div className="hn-supervisor-container">
      <h2> Supervisor - Select Project Idea</h2>

      {Object.keys(groupIdeas).length === 0 ? (
        <p>No ideas submitted yet.</p>
      ) : (
        Object.entries(groupIdeas).map(([groupId, ideas]) => (
          <div key={groupId} className="hn-group-card">
            <h3>Group: {groupId}</h3>
            <div className="hn-ideas-grid">
              {ideas.map((idea, index) => (
                <div key={index} className="hn-idea-card">
                  <h4>{idea.title}</h4>
                  <p><strong>Description:</strong> {idea.description}</p>
                  <p><strong>Priority:</strong> {idea.priority}</p>
                  <p><strong>File:</strong> {idea.fileName}</p>

                  <button
                    onClick={() => handleSelectIdea(groupId, index)}
                    className={`hn-select-button" ${
                      selectedIdeas[groupId] === index ? "hn-selected" : ""
                    }`}
                  >
                    {selectedIdeas[groupId] === index ? "✅ Selected" : "Select this idea"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
