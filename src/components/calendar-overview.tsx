"use client";

import { useEffect, useState } from "react";
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  parseISO,
  isSameDay,
  isValid,
  addWeeks,
  subWeeks,
} from "date-fns";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  User,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CalendarEvent } from "@/components/calendar/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import Link from "next/link";
import fetchHelpers from "@/hooks/fetchHelpers";

export function CalendarOverview() {
  const [isDayEventsDialogOpen, setIsDayEventsDialogOpen] = useState(false);
  const [calendar, setCalendar] = useState<Array<CalendarEvent>>([]);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Start week on Monday
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Generate time slots from 8:00 to 23:00
  const timeSlots = Array.from({ length: 16 }, (_, i) => i + 8);

  const handlePreviousWeek = () => setCurrentWeek(subWeeks(currentWeek, 1));
  const handleNextWeek = () => setCurrentWeek(addWeeks(currentWeek, 1));
  const handleToday = () => setCurrentWeek(new Date());

  const getEventsForDayAndTime = (day: Date, hour: number) => {
    return calendar.filter((event: CalendarEvent) => {
      if (!event.startTime || !isValid(parseISO(event.startTime))) return false;
      const eventDate = parseISO(event.startTime);
      const eventHour = eventDate.getHours();
      return isSameDay(eventDate, day) && eventHour === hour;
    });
  };

  useEffect(() => {
    //TODO: Use new fetchhelpers
    const fetchCalendar = async () => {
      const calenRoute = "/api/calendar/me";
      const startFormatted = weekStart.toISOString().slice(0, 19) + "Z";
      const endFormatted = weekEnd.toISOString().slice(0, 19) + "Z";
      const calenData = await fetchHelpers.getAPIrouteData(calenRoute, {
        params: {
          query: {
            start: startFormatted,
            end: endFormatted,
          },
        },
      });
      if (Array.isArray(calenData)) {
        console.log(`Setting calendar to ${JSON.stringify(calenData)}`);
        setCalendar(calenData);
      }
    };
    fetchCalendar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWeek]);

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsDayEventsDialogOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">
                {format(weekStart, "MMMM yyyy")}
              </h2>
              <span className="text-muted-foreground">
                week {format(weekStart, "w")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleToday}>
                Today
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handlePreviousWeek}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleNextWeek}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-[auto_1fr] divide-x border-t">
            {/* Time column */}
            <div className="w-20 divide-y">
              <div className="h-14" /> {/* Empty cell for header */}
              {timeSlots.map((hour) => (
                <div
                  key={hour}
                  className="h-24 p-2 text-sm text-muted-foreground"
                >
                  {format(new Date().setHours(hour, 0), "HH:mm")}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 divide-x">
              {/* Header row with days */}
              <div className="col-span-7 grid grid-cols-7 divide-x">
                {days.map((day) => (
                  <div key={day.toString()} className="h-14 p-2 text-center">
                    <div className="text-sm font-medium">
                      {format(day, "EEE")}
                    </div>
                    <div
                      className={cn(
                        "text-sm mt-1",
                        isSameDay(day, new Date()) &&
                          "rounded-full bg-primary text-primary-foreground w-6 h-6 mx-auto flex items-center justify-center",
                      )}
                    >
                      {format(day, "d")}
                    </div>
                  </div>
                ))}
              </div>

              {/* Time slots grid */}
              {timeSlots.map((hour) => (
                <div
                  key={hour}
                  className="col-span-7 grid grid-cols-7 divide-x"
                >
                  {days.map((day) => {
                    const dayEvents = getEventsForDayAndTime(day, hour);
                    return (
                      <div
                        key={day.toString()}
                        className="h-24 p-1 relative hover:bg-muted/50 transition-colors"
                      >
                        {dayEvents.map((dayEvent) => (
                          <div
                            key={dayEvent.id}
                            className="absolute inset-x-1 rounded-md p-2 text-white bg-blue-500"
                            style={{
                              top: "0.25rem",
                              minHeight: "calc(100% - 0.5rem)",
                            }}
                            onClick={() => handleEventClick(dayEvent)}
                          >
                            <div className="text-sm font-medium truncate">
                              {dayEvent.subject}
                            </div>
                            <div className="text-xs font-medium truncate">
                              {dayEvent.body}
                            </div>
                            <div className="text-xs truncate opacity-90">
                              {dayEvent.locations &&
                                dayEvent.locations.length > 0 &&
                                dayEvent.locations[0] &&
                                dayEvent.locations[0].name && (
                                  <>{dayEvent.locations[0].name}</>
                                )}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={isDayEventsDialogOpen}
        onOpenChange={setIsDayEventsDialogOpen}
      >
        <DialogContent className="max-w-3xl">
          <ScrollArea className="h-[500px] mt-4">
            {selectedEvent && (
              <>
                <div className="space-y-4">
                  <DialogHeader>
                    <DialogTitle>{selectedEvent.subject}</DialogTitle>
                    {selectedEvent.body && (
                      <DialogDescription>
                        {selectedEvent.body}
                      </DialogDescription>
                    )}
                  </DialogHeader>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Clock className="mr-2 h-4 w-4" />
                      {selectedEvent.startTime && selectedEvent.endTime && (
                        <>
                          {format(parseISO(selectedEvent.startTime), "HH:mm")} -{" "}
                          {format(parseISO(selectedEvent.endTime), "HH:mm")}
                        </>
                      )}
                    </div>
                    {selectedEvent.locations &&
                      selectedEvent.locations.map((loc) => (
                        <div key={loc.id} className="flex items-center text-sm">
                          <MapPin className="mr-2 h-4 w-4" />
                          {loc.name}
                        </div>
                      ))}
                    {selectedEvent.organizer && (
                      <div className="flex items-center text-sm">
                        <User className="mr-2 h-4 w-4" />
                        Organizer: {selectedEvent.organizer}
                      </div>
                    )}
                    {selectedEvent.attendees &&
                      selectedEvent.attendees.length > 0 && (
                        <div className="flex items-start text-sm">
                          <Users className="mr-2 h-4 w-4 mt-1" />
                          <div>
                            <div>Attendees:</div>
                            <ul className="list-disc list-inside pl-4">
                              {selectedEvent.attendees.map(
                                (attendee, index) => (
                                  <li key={index}>
                                    {attendee.email || attendee.type} (
                                    {attendee.responseStatus})
                                  </li>
                                ),
                              )}
                            </ul>
                          </div>
                        </div>
                      )}
                  </div>
                  <div className="mt-4 space-y-2">
                    {selectedEvent.joinURL && (
                      <Button asChild>
                        <Link
                          href={selectedEvent.joinURL}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          Join Meeting
                        </Link>
                      </Button>
                    )}
                    {selectedEvent.webLink && (
                      <Button asChild>
                        <Link
                          href={selectedEvent.webLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          View In Outlook
                        </Link>
                      </Button>
                    )}

                    <Button variant="destructive">Reschedule</Button>
                  </div>
                </div>
              </>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
