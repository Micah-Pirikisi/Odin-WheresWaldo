import React, { useState } from "react";
import { finishSession } from "../api";

export default function FinishModal({
  open,
  timeSeconds,
  session,
  anonymousId,
  onClose,
  onSubmitted,
}) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  async function handleSubmit() {
    if (!session) return;
    setSaving(true);
    try {
      await finishSession(session.id, anonymousId, name || "Anonymous");
      setName("");
      if (onSubmitted) await onSubmitted();
    } catch (err) {
      console.error(err);
      alert("Failed to save score");
    } finally {
      setSaving(false);
      if (onClose) onClose();
    }
  }

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>You found them all!</h3>
        <p>Time: {Math.max(0, timeSeconds)} seconds</p>
        <label>
          Name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
        </label>
        <div className="modal-actions">
          <button onClick={handleSubmit} disabled={saving}>
            Submit
          </button>
          <button className="secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
