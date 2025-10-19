
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./LogIn.css";
import { fetchWithAuth } from "./LogInFetchWithAuth";

export default function LogIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // backend URL
  const BASE_URL = "https://dk6m8bl1-7144.asse.devtunnels.ms";

  const handleLogin = async () => {
    try {
      // 1️⃣ طلب تسجيل الدخول
      const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include", // مهم للكويكز
      });

      if (!res.ok) {
        throw new Error("فشل تسجيل الدخول");
      }

      // 2️⃣ جلب بيانات المستخدم من /me
      const meRes = await fetchWithAuth("/api/v1/auth/me");
      if (!meRes.ok) {
        throw new Error("فشل جلب بيانات المستخدم");
      }

      const meData = await meRes.json();
      console.log("User info:", meData);

      // 3️⃣ التوجيه حسب الدور
      if (meData.role === "Admin") {
        navigate("/admin");
      } else if (meData.role === "Doctor") {
  navigate("/doctorDashboard", { state: { doctorId: meData.id } });
}
       else if (meData.role === "Student") {
        if (meData.groupId === null) {
          // 🔹 طالب بدون مجموعة → إنشاء مجموعة
          navigate("/joingrouporcreat");
        } else {
          // 🔹 طالب عنده مجموعة
          if (meData.isLeader) {
            // إذا هو قائد
            navigate("/leader");
          } else {
            // إذا عضو عادي
            navigate("/studentDashbord");
          }
        }
      } else {
        setError("دور غير معروف");
      }
    } catch (err) {
      console.error(err);
      setError("حدث خطأ أثناء تسجيل الدخول");
    }
  };

  return (
    <div className="hn-logAndPhoto">
      <div className="hn-login">
        <h2>
          WELCOME <span className="hn-wel">!</span>
        </h2>

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

        {error && <p className="text-red-500">{error}</p>}

        <button className="hn-button1" onClick={handleLogin}>
          LOG IN
        </button>

        <p className="hn-forget">Forget Password?</p>
        <p className="hn-or">OR</p>
        <Link to={"/doctor"} className="hn-link1">
          <button className="hn-button1">Create doctor account</button>
        </Link>
        <p className="hn-or">OR</p>
        <Link to={"/student"} className="hn-link1">
          <button className="hn-button1">Create Student account</button>
        </Link>
      </div>

      <img
        src="src/Images/photo_2025-06-27_23-35-23.jpg"
        alt=""
        className="hn-imageLogin"
      />
 
      
     
      
    </div>

  );
}

