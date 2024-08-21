import React from "react";
import { format, getDaysInMonth, isToday } from "date-fns";
import { Event } from "../types";
import { SquareXIcon } from "lucide-react";
import { Rnd } from "react-rnd";

interface GridProps {
  currentMonth: Date;
  events: Event[];
  currentDragEvent: Event | null;
  dateRefs: React.MutableRefObject<{ [key: string]: HTMLDivElement | null }>;
  onMouseDown: (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    resourceIndex: number,
    dayIndex: number
  ) => void;
  onDelete: (id: number) => void;
  onResize: (
    id: number,
    width: number,
    start: number,
    newStartTime: number,
    newEndTime: number
  ) => void;
  onDrag: (
    id: number,
    start: number,
    resourceIndex: number,
    dayIndex: number
  ) => void;
}

const Grid: React.FC<GridProps> = ({
  currentMonth,
  events,
  currentDragEvent,
  dateRefs,
  onMouseDown,
  onDelete,
  onResize,
  onDrag,
}) => {
  const daysInMonth = getDaysInMonth(currentMonth);
  const rows = [];

  const formatTime = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    const period = h < 12 ? "AM" : "PM";
    const formattedHour = h % 12 === 0 ? 12 : h % 12;
    return `${formattedHour}:${m.toString().padStart(2, "0")} ${period}`;
  };

  const calculateTime = (positionX: number, width: number) => {
    const hourWidth = 8; // Example: 1 hour is represented by 50 pixels
    const newStartTime = positionX / hourWidth;
    const newEndTime = (positionX + width) / hourWidth;
    return { newStartTime, newEndTime };
  };

  for (let row = -1; row < 15; row++) {
    const cells = [];
    if (row === -1) {
      cells.push(
        <div
          className="flex justify-left items-start pl-2 sticky left-0 z-30 w-40 bg-white border border-gray-200"
          key="empty-header"
        />
      );
    } else {
      cells.push(
        <div
          className="flex justify-left items-start pl-2 w-40 border border-gray-200 bg-white sticky font-medium left-0 z-30 select-none"
          key={`alpha-${row}`}
        >
          {"Resource " + String.fromCharCode(65 + row)}
        </div>
      );
    }

    for (let col = 1; col <= daysInMonth; col++) {
      if (row === -1) {
        const date = new Date(
          currentMonth.getFullYear(),
          currentMonth.getMonth(),
          col
        );
        const dateKey = format(date, "yyyy-MM-dd");
        cells.push(
          <div
            ref={(el) => (dateRefs.current[dateKey] = el)}
            key={col}
            className="flex justify-start items-center w-20 border-gray-200 border bg-white py-1 sticky top-0 z-20 select-none"
          >
            <span
              className={`py-1 px-2 text-sm ${
                isToday(date) ? "bg-blue-500 text-white rounded-full" : ""
              }`}
            >
              {format(date, "d EEE")}
            </span>
          </div>
        );
      } else {
        const dayIndex = col - 1;
        cells.push(
          <div
            className="flex justify-center items-center py-2 px-1 border border-gray-200 h-16 w-20 relative event-cell"
            key={`cell-${row}-${col}`}
            onMouseDown={(e) => onMouseDown(e, row, dayIndex)}
          >
            {events
              .filter(
                (event) => event.resource === row && event.day === dayIndex
              )
              .map((event) => (
                <Rnd
                  key={event.id}
                  size={{ width: event.width, height: "75%" }}
                  position={{ x: event.start, y: 0 }}
                  onDragStart={(e) => e.stopPropagation()}
                  onDragStop={(e, d) => {
                    const grid = (e.target as HTMLElement).closest(
                      ".event-cell"
                    );
                    if (!grid) return;
                    const gridRect = grid.getBoundingClientRect();

                    const mouseX = d.x + gridRect.left - gridRect.width;
                    const mouseY = d.y + gridRect.top - gridRect.height;

                    const newDayIndex = Math.floor(mouseX / gridRect.width);
                    const newResourceIndex = Math.floor(
                      mouseY / gridRect.height
                    );
                    const newStart = d.x % gridRect.width;

                    if (
                      newDayIndex >= 0 &&
                      newDayIndex < daysInMonth &&
                      newResourceIndex >= 0 &&
                      newResourceIndex < 15
                    ) {
                      onDrag(event.id, newStart, newResourceIndex, newDayIndex);
                    }
                  }}
                  onResize={(e, direction, ref, delta, position) => {
                    const newWidth = ref.offsetWidth;
                    const newStart = position.x;
                    const { newStartTime, newEndTime } = calculateTime(
                      newStart,
                      newWidth
                    );

                    // Update the event's time during the resize operation
                    onResize(
                      event.id,
                      newWidth,
                      newStart,
                      newStartTime,
                      newEndTime
                    );
                  }}
                  onResizeStop={(_e, _direction, ref, _delta, position) => {
                    const newWidth = ref.offsetWidth;
                    const newStart = position.x;
                    const { newStartTime, newEndTime } = calculateTime(
                      newStart,
                      newWidth
                    );

                    // Finalize the resizing operation
                    onResize(
                      event.id,
                      newWidth,
                      newStart,
                      newStartTime,
                      newEndTime
                    );
                  }}
                  enableResizing={{
                    left: true,
                    right: true,
                    top: false,
                    bottom: false,
                    topLeft: false,
                    topRight: false,
                    bottomLeft: false,
                    bottomRight: false,
                  }}
                  minWidth={20}
                  className="absolute z-20 rounded p-2 text-xs font-medium group hover:bg-opacity-50"
                  style={{
                    backgroundColor: event.color,
                    top: 0,
                    height: "100%",
                  }}
                >
                  <div className="event-content select-none relative">
                    <div className="truncate">New Event</div>
                    <div className="font-normal truncate">
                      {formatTime(event.startTime)} -{" "}
                      {formatTime(event.endTime)}
                    </div>
                    <SquareXIcon
                      color="white"
                      className="absolute -top-2 -right-2 z-30 hidden group-hover:flex size-4 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(event.id);
                      }}
                    />
                  </div>
                </Rnd>
              ))}
            {currentDragEvent &&
              currentDragEvent.resource === row &&
              currentDragEvent.day === dayIndex && (
                <div
                  className="absolute z-20 h-3/4 rounded p-2 text-xs font-medium group hover:bg-opacity-50"
                  style={{
                    left: `${currentDragEvent.start}px`,
                    width: `${currentDragEvent.width}px`,
                    top: 0,
                    backgroundColor: currentDragEvent.color,
                  }}
                >
                  <div className="event-content select-none">
                    <div className="truncate">New Event</div>
                    <div className="font-normal truncate">
                      {formatTime(currentDragEvent.startTime)} -{" "}
                      {formatTime(currentDragEvent.endTime)}
                    </div>
                  </div>
                </div>
              )}
          </div>
        );
      }
    }
    rows.push(
      <div
        className="grid grid-flow-col auto-cols-max grid-container"
        key={row}
      >
        {cells}
      </div>
    );
  }

  return <div className="h-full w-full">{rows}</div>;
};

export default Grid;
