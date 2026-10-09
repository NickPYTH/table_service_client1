import {useRowSettings} from "../store/useRowSettings";
import {Modal} from "antd";

export const RowSettings = () => {

    const {
        tableV2State,
        saveHandler,
        closeHandler,
    } = useRowSettings();

    return(
        <Modal
            title="Настройки строки"
            open={tableV2State.isVisibleRowSettingsModal}
            onOk={saveHandler}
            onCancel={closeHandler}
            okText="Сохранить"
            cancelText="Отменить"
            //loading={isGetLoading || isUpdateLoading}
            destroyOnClose
        >
            kek
        </Modal>
    )
}