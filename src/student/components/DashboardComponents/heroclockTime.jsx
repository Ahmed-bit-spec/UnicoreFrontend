// src/components/HeroClockContainer.jsx
// Thin container — HeroClock itself stays a pure presentational
// component. This piece wires it to the server-synced Somalia clock.

import { useQuery } from "@tanstack/react-query";
import { useSomaliaClock } from "@/hooks/Usesomaliaclock";
import { getReservationMeta } from "@/api/reservation";
import { useLanguage } from "@/hooks/useLanguage";
import HeroClock from "./HeroClock";

const HeroClockContainer = () => {
  const { t, language } = useLanguage();

  const { data: meta } = useQuery({
    queryKey: ["reservationMeta"],
    queryFn: getReservationMeta,
    staleTime: 60_000,
    refetchInterval: 60_000,
  });

  const now = useSomaliaClock(meta?.serverTime);

  return (
    <HeroClock
      now={now}
      locale={language === "so" ? "so-SO" : "en-US"}
      libraryOpensAt={meta ? meta.openHour * 60 : undefined}
      libraryClosesAt={meta ? meta.closeHour * 60 : undefined}
      t={t}
    />
  );
};

export default HeroClockContainer;