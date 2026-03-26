"use client";
import React, { useState } from "react";

type Props = {
  title: string;
  onClose: () => void;
  onSubmit: (feedback: string) => void;
};

export default function FeedbackModal({ title, onClose, onSubmit }: Props) {
  const [feedback, setFeedback] = useState("");

  const handleSubmit = () => {
    if (!feedback.trim()) return;
    onSubmit(feedback.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6 space-y-4">
        <div className="flex items-start justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl leading-none ml-4"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <textarea
          className="w-full h-36 border border-slate-300 rounded-md p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Enter feedback here…"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          autoFocus
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-md border border-slate-300 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!feedback.trim()}
            className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Feedback
          </button>
        </div>
      </div>
    </div>
  );
}
