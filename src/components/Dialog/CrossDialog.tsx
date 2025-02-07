import React from "react";

interface CrossDialogProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const CrossDialog: React.FC<CrossDialogProps> = ({
  message,
  onConfirm,
  onCancel,
}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black backdrop-blur-sm bg-opacity-50 z-50">
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <p className="mb-4">{message}</p>
        <div className="flex justify-end space-x-2">
          <button
            className="bg-red-300 text-gray-800 px-2 py-1 rounded text-sm hover:bg-red-500 hover:text-white"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="bg-green-300 text-gray-800 px-2 py-1 rounded text-sm hover:bg-green-500 hover:text-white"
            onClick={onConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default CrossDialog;
