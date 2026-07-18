/**
 * DesignLab.jsx
 * ─────────────
 * Thin wrapper around the Design App that:
 *  1. Accepts `initialDesignId` from the exam session store so returning
 *     to this question reloads the student's saved canvas from the DB
 *     instead of creating a blank new one every time.
 *  2. Calls `onDesignCreated(id)` once when the design is first created
 *     so the parent can persist the ID in the answer store.
 */
import React from "react";
import { App as DesignApp } from "../../Design/client/app";
import "../../Design/client/styles.css";

export default function DesignLab({
  question,
  value,
  onChange,
  initialDesignId,
  onDesignCreated,
}) {
  return (
    <div className="w-full h-[800px] border border-neutral-800 rounded-lg overflow-hidden bg-[#F3F4F7]">
      <DesignApp
        question={question}
        initialDesignId={initialDesignId || value?.designId}
        onDesignCreated={onDesignCreated}
        onChange={onChange}
      />
    </div>
  );
}
