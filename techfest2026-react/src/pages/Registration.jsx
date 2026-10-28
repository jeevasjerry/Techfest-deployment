import { useState } from "react";

function Registration() {
const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [phone, setPhone] = useState("");
const [errors, setErrors] = useState({});
const [submitted, setSubmitted] = useState(false);
const [loading, setLoading] = useState(false);
const [serverError, setServerError] = useState("");

async function handleSubmit(e) {
e.preventDefault();

const newErrors = {};

if (name.trim() === "") {
  newErrors.name = "Name is required";
}

if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  newErrors.email = "Enter a valid email";
}

if (!/^[6-9]\d{9}$/.test(phone)) {
  newErrors.phone = "Enter a valid 10-digit Indian mobile number";
}

setErrors(newErrors);
setServerError("");

if (Object.keys(newErrors).length !== 0) {
  return;
}

setLoading(true);

try {
const response = await fetch(
`${import.meta.env.VITE_API_URL}/api/register`,
{
method: "POST",
headers: {
"Content-Type": "application/json",
},
body: JSON.stringify({
name: name.trim(),
email: email.trim(),
phone: phone.trim(),
}),
}
);

const data = await response.json();

if (!response.ok) {
throw new Error(data.message || "Registration failed");
}

setSubmitted(true);

} catch (error) {
setServerError(
error.message === "Failed to fetch"
? "Cannot connect to the backend. Check your connection."
: error.message
);
} finally {
setLoading(false);
}



}

if (submitted) {
return ( <div className="page"> <h1>Thank you, {name}!</h1> <p>You have been registered successfully.</p> </div>
);
}

return ( <div className="page"> <h1>Registration</h1>

  <form onSubmit={handleSubmit}>
    <label>Name</label>
    <input
      type="text"
      value={name}
      onChange={(e) => setName(e.target.value)}
    />
    {errors.name && <p className="error-msg">{errors.name}</p>}

    <label>Email</label>
    <input
      type="email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
    />
    {errors.email && <p className="error-msg">{errors.email}</p>}

    <label>Mobile Number</label>
    <input
      type="tel"
      value={phone}
      onChange={(e) => setPhone(e.target.value)}
    />
    {errors.phone && <p className="error-msg">{errors.phone}</p>}

    {serverError && <p className="error-msg">{serverError}</p>}

    <button type="submit" disabled={loading}>
      {loading ? "Registering..." : "Submit"}
    </button>
  </form>
</div>


);
}

export default Registration;
