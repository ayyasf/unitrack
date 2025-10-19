import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchWithAuth } from "../LogIn/LogInFetchWithAuth";

const StageSubmissions = () => {
  const { stageId } = useParams(); 
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await fetchWithAuth(`/api/v1/stages/${stageId}/submissions`);
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

  if (loading) return <p>Loading submissions...</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Stage Submissions</h2>
      {submissions.length === 0 ? (
        <p>No submissions yet.</p>
      ) : (
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-2 py-1">Submitted By</th>
              <th className="border px-2 py-1">File</th>
              <th className="border px-2 py-1">Attempt</th>
              <th className="border px-2 py-1">Final</th>
              <th className="border px-2 py-1">Submitted At</th>
              <th className="border px-2 py-1">Score</th>
              <th className="border px-2 py-1">Comment</th>
              <th className="border px-2 py-1">Evaluation Result</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((sub, idx) => (
              <tr key={idx} className="text-center">
                <td className="border px-2 py-1">{sub.submittedById}</td>
                <td className="border px-2 py-1">
                  <a href={sub.filePath} target="_blank" rel="noopener noreferrer">
                    View File
                  </a>
                </td>
                <td className="border px-2 py-1">{sub.attempNumber}</td>
                <td className="border px-2 py-1">{sub.isFinal ? "Yes" : "No"}</td>
                <td className="border px-2 py-1">
                  {new Date(sub.submittedAt).toLocaleString()}
                </td>
                <td className="border px-2 py-1">{sub.evaluation?.score ?? "-"}</td>
                <td className="border px-2 py-1">{sub.evaluation?.comment ?? "-"}</td>
                <td className="border px-2 py-1">{sub.evaluation?.evaluationResult ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default StageSubmissions;