import { useState, useRef, useEffect, MouseEvent } from "react";
import { Header } from "./components/Header";
import Grid from "./components/Grid";
import { Event } from "./types";
import { format } from "date-fns";
import CustomDialog from "./components/CustomDialog";

function App() {
  // State to manage the selected date
  const [selectedDate, setSelectedDate] = useState(new Date());

  // State to manage events
  const [events, setEvents] = useState<Event[]>([]);

  // State to manage the currently dragging event
  const [currentDragEvent, setCurrentDragEvent] = useState<Event | null>(null);

  // State to control dialog visibility
  const [dialogVisible, setDialogVisible] = useState(false);

  // State to store event ID to be deleted
  const [eventToDelete, setEventToDelete] = useState<number | null>(null);

  // Ref to store the dragging event details
  const dragEvent = useRef<{
    newEvent: Event;
    startX: number;
    initialCell: DOMRect;
  } | null>(null);

  // Ref to store date elements for scrolling purposes
  const dateRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Get current year and month from the selected date
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();

  // Load events from localStorage on initial render
  useEffect(() => {
    const storedEvents = localStorage.getItem("events");
    if (storedEvents) {
      try {
        const parsedEvents = JSON.parse(storedEvents) as Event[];
        setEvents(parsedEvents);
      } catch (error) {
        console.error("Failed to parse events from localStorage", error);
      }
    }
  }, []);

  // Save events to localStorage whenever the events state changes
  useEffect(() => {
    try {
      localStorage.setItem("events", JSON.stringify(events));
    } catch (error) {
      console.error("Failed to save events to localStorage", error);
    }
  }, [events]);

  // Handle date change from the date picker
  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  // Navigate to the previous month
  const prevMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(selectedDate.getMonth() - 1);
    setSelectedDate(newDate);
  };

  // Navigate to the next month
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

  // Handle mouse down event for dragging to create a new event
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
    console.log(newEvent.start, newEvent.resource, newEvent.day);
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

        const resourceIndex = newEvent.resource; // Determine the resource index
        const newColor = getRandomColor(resourceIndex); // Get the color based on resource index

        setCurrentDragEvent({
          ...newEvent,
          width: newWidth,
          startTime,
          endTime,
          color: newColor, // Update the color dynamically
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

  // Show the custom dialog box when attempting to delete an event
  const handleDelete = (id: number) => {
    setEventToDelete(id); // Set the event ID to be deleted
    setDialogVisible(true); // Show the custom dialog box
  };

  // Confirm deletion of the event
  const confirmDelete = () => {
    if (eventToDelete !== null) {
      setEvents((prevEvents) =>
        prevEvents.filter((event) => event.id !== eventToDelete)
      );
    }
    setDialogVisible(false); // Hide the custom dialog box
    setEventToDelete(null); // Clear the event ID to be deleted
  };

  // Cancel deletion of the event
  const cancelDelete = () => {
    setDialogVisible(false); // Hide the custom dialog box
    setEventToDelete(null); // Clear the event ID to be deleted
  };

  // Handle resizing of events
  const handleResize = (id: number, width: number, start: number) => {
    setEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.id === id ? { ...event, width, start } : event
      )
    );
  };
  // Handle event dragging
  const handleDrag = (
    id: number,
    start: number,
    resourceIndex: number,
    dayIndex: number
  ) => {
    setEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.id === id
          ? {
              ...event,
              start,
              resource: resourceIndex,
              day: dayIndex,
              color: getRandomColor(resourceIndex), // Change color based on the new position
            }
          : event
      )
    );
  };


  // Generate a random color for the events
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

  // Filter events based on the current month and year
  const filteredEvents = events.filter(
    (event) => event.year === year && event.month === month
  );

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
          currentMonth={selectedDate}
          events={filteredEvents}
          currentDragEvent={currentDragEvent}
          dateRefs={dateRefs}
          onMouseDown={handleMouseDown}
          onDelete={handleDelete}
          onResize={handleResize}
          onDrag={handleDrag}
        />
      </div>
      {dialogVisible && (
        <CustomDialog
          message="Are you sure you want to delete this event?"
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
    </div>
  );
}

export default App;
