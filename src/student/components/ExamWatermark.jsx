/**
 * ExamWatermark
 * -------------
 * Renders a tiled, semi-transparent watermark across the entire exam
 * viewport. Purpose: if a student photographs or screenshots the screen,
 * their identity is visible in the image and the leak can be traced.
 *
 * Design choices:
 *  - pointer-events:none  → never blocks interaction
 *  - user-select:none     → can't be selected or copied
 *  - z-index:9999         → floats above all lab content
 *  - opacity 0.065        → visible enough to deter, subtle enough not to
 *    distract the student during normal work
 *  - rotate(-28deg)       → diagonal pattern resists being cropped out
 *  - Live clock           → each second the watermark text changes, making
 *    static screenshots trivially datable
 */
import React, { useState, useEffect } from "react";

export default function ExamWatermark({
  studentName = "Student",
  studentId   = "",
  examId      = "",
  sessionId   = "",
}) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const pad2  = n => String(n).padStart(2, "0");
  const time  = `${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}`;
  const date  = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
  const eid   = examId   ? examId.slice(-6).toUpperCase()   : "";
  const sid   = sessionId ? sessionId.slice(-6).toUpperCase() : "";

  // Two lines for the stamp to break it across lines for clarity
  const line1 = [studentName, studentId].filter(Boolean).join(" · ");
  const line2 = [`Exam:${eid}`, `Ses:${sid}`, date, time].filter(Boolean).join(" · ");

  // Build a 4-column × 9-row grid of stamps
  const stamps = [];
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 4; col++) {
      stamps.push({ row, col });
    }
  }

  return (
    <div
      aria-hidden="true"
      style={{
        position:      "fixed",
        inset:         0,
        pointerEvents: "none",
        zIndex:        9999,
        overflow:      "hidden",
        userSelect:    "none",
      }}
    >
      {stamps.map(({ row, col }) => (
        <div
          key={`${row}-${col}`}
          style={{
            position:    "absolute",
            left:        `${col * 26 - 2}%`,
            top:         `${row * 11.5 - 1}%`,
            transform:   "rotate(-28deg)",
            opacity:     0.065,
            color:       "#000",
            fontFamily:  "monospace",
            fontSize:    11,
            fontWeight:  700,
            lineHeight:  1.6,
            whiteSpace:  "nowrap",
            letterSpacing: 0.5,
          }}
        >
          <div>{line1}</div>
          <div>{line2}</div>
        </div>
      ))}
    </div>
  );
}
