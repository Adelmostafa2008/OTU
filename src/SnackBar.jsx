import { useEffect, useState } from "react";
import { FaCircleCheck } from "react-icons/fa6";
import { IoIosInformationCircle } from "react-icons/io";
import { BiSolidErrorAlt } from "react-icons/bi";
import { IoIosWarning } from "react-icons/io";

export default function SnackBar({ message, type }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message !== "") {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 4000); // fade out before unmount
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (message === "") return null;

  const color = {
    info: "bg-blue-600",
    success: "bg-green-600",
    error: "bg-red-600",
    warn : "bg-yellow-600",
  };

  let icon;
  switch (type) {
    case "success":
      icon = <FaCircleCheck size={20} />;
      break;
    case "info":
      icon = <IoIosInformationCircle size={20} />;
      break;
    case "error":
      icon = <BiSolidErrorAlt size={20} />;
      break;
    case "warn":
      icon = <IoIosWarning size={20} className="mb-1"/>
      break;
  }

  return (
    <div
      className={`flex gap-x-1.5 items-center ${color[type]} overflow-hidden mr-6 pr-20 py-4 pl-5 text-left rounded-lg text-white fixed bottom-5 left-5 z-[100]
      transform transition-all duration-500 ease-in-out
      ${visible ? "translate-x-0 opacity-100" : "-translate-x-10 opacity-0"}`}
    >
      {icon}
      {message}
    </div>
  );
}
