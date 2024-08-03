// src/components/Resources.tsx
import React, { MouseEvent } from "react";
import { Event } from "../types";

interface ResourcesProps {
  currentMonth: Date;
  events: Event[];
  handleMouseDown: (
    e: MouseEvent,
    resourceIndex: number,
    dayIndex: number
  ) => void;
  handleDelete: (id: number) => void;
  currentDragEvent: Event | null;
}

export const Resources: React.FC<ResourcesProps> = ({
  currentMonth,
  events,
  handleMouseDown,
  handleDelete,
  currentDragEvent,
}) => {
  const resources = [
    "Resource A",
    "Resource B",
    "Resource C",
    "Resource D",
    "Resource E",
    "Resource F",
    "Resource G",
    "Resource H",
    "Resource I",
    "Resource J",
    "Resource K",
    "Resource L",
    "Resource M",
    "Resource N",
    "Resource O",
  ];

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const formatTime = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    const period = h < 12 ? "AM" : "PM";
    const formattedHour = h % 12 === 0 ? 12 : h % 12;
    return `${formattedHour}:${m.toString().padStart(2, "0")} ${period}`;
  };

  return (
    <div className="grid grid-cols-12 w-full">
      <div className="col-span-2 sticky left-0 z-20 bg-white">
        {resources.map((resource, index) => (
          <div
            key={index}
            className="flex items-center h-12 border border-gray-300 font-medium select-none pl-4"
          >
            {resource}
          </div>
        ))}
      </div>
      <div className="col-span-10">
        {resources.map((_, resourceIndex) => (
          <div key={resourceIndex} className="flex h-12 relative">
            {days.map((dayIndex) => (
              <div
                key={dayIndex}
                className="min-w-[80px] border border-gray-300 p-2 relative cell"
                onMouseDown={(e) => handleMouseDown(e, resourceIndex, dayIndex)}
              >
                {events
                  .filter(
                    (event) =>
                      event.resource === resourceIndex && event.day === dayIndex
                  )
                  .map((event) => (
                    <div
                      key={event.id}
                      className="event absolute"
                      style={{
                        left: `${event.start}px`,
                        width: `${event.width}px`,
                        top: 0,
                        height: "100%",
                        backgroundColor: event.color,
                      }}
                      onClick={() => handleDelete(event.id)}
                    >
                      <div className="event-content">
                        <div>New Event</div>
                        <div>
                          {formatTime(event.startTime)} -{" "}
                          {formatTime(event.endTime)}
                        </div>
                        <button
                          className="delete-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(event.id);
                          }}
                        >
                          X
                        </button>
                      </div>
                    </div>
                  ))}
                {currentDragEvent &&
                  currentDragEvent.resource === resourceIndex &&
                  currentDragEvent.day === dayIndex && (
                    <div
                      className="event absolute"
                      style={{
                        left: `${currentDragEvent.start}px`,
                        width: `${currentDragEvent.width}px`,
                        top: 0,
                        height: "100%",
                        backgroundColor: currentDragEvent.color,
                        opacity: 0.5,
                      }}
                    >
                      <div className="event-content">
                        <div>Dragging</div>
                        <div>
                          {formatTime(currentDragEvent.startTime)} -{" "}
                          {formatTime(currentDragEvent.endTime)}
                        </div>
                      </div>
                    </div>
                  )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
