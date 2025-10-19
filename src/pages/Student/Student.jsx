


import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Student.css";
function InputField({ firstName, setFirstName, lastName, setLastName, email, setEmail, password, setPassword, specialization, setSpecialization }) {
  return (
    <div className="hn-input">
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
      <input
        type="text"
        placeholder="Specialization"
        list="fields"
        className="hn-field6"
        value={specialization}
        onChange={(e) => setSpecialization(e.target.value)}
      />
      <datalist id="fields">
        <option value="AI">AI</option>
        <option value="Software">Software</option>
        <option value="Networking">Networking</option>
      </datalist>
    </div>
  );
}

export default function StudentAccount() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [specialization, setSpecialization] = useState("Software");
  const [univNumber, setUnivNumber] = useState("");
  const [photo, setPhoto] = useState(null);
 
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const BASE_URL = "https://dk6m8bl1-7144.asse.devtunnels.ms"; 

  const handleCreate = async () => {
    try {
      const formData = new FormData();
      formData.append("FirstName", firstName);
      formData.append("LastName", lastName);
      formData.append("Email", email);
      formData.append("Password", password);
      formData.append("UnivNumber", univNumber);
      formData.append("Specialization", specialization);

      if (photo) formData.append("Photo", photo);
   

      const res = await fetch(`${BASE_URL}/api/v1/accounts/student`, {
        method: "POST",
        body: formData,
      });

      if (res.status !== 201) {
        throw new Error("فشل إنشاء الحساب");
      }

      const data = await res.json();
      console.log("✅ Student created:", data);

      if (
        data.message ===
        "Account created successfully. Please check your email to confirm and activate your account."
      ) {
        localStorage.setItem("pendingEmail", email);
        navigate("/implementation");
      } else {
        throw new Error("استجابة غير متوقعة من السيرفر");
      }
    } catch (err) {
      console.error(err);
      setError("حدث خطأ أثناء إنشاء الحساب");
    }
  };

  return (
    <div className="hn-account">
      <h2>Let's Get Started For Student !</h2>
      <p>Great an account </p>

      <InputField
        firstName={firstName} setFirstName={setFirstName}
        lastName={lastName} setLastName={setLastName}
        email={email} setEmail={setEmail}
        password={password} setPassword={setPassword}
        specialization={specialization} setSpecialization={setSpecialization}
        
      />

      <input
        type="number"
        placeholder="Student Number"
        className="hn-field6"
        value={univNumber}
        onChange={(e) => setUnivNumber(e.target.value)}
      />

      <input type="file" onChange={(e) => setPhoto(e.target.files[0])} />
      
      {error && <p className="text-red-500">{error}</p>}

      <button className="hn-button1" onClick={handleCreate}>
        Create
      </button>

    </div>
  );
}