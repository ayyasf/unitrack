


import React, { useState } from 'react';
import './ProjectIdeasForm.css';
import { fetchWithAuth } from "../LogIn/LogInFetchWithAuth";

export default function ProjectIdeasForm() {
  const [ideas, setIdeas] = useState([
    { title: "", description: "", priority: "", file: null },
    { title: "", description: "", priority: "", file: null },
    { title: "", description: "", priority: "", file: null }
  ]);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (index, field, value) => {
    const updatedIdeas = [...ideas];
    updatedIdeas[index][field] = value;
    setIdeas(updatedIdeas);
  };

  const handleFileChange = (index, file) => {
    const updatedIdeas = [...ideas];
    updatedIdeas[index].file = file;
    setIdeas(updatedIdeas);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const allFilled = ideas.every(
      (idea) =>
        idea.title.trim() !== "" &&
        idea.description.trim() !== "" &&
        idea.priority.trim() !== "" &&
        idea.file !== null
    );

    if (!allFilled) {
      alert("Please fill in all fields for all ideas.");
      return;
    }

 
    const groupId = localStorage.getItem("groupId");
    if (!groupId) {
      alert("Group ID not found. Please log in or join a group first.");
      return;
    }

    try {
     
      const formData = new FormData();
      ideas.forEach((idea, index) => {
        formData.append(`proposals[${index}].title`, idea.title);
        formData.append(`proposals[${index}].description`, idea.description);
        formData.append(`proposals[${index}].file`, idea.file);
        formData.append(`proposals[${index}].priority`, index + 1); 
      });

     
      const res = await fetchWithAuth(`/api/groups/${groupId}/proposals`, {
        method: "POST",
        body: formData,
      });

      if (res.status === 204) {
        alert("✅ Ideas submitted successfully!");
        setSubmitted(true);
        setIdeas([
          { title: "", description: "", priority: "", file: null },
          { title: "", description: "", priority: "", file: null },
          { title: "", description: "", priority: "", file: null }
        ]);
      } else {
        const errMsg = await res.text();
        alert("❌ Failed to submit ideas: " + errMsg);
      }
    } catch (error) {
      console.error("Error submitting proposals:", error);
      alert("❌ Error submitting proposals. Check console for details.");
    }
  };

  return (
    <div className="hn-projectIdea">
      <h3>Project Ideas Presentation</h3>
      {submitted && (
        <div className="hn-sucess">
          ✅ Ideas Have Been Successfully Submitted!
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        {ideas.map((idea, index) => (
          <div key={index} className="hn-inputes">
            <h4>Idea {index + 1}:</h4>
            <label className='hn-labelIdea'>Title:</label>
            <input
              type="text"
              value={idea.title}
              onChange={(e) => handleChange(index, "title", e.target.value)}
              className="hn-inputIdea"
              placeholder={`Enter title for idea ${index + 1}`}
              required
            />
            <label className='hn-labelIdea'>Description:</label>
            <textarea
              value={idea.description}
              onChange={(e) => handleChange(index, "description", e.target.value)}
              className="hn-inputIdeaTextArea"
              placeholder={`The Description ${index + 1}`}
              required
            />
            <label className='hn-labelIdea'>Priority:</label>
            <select
            value={idea.priority}
              onChange={(e) => handleChange(index, "priority", e.target.value)}
              className="hn-inputIdea"
              required
            >
              <option value="">Select Priority</option>
              <option value="1">High</option>
              <option value="2">Medium</option>
              <option value="3">Low</option>
            </select>
            <label className='hn-labelIdea'>Upload File:</label>
            <input
              type="file"
              onChange={(e) => handleFileChange(index, e.target.files[0])}
              className="hn-inputFile"
              required
            />
          </div>
        ))}
        <div className="hn-button">
          <button className="hn-button2" type="submit">
            Submit Ideas
          </button>
        </div>
      </form>
    </div>
  );
}