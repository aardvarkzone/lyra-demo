"use client";

import { Toaster, toast } from "sonner";
import { IoCheckmarkCircle, IoInformationCircle } from "react-icons/io5";

/**
 * Toast notification component and utility functions
 * Provides success and info toast notifications with customizable styling
 */

// Success toast with green background and checkmark icon
export const showSuccessToast = (message: string) => {
  toast.success(message, {
    position: "bottom-left",
    duration: 4000,
    icon: <IoCheckmarkCircle className="w-5 h-5" />,
    style: {
      background: "rgb(22 163 74)",
      color: "white",
    },
  });
};

// Info toast with blue background and info icon
export const showInfoToast = (message: string) => {
  toast.info(message, {
    position: "bottom-left",
    duration: undefined, // Will stay until manually dismissed
    icon: <IoInformationCircle className="w-5 h-5" />,
    style: {
      background: "rgb(59 130 246)",
      color: "white",
    },
  });
};

export const ToastContainer = () => {
  return <Toaster theme="dark" closeButton richColors />;
};
