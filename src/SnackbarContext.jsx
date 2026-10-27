import { useState, useContext, createContext } from "react";
import SnackBar from "./SnackBar.jsx";

const ShowSnackBarContext = createContext();

export const SnackBarProvider = ({ children }) => {
    const [snack, setSnack] = useState({ message: "", type: "" });

    const ShowSnackBar = (mes, ty) => {
        setSnack({ message: mes, type: ty });
        setTimeout(() => setSnack({ message: "", type: "" }), 4500);

    }
    return (
        <ShowSnackBarContext.Provider value={{ ShowSnackBar }}>
            {children}
            <SnackBar message={snack.message} type={snack.type} />
        </ShowSnackBarContext.Provider>
    );
}

export const useSnack = () => useContext(ShowSnackBarContext);