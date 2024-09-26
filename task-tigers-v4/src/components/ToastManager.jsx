import React, { useEffect, useState, useRef } from "react";
import { toast, Toaster } from "react-hot-toast";
import { ToastContext } from "../context/ToastContext";

// ToastManager to control toast notifications globally
const ToastManager = ({ children }) => {
  const [toastQueue, setToastQueue] = useState([]); // Queue to hold the toasts
  const toastActive = useRef(false); // Track if a toast is currently active

  // Show the next toast when the queue changes
  useEffect(() => {
    if (toastQueue.length > 0 && !toastActive.current) {
      showNextToast();
    }
  }, [toastQueue]);

  // Function to show the next toast from the queue
  const showNextToast = () => {
    if (toastQueue.length === 0) return;

    toastActive.current = true; // Mark toast as active
    const { message, type } = toastQueue[0]; // Extract first toast from the queue

    toast[type](message, {
      id: "global-toast", // Ensure the same toast ID
      duration: 2000, // Customize the toast duration if needed
      onClose: () => {
        toastActive.current = false; // Mark toast as inactive
        setToastQueue((queue) => queue.slice(1)); // Remove the current toast from the queue

        // Add delay of 1.5 seconds before showing the next toast
        setTimeout(() => {
          if (toastQueue.length > 1) {
            showNextToast();
          }
        }, 3000); // 1.5-second delay
      },
    });
  };

  // Function to add a toast to the queue
  const addToast = (message, type = "success") => {
    setToastQueue((queue) => [...queue, { message, type }]);
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <Toaster /> {/* Global Toaster component for showing toasts */}
    </ToastContext.Provider>
  );
};

export default ToastManager;
