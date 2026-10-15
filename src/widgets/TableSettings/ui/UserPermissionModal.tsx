import {Button, Flex, Input, List, Modal} from "antd";
import { useUserPermissionModal } from "../model/useUserPermissionModal";
import { UserPermissionModalType } from "../model/types";

export const UserPermissionModal = ({visible, setVisible}:UserPermissionModalType) => {

    const {

    } = useUserPermissionModal();

    return(
        <Modal
            title={`Добавление пользователя`}
            open={visible}
            onCancel={() => setVisible(false)}
            okText="Сохранить"
            cancelText="Отменить"
            destroyOnHidden
            style={{top: 10}}
        >
            <Flex gap={'small'}>
                <Input placeholder={'Введите часть ФИО или табельного номера'}/>
                <Button>Найти</Button>

            </Flex>
        </Modal>
    )
}