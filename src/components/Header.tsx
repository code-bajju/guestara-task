import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ChevronRightIcon, ChevronLeftIcon } from "lucide-react";
import { format } from "date-fns";

// Define the interface for the Header component props
interface HeaderProps {
  selectedDate: Date;
  handleDateChange: (date: Date) => void;
  prevMonth: () => void;
  nextMonth: () => void;
  scrollToToday: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedDate,
  handleDateChange,
  prevMonth,
  nextMonth,
  scrollToToday,
}) => {
  const [isDatePickerOpen, setIsDatePickerOpen] = React.useState(false); // State to manage the visibility of the DatePicker

  return (
    <div className="flex justify-between items-center bg-gray-100 py-2 px-4 w-full sticky top-0 z-40">
      <div className="relative">
        <button
          className="text-2xl font-regular text-blue-500 hover:opacity-70"
          onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
        >
          {format(selectedDate, "MMMM yyyy")}
        </button>
        {isDatePickerOpen && (
          <div className="absolute top-full mt-2 left-0 z-50">
            <DatePicker
              selected={selectedDate}
              onChange={(date) => {
                if (date) handleDateChange(date);
                setIsDatePickerOpen(false);
              }}
              dateFormat="MMMM/yyyy"
              inline
              className="bg-white border rounded-lg shadow-lg"
            />
          </div>
        )}
      </div>
      <div className="flex space-x-4 items-center">
        <button onClick={prevMonth}>
          <ChevronLeftIcon
            color="rgb(59 130 246)"
            className="hover:opacity-70"
          />
        </button>
        <button
          className="bg-none text-lg text-blue-500 hover:opacity-70 font-medium"
          onClick={scrollToToday}
        >
          Today
        </button>
        <button onClick={nextMonth}>
          <ChevronRightIcon
            color="rgb(59 130 246)"
            className="hover:opacity-70"
          />
        </button>
      </div>
    </div>
  );
};
