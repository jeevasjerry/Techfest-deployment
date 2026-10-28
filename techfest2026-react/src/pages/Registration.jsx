
import { useState } from "react";

const API =
  import.meta.env.VITE_API_URL ||
  "https://techfest2026-api.onrender.com";

function Registration() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  function change(e) {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setServerError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const next = {};

    if (!form.name.trim()) {
      next.name = "Please enter your name.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = "Enter a valid email address.";
    }

    if (!/^[6-9]\d{9}$/.test(form.phone.trim())) {
      next.phone = "Enter a valid 10-digit Indian mobile number.";
    }

    if (form.password.length < 8) {
      next.password = "Password must contain at least 8 characters.";
    }

    setErrors(next);

    if (Object.keys(next).length > 0) {
      return;
    }

    setLoading(true);
    setServerError("");

    try {
      const res = await fetch(`${API}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Registration failed. Please try again."
        );
      }

      setSubmitted(true);
    } catch (err) {
      setServerError(
        err.message === "Failed to fetch"
          ? "Cannot connect to the server. Please check your connection and try again."
          : err.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setSubmitted(false);

    setForm({
      name: "",
      email: "",
      phone: "",
      password: "",
    });

    setErrors({});
    setServerError("");
  }

  return (
    <main className="page">
      <span className="eyebrow">Your next chapter starts here</span>

      <h1 className="page-title">
        Save your{" "}
        <span style={{ color: "var(--pink-dark)" }}>spot.</span>
      </h1>

      <p
        style={{
          color: "var(--muted)",
          lineHeight: 1.8,
          maxWidth: 650,
        }}
      >
        Join a community of makers, dreamers and doers. Fill in your
        details to register for TechFest 2026.
      </p>

      <div className="form-layout" style={{ marginTop: 28 }}>
        <aside className="form-aside">
          <span style={{ fontSize: "2rem" }}>✿</span>

          <h2>Good ideas are better together.</h2>

          <p>
            Get ready for three days of making, learning and meeting
            people who are just as curious as you are.
          </p>

          <hr
            style={{
              border: 0,
              borderTop: "1px solid #d9a9b7",
              margin: "28px 0",
            }}
          />

          <p>
            ✦ <strong>Where</strong>
            <br />
            MBCET Campus, Thiruvananthapuram
          </p>

          <p>
            ♡ <strong>Who</strong>
            <br />
            Students, creators and curious minds
          </p>
        </aside>

        <section className="form-card">
          {submitted ? (
            <div className="success-box">
              <div style={{ fontSize: "2.5rem" }}>✓</div>

              <h2>You're on the list, {form.name}!</h2>

              <p>
                Your registration was submitted successfully.
                We can't wait to see you at TechFest 2026.
              </p>

              <p>
                You can now log in using your registered email
                address and password.
              </p>

              <button
                className="btn btn-primary"
                onClick={resetForm}
              >
                Register another person
              </button>
            </div>
          ) : (
            <>
              <h2
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "1.8rem",
                  marginTop: 0,
                }}
              >
                Registration form
              </h2>

              <p style={{ color: "var(--muted)" }}>
                All fields are required.
              </p>

              <form onSubmit={handleSubmit} noValidate>
                <div className="form-row">
                  <label htmlFor="name">Full name</label>

                  <input
                    className="form-control"
                    id="name"
                    name="name"
                    type="text"
                    placeholder="e.g. Alex Thomas"
                    value={form.name}
                    onChange={change}
                    required
                  />

                  {errors.name && (
                    <p className="error-msg">{errors.name}</p>
                  )}
                </div>

                <div className="form-row">
                  <label htmlFor="email">Email address</label>

                  <input
                    className="form-control"
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={change}
                    required
                  />

                  {errors.email && (
                    <p className="error-msg">{errors.email}</p>
                  )}
                </div>

                <div className="form-row">
                  <label htmlFor="phone">Mobile number</label>

                  <input
                    className="form-control"
                    id="phone"
                    name="phone"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    autoComplete="tel"
                    placeholder="10-digit mobile number"
                    value={form.phone}
                    onChange={change}
                    required
                  />

                  {errors.phone && (
                    <p className="error-msg">{errors.phone}</p>
                  )}
                </div>

                <div className="form-row">
                  <label htmlFor="password">Create password</label>

                  <input
                    className="form-control"
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    placeholder="At least 8 characters"
                    value={form.password}
                    onChange={change}
                    required
                  />

                  {errors.password && (
                    <p className="error-msg">{errors.password}</p>
                  )}
                </div>

                {serverError && (
                  <p className="error-banner" role="alert">
                    {serverError}
                  </p>
                )}

                <button
                  className={`btn btn-primary ${
                    loading ? "loading" : ""
                  }`}
                  type="submit"
                  disabled={loading}
                  style={{ width: "100%", marginTop: 8 }}
                >
                  {loading
                    ? "Submitting..."
                    : "Complete registration ↗"}
                </button>

                <p
                  style={{
                    fontSize: ".8rem",
                    color: "var(--muted)",
                    textAlign: "center",
                  }}
                >
                  Your password is hashed by the backend before
                  it is stored.
                </p>
              </form>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

export default Registration;

