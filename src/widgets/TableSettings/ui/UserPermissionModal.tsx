import {AutoComplete, Button, Flex, Form, Modal, Popconfirm} from "antd";
import {useUserPermissionModal} from "../model/useUserPermissionModal";
import {UserPermissionModalFieldType, UserPermissionModalType} from "../model/types";
import React from "react";

export const UserPermissionModal = ({
                                        visible,
                                        setVisible,
                                        selectedUserPermissionId,
                                        setSelectedUserPermissionId,
                                        apiRef
                                    }: UserPermissionModalType) => {

    const {
        form,
        closeHandler,
        saveHandler,
        deleteHandler,
        userList,
        searchUserHandler,
        isUpdateLoading,
        isDeleteLoading,
        isGetLoading
    } = useUserPermissionModal({setVisible, selectedUserPermissionId, setSelectedUserPermissionId, apiRef});

    return (
        <Modal
            title={`${selectedUserPermissionId ? "Редактирование" : "Добавление"} пользователя`}
            open={visible}
            onCancel={closeHandler}
            okText="Сохранить"
            cancelText="Отменить"
            destroyOnHidden
            style={{top: 10}}
            footer={null}
            loading={isUpdateLoading || isGetLoading || isDeleteLoading}
        >
            <Form
                form={form}
                name="basic"
                labelCol={{span: 8}}
                wrapperCol={{span: 16}}
                style={{maxWidth: 700}}
                initialValues={{remember: true}}
                autoComplete="off"
            >
                <Form.Item<UserPermissionModalFieldType>
                    label="Пользователь"
                    name="username"
                    rules={[{required: true, message: 'Выберите пользователя'}]}
                >
                    <AutoComplete
                        options={userList}
                        onSearch={searchUserHandler}
                        placeholder="Введите ФИО"
                        allowClear
                        style={{width: '100%', height: 27}}
                    />
                </Form.Item>
                <Form.Item<UserPermissionModalFieldType>
                    label="Роль"
                    name="role"
                    rules={[{required: true, message: 'Выберите роль'}]}
                >
                    <AutoComplete
                        options={[
                            {value: "admin"},
                            {value: "owner"},
                            {value: "editor"},
                            {value: "reader"}
                        ]}
                        placeholder="Выберите роль"
                        allowClear
                        style={{width: '100%', height: 27}}
                    />
                </Form.Item>
                <Flex justify={'end'} gap={'small'}>
                    {selectedUserPermissionId && <Popconfirm
                        title={"Вы точно хотите удалить пользователя?"}
                        okText={"Да, точно"}
                        onConfirm={deleteHandler}
                    >
                        <Button danger type="primary">Удалить</Button>
                    </Popconfirm>
                    }
                    <Button type="primary" onClick={saveHandler}>Сохранить</Button>
                </Flex>
            </Form>
        </Modal>
    )
}