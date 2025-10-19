

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Implementation.css';

export default function Implementation() {
  const [codeDigits, setCodeDigits] = useState(Array(8).fill(""));
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const email = localStorage.getItem('pendingEmail'); 
  const BASE_URL = "https://dk6m8bl1-7144.asse.devtunnels.ms"; 

  // تغيير قيمة خانة معينة
  const handleChange = (index, value) => {
    if (/^[0-9]?$/.test(value)) { 
      const newDigits = [...codeDigits];
      newDigits[index] = value;
      setCodeDigits(newDigits);
    }
  };

  const handleVerify = async () => {
    const code = codeDigits.join(""); 
    try {
      const res = await fetch(`${BASE_URL}/api/v1/accounts/confirm-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, code: code }),
      });

      if (!res.ok) {
        throw new Error('فشل التحقق من الكود');
      }

      const data = await res.json();
      console.log("✅ Response:", data);

      if (data.message) {
        alert(data.message);
        navigate('/joingrouporcreat'); 
      }
    } catch (err) {
      console.error(err);
      setError('الكود غير صحيح أو حدث خطأ');
    }
  };

  
  const handleResend = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/accounts/resend-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error("فشل إعادة إرسال الكود");

      const data = await res.json();
      setMessage(data.message);
    } catch (err) {
      console.error(err);
      setMessage("حدث خطأ أثناء إعادة الإرسال");
    }
  };

  return (
    <>
      <div className='hn-impl'>
        <div className='bb'>
          <img src="src/Images/photo_2025-07-21_14-42-32.jpg" alt="images" className='hn-ima' />
          <h3>Verification Code</h3>
          <p> Enter The 8-didit Code We've Sent To <strong>{email}</strong></p>

          {
            
          }
          <div className='hn-boxes'>
            {codeDigits.map((digit, idx) => (
              <input
                key={idx}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                className="hn-box1"
              />
            ))}
          </div>

          {error && <p style={{ color: "red" }}>{error}</p>}
          {message && <p style={{ color: "green" }}>{message}</p>}

          <p>
            Didn't Git The Code?
            <span className='hn-clic' onClick={handleResend}> Click to Resend</span>
          </p>

          <div className='hn-two-butt'>
            <button className='hn-cancl'>Cancel</button>
            <button className='hn-verify' onClick={handleVerify}>Verify</button>
          </div>
        </div>
      </div>

   
    </>
  );
}