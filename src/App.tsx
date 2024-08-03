import { useState, useRef, useEffect, MouseEvent } from "react";
import { Header } from "./components/Header";
import Grid from "./components/Grid";
import { Event } from "./types";
import { format } from "date-fns";

function App() {
  // State to manage selected date
  const [selectedDate, setSelectedDate] = useState(new Date());
  // State to manage events
  const [events, setEvents] = useState<Event[]>([]);
  // State to manage the currently dragged event
  const [currentDragEvent, setCurrentDragEvent] = useState<Event | null>(null);
  // Ref to store information about the dragging event
  const dragEvent = useRef<{
    newEvent: Event;
    startX: number;
    initialCell: DOMRect;
  } | null>(null);
  // Ref to store references to date cells
  const dateRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Get current year and month
  const currentMonth = selectedDate;
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();

  // Load events from localStorage on mount
  useEffect(() => {
    const storedEvents = localStorage.getItem("events");
    console.log("Retrieved stored events:", storedEvents); // Debugging log
    if (storedEvents) {
      try {
        const parsedEvents = JSON.parse(storedEvents) as Event[];
        console.log("Parsed events:", parsedEvents); // Debugging log
        setEvents(parsedEvents);
      } catch (error) {
        console.error("Failed to parse events from localStorage", error);
      }
    }
  }, []);

  // Save events to localStorage whenever events state changes
  useEffect(() => {
    try {
      console.log("Saving events to localStorage:", events); // Debugging log
      localStorage.setItem("events", JSON.stringify(events));
    } catch (error) {
      console.error("Failed to save events to localStorage", error);
    }
  }, [events]);

  // Handle date change
  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  // Navigate to previous month
  const prevMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(selectedDate.getMonth() - 1);
    setSelectedDate(newDate);
  };

  // Navigate to next month
  const nextMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(selectedDate.getMonth() + 1);
    setSelectedDate(newDate);
  };

  // Scroll to today's date
  const scrollToToday = () => {
    setSelectedDate(new Date());
    const todayKey = format(selectedDate, "yyyy-MM-dd");
    const todayRef = dateRefs.current[todayKey];
    if (todayRef) {
      todayRef.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    }
  };

  // Handle mouse down event to start dragging
  const handleMouseDown = (
    e: MouseEvent<HTMLDivElement>,
    resourceIndex: number,
    dayIndex: number
  ) => {
    const cell = (e.target as HTMLElement).getBoundingClientRect();
    const startX = e.clientX - cell.left;

    const newEvent: Event = {
      id: new Date().getTime(),
      resource: resourceIndex,
      day: dayIndex,
      start: startX,
      width: 0,
      color: getRandomColor(resourceIndex),
      startTime: 0,
      endTime: 0,
      month,
      year,
    };

    dragEvent.current = {
      newEvent: newEvent,
      startX,
      initialCell: cell,
    };
    setCurrentDragEvent(newEvent);

    const handleMouseMove = (e: MouseEvent) => {
      if (dragEvent.current) {
        const { newEvent, startX, initialCell } = dragEvent.current;
        const newWidth = Math.max(e.clientX - initialCell.left - startX, 0);
        const cellWidth = initialCell.width;

        const startTime = (newEvent.start / cellWidth) * 24;
        const endTime = ((newEvent.start + newWidth) / cellWidth) * 24;

        setCurrentDragEvent({
          ...newEvent,
          width: newWidth,
          startTime,
          endTime,
        });
      }
    };

    const handleMouseUp = () => {
      if (dragEvent.current) {
        const { newEvent, startX, initialCell } = dragEvent.current;
        const newWidth = Math.max(
          (window.event as unknown as MouseEvent).clientX -
            initialCell.left -
            startX,
          0
        );
        const cellWidth = initialCell.width;

        if (newWidth > 0) {
          const startTime = (newEvent.start / cellWidth) * 24;
          const endTime = ((newEvent.start + newWidth) / cellWidth) * 24;

          setEvents((prevEvents) => [
            ...prevEvents,
            {
              ...newEvent,
              width: newWidth,
              startTime,
              endTime,
            },
          ]);
        }
      }

      setCurrentDragEvent(null);
      dragEvent.current = null;
      document.removeEventListener(
        "mousemove",
        handleMouseMove as unknown as EventListener
      );
      document.removeEventListener("mouseup", handleMouseUp as EventListener);
    };

    document.addEventListener(
      "mousemove",
      handleMouseMove as unknown as EventListener
    );
    document.addEventListener("mouseup", handleMouseUp as EventListener);
  };

  // Handle event deletion
  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      setEvents((prevEvents) => prevEvents.filter((event) => event.id !== id));
    }
  };

  // Handle event resizing
  const handleResize = (id: number, width: number, start: number) => {
    setEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.id === id ? { ...event, width, start } : event
      )
    );
  };

  // Generate a random color
  const getRandomColor = (index: number) => {
    const colors = [
      "#fb7185", // Light Rose
      "#e879f9", // Bit Light Fuchsia
      "#eab308", // Yellow
      "#C38F63", // Light saddle brown
      "#84cc16", // bit dark lime
      "#D35A5A", // Light firebrick
      "#A03333", // Light maroon
      "#A0A033", // Light olive
      "#33A033", // Light green
      "#33A0A0", // Light teal
      "#2E5A88", // Light navy
      "#6D5ACF", // Light indigo
      "#CBC3E3", // Light purple
      "#FF9933", // Light orange
      "#FFCC99", // Light peach
    ];
    return colors[index % colors.length];
  };

  // Filter events to only include events for the current month
  const filteredEvents = events.filter(
    (event) => event.year === year && event.month === month
  );

  console.log("Filtered events:", filteredEvents); // Debugging log

  return (
    <div className="h-screen flex flex-col">
      <Header
        selectedDate={selectedDate}
        handleDateChange={handleDateChange}
        prevMonth={prevMonth}
        nextMonth={nextMonth}
        scrollToToday={scrollToToday}
      />
      <div className="flex-grow overflow-x-auto">
        <Grid
          currentMonth={currentMonth}
          events={filteredEvents}
          currentDragEvent={currentDragEvent}
          dateRefs={dateRefs}
          onMouseDown={handleMouseDown}
          onDelete={handleDelete}
          onResize={handleResize}
        />
      </div>
    </div>
  );
}

export default App;
