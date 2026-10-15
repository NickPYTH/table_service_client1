import {useState} from "react";

export const usePageBar = () => {

    // States
    const [visibleTableSettingsModal, setVisibleTableSettingsModal] = useState<boolean>(false);
    // -----

    return {
        visibleTableSettingsModal,
        setVisibleTableSettingsModal,
    }
}