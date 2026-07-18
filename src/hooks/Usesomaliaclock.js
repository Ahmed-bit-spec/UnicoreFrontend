import { useEffect, useRef, useState } from "react";
import { DateTime } from "luxon";
import { ZONE } from "@/utils/time";

/**
 * Single source of truth for "now" everywhere in this app.
 * Built on Luxon's DateTime.now().setZone("Africa/Mogadishu") — the exact
 * approach that worked in your debug test — corrected against the
 * server clock (serverTime) so a wrong device clock can't break bookings.
 * Returns a real JS Date (epoch-accurate), safe to compare directly
 * against any timestamp from the API.
 */
export const useSomaliaClock = (serverTimeISO) => {
  const offsetRef = useRef(0); // ms to add to local time to match the server

  useEffect(() => {
    if (!serverTimeISO) return;
    const serverMs = new Date(serverTimeISO).getTime();
    if (Number.isNaN(serverMs)) return;
    offsetRef.current = serverMs - Date.now();
  }, [serverTimeISO]);

  const getNow = () =>
    DateTime.now().plus({ milliseconds: offsetRef.current }).setZone(ZONE).toJSDate();

  const [now, setNow] = useState(getNow);

  useEffect(() => {
    setNow(getNow());
    const id = setInterval(() => setNow(getNow()), 1000);
    return () => clearInterval(id);
  }, [serverTimeISO]);

  return now;
};