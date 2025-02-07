import { useState, useRef, useEffect, MouseEvent } from "react";
import { Header } from "./components/Header";
import Grid from "./components/Grid";
import { Event } from "./types";
import { format } from "date-fns";
import CustomDialog from "./components/CustomDialog";

function App() {
  // State to manage the selected date
  const [selectedDate, setSelectedDate] = useState(() => {
    const storedDate = localStorage.getItem("selectedDate");
    return storedDate ? new Date(storedDate) : new Date();
  });

  // State to manage events
  const [events, setEvents] = useState<Event[]>(() => {
    const storedEvents = localStorage.getItem("events");
    return storedEvents ? JSON.parse(storedEvents) : [];
  });

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

  // Save selected date to localStorage
  useEffect(() => {
    localStorage.setItem("selectedDate", selectedDate.toISOString());
  }, [selectedDate]);

  // Save events to localStorage whenever the events state changes
  useEffect(() => {
    localStorage.setItem("events", JSON.stringify(events));
  }, [events]);

  // Handle date change from the date picker
  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  // Navigate to the previous month
  const prevMonth = () => {
    setSelectedDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  // Navigate to the next month
  const nextMonth = () => {
    setSelectedDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
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
      id: Date.now(),
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
      newEvent,
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
          color: getRandomColor(resourceIndex),
        });
      }
    };

    const handleMouseUp = () => {
      if (dragEvent.current) {
        const { newEvent, startX, initialCell } = dragEvent.current;
        const newWidth = Math.max(
          (window.event as unknown as MouseEvent).clientX - initialCell.left - startX,
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
      document.removeEventListener("mousemove", handleMouseMove as unknown as EventListener);
      document.removeEventListener("mouseup", handleMouseUp as EventListener);
    };

    document.addEventListener("mousemove", handleMouseMove as unknown as EventListener);
    document.addEventListener("mouseup", handleMouseUp as EventListener);
  };

  // Show the custom dialog box when attempting to delete an event
  const handleDelete = (id: number) => {
    setEventToDelete(id);
    setDialogVisible(true);
  };

  // Confirm deletion of the event
  const confirmDelete = () => {
    if (eventToDelete !== null) {
      setEvents((prevEvents) => prevEvents.filter((event) => event.id !== eventToDelete));
    }
    setDialogVisible(false);
    setEventToDelete(null);
  };

  // Cancel deletion of the event
  const cancelDelete = () => {
    setDialogVisible(false);
    setEventToDelete(null);
  };

  // Handle resizing of events
  const handleResize = (id: number, width: number, start: number, newStartTime: number, newEndTime: number) => {
    setEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.id === id
          ? { ...event, width, start, startTime: Math.max(0, Math.min(newStartTime, 24)), endTime: Math.max(0, Math.min(newEndTime, 24)) }
          : event
      )
    );
  };

  // Handle event dragging
  const handleDrag = (id: number, start: number, resourceIndex: number, dayIndex: number) => {
    setEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.id === id
          ? { ...event, start, resource: resourceIndex, day: dayIndex, startTime: Math.max(0, Math.min((start / event.width) * 24, 24)), endTime: Math.max(0, Math.min(((start + event.width) / event.width) * 24, 24)), color: getRandomColor(resourceIndex) }
          : event
      )
    );
  };

  // Generate a random color for the events
  const getRandomColor = (index: number) => {
    const colors = ["#FFC0CB", "#F3C1FF", "#F8E089", "#E3B98D", "#C5E882", "#F4A3A3", "#D98888", "#D1D16D", "#88D888", "#88D1D1", "#75A5D1", "#A89BF2", "#E8E0F5", "#FFD699", "#FFE5CC"];
    return colors[index % colors.length];
  };

  return (
    <div className="h-screen flex flex-col">
      <Header selectedDate={selectedDate} handleDateChange={handleDateChange} prevMonth={prevMonth} nextMonth={nextMonth} scrollToToday={scrollToToday} />
      <div className="flex-grow overflow-x-auto">
        <Grid currentMonth={selectedDate} events={events} currentDragEvent={currentDragEvent} dateRefs={dateRefs} onMouseDown={handleMouseDown} onDelete={handleDelete} onResize={handleResize} onDrag={handleDrag} />
      </div>
      {dialogVisible && <CustomDialog message="Are you sure you want to delete this event?" onConfirm={confirmDelete} onCancel={cancelDelete} />}
    </div>
  );
}

export default App;
