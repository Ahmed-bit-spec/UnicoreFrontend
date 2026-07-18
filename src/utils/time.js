import { DateTime } from "luxon";

export const ZONE = "Africa/Mogadishu";
export const OPEN_HOUR = 7;
export const CLOSE_HOUR = 17;

// Somalia wall-clock hour/minute for a given real "now" instant.
export const getSomaliaParts = (now) => {
  const dt = DateTime.fromJSDate(now).setZone(ZONE);
  return { hour: dt.hour, minute: dt.minute };
};

// Real instant that a given Somalia hour:minute falls on, on TODAY's
// Somalia calendar date (determined from `now`).
export const somaliaSlotToInstant = (now, hour, minute) =>
  DateTime.fromJSDate(now).setZone(ZONE).set({ hour, minute, second: 0, millisecond: 0 }).toJSDate();

export const formatHoursRange = () => {
  const fmt = (h) => {
    const period = h < 12 ? "AM" : "PM";
    const hour = h % 12 || 12;
    return `${hour}:00 ${period}`;
  };
  return `${fmt(OPEN_HOUR)} – ${fmt(CLOSE_HOUR)}`;
};