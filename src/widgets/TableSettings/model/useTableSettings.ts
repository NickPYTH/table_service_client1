import {TableSettingsType} from "../model/types";

export const useTableSettings = ({visible, setVisible}: TableSettingsType) => {

    // Handlers
    const closeHandler = () => {
        setVisible(false);
    };
    // -----

    return {
        closeHandler,
    }
}
