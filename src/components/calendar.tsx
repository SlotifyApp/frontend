"use client";
import { useEffect, useState } from "react";
import fetchHelpers from "@/hooks/fetchHelpers";

interface CalendarInterface {
    subject?: string;
    startTime?: string;
    endTime?: string;
}

export default function DisplayCalendar() {
  const [calendar, setCalendar] = useState<Array<CalendarInterface>>([]);

  useEffect(() => {
    const fetchCalendar = async () => {
      // This code is less ugly now and needs to be done for the refresh.
      const calRoute = "/api/calendar/me";
      const calData = await fetchHelpers.getAPIrouteData(calRoute, {}); 
      if (calData && Array.isArray(calData)) {
        setCalendar(calData);
      }
    };

    fetchCalendar();
  }, []);

  if (!calendar) {
    return <div>No calendar displayed.</div>;
  }

  return (
    <div>
      <pre>{JSON.stringify(calendar, null, 2)}</pre>
    </div>
  );
}
