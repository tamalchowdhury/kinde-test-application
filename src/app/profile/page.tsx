"use client";

import { useState } from "react";

export default function Profile() {
  const [displayName, setDisplayName] = useState("");
  const [showToast, setShowToast] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (displayName.trim()) {
      setShowToast(true);
      // Hide toast after 3 seconds
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
    }
  };

  return (
    <div className="container">
      <div className="card start-hero">
        <h2 className="text-display-2">Profile</h2>
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="profile-form-group">
            <label
              htmlFor="display-name-input"
              className="text-heading-2 profile-label"
            >
              Display Name
            </label>
            <input
              id="display-name-input"
              data-testid="display-name-input"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="profile-input"
              placeholder="Enter your name"
            />
          </div>
          <button
            type="submit"
            data-testid="display-name-submit"
            className="btn btn-light"
          >
            Update Profile
          </button>
        </form>
      </div>
      {showToast && (
        <div className="toast toast-success">Profile updated successfully!</div>
      )}
    </div>
  );
}
