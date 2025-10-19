


import React, { useState, useEffect } from "react";
import "./SelectTheDoctor.css";
import { fetchWithAuth } from "../LogIn/LogInFetchWithAuth";

const SelectTheDoctor = () => {
  const [preferences, setPreferences] = useState(["", "", ""]); 
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchDoctors = async () => {
      try {
       
        const meRes = await fetchWithAuth("/api/v1/auth/me");
        const me = await meRes.json();

        if (!me?.specialization) {
          alert("لم يتم تحديد التخصص للطالب");
          setLoading(false);
          return;
        }

    
        const docRes = await fetchWithAuth(
          `/api/v1/doctors?Specialization=${me.specialization}&IsActive=true&Page=1&PageSize=100`
        );
        const docData = await docRes.json();

        setDoctors(docData.items || []);
      } catch (err) {
        console.error("Error fetching doctors:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const handleChange = (index, value) => {
    const updated = [...preferences];
    updated[index] = value;
    setPreferences(updated);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();


    const filtered = preferences.filter((p) => p.trim() !== "");

    if (filtered.length === 0) {
      alert("الرجاء اختيار على الأقل دكتور واحد");
      return;
    }

  
    const unique = new Set(filtered);
    if (unique.size !== filtered.length) {
      alert("لا يمكنك اختيار نفس الدكتور أكثر من مرة!");
      return;
    }

  
    const body = {
      prefernces: filtered.map((id, idx) => ({
        id,
        priority: idx + 1,
      })),
    };

    try {
      await fetchWithAuth("/api/v1/groups/doctor-preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      alert("تم حفظ الرغبات بنجاح ✅");
    } catch (err) {
      console.error("Error submitting preferences:", err);
      alert("فشل إرسال الرغبات");
    }
  };

  return (
    <div className="hn-allInterface">
      <h2 className="hn-h2Student">Professor selection preferences</h2>

      {loading ? (
        <p>جارٍ تحميل قائمة الدكاترة...</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3 hn-input">
          {preferences.map((pref, idx) => (
            <select
              key={idx}
              value={pref}
              onChange={(e) => handleChange(idx, e.target.value)}
              className="hn-field6"
            >
              <option value="">اختر الدكتور (الأولوية {idx + 1})</option>
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.firstName} {doc.lastName}
                </option>
              ))}
            </select>
          ))}

          <button type="submit" className="hn-button1">
            Save The Preferences
          </button>
        </form>
      )}
    </div>
  );
};

export default SelectTheDoctor;