import {useParams} from "react-router-dom";
import {useNotification} from "app/providers/NotificationProvider";
import {useDispatch, useSelector} from "react-redux";
import {setIsVisibleColumnSettingsModal, TableV2ModelStateType} from "store/slice/TableV2Slice";

export const useRowSettings = () => {

    // Params
    const {id} = useParams();
    // -----

    // Notification
    const notification = useNotification();
    // -----

    // Store
    const tableV2State = useSelector((state:{tableV2Slice:TableV2ModelStateType}) => state.tableV2Slice);
    const dispatch = useDispatch();
    // -----

    // Handlers
    const saveHandler = async () => {

    };
    const closeHandler = () => {
        dispatch(setIsVisibleColumnSettingsModal(false));
    };
    // -----

    return {
        tableV2State,
        saveHandler,
        closeHandler,
    }
}