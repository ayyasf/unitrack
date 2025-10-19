


import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Doctor.css";

export default function Doctor() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [specialization, setSpecialization] = useState("AI");
  const [photo, setPhoto] = useState(null);
  const [certification, setCertification] = useState(null);
  const [error, setError] = useState("");

  const navigate = useNavigate();
 const BASE_URL = "https://dk6m8bl1-7144.asse.devtunnels.ms"; // غيّرها لـ devtunnel إذا بدك

  const handleCreateDoctor = async () => {
    try {
      const formData = new FormData();
      formData.append("FirstName", firstName);
      formData.append("LastName", lastName);
      formData.append("Email", email);
      formData.append("Password", password);
      formData.append("Specialization", specialization);

      if (photo) formData.append("Photo", photo);
      if (certification) formData.append("Certification", certification);

      const res = await fetch(`${BASE_URL}/api/v1/accounts/doctor`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("فشل إنشاء حساب الدكتور");
      }

      const data = await res.json();
      console.log("Doctor created:", data);

      // نجاح → التوجيه لصفحة التفعيل
      navigate("/activating");
    } catch (err) {
      console.error(err);
      setError("حدث خطأ أثناء إنشاء الحساب");
    }
  };

  return (
    <div className="hn-doctor1">
      <h2>The Doctor Account</h2>
      <p>Create Account</p>

      <input
        type="text"
        placeholder="First Name"
        className="hn-field6"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Last Name"
       className="hn-field6"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
      />
      <input
        type="email"
        placeholder="Email"
       className="hn-field6"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
      className="hn-field6"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <select
       className="hn-field6"
        value={specialization}
        onChange={(e) => setSpecialization(e.target.value)}
      >
        <option value="AI">AI</option>
        <option value="Software">Software</option>
        <option value="Networking">Networking</option>
      </select>

      <label>Profile Photo:</label>
      <input
        type="file"
        className="hn-field6"
        onChange={(e) => setPhoto(e.target.files[0])}
      />

      <label>Portfolio of Certificates:</label>
      <input
        type="file"
        className="hn-field7"
        onChange={(e) => setCertification(e.target.files[0])}
      />

      {error && <p className="text-red-500">{error}</p>}

      <button className="hn-button1" onClick={handleCreateDoctor}>
        Create
      </button>
      <Link to={'/doctorDashboard'}>t</Link>
    </div>

  );
}