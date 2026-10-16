import {AutoComplete, Button, Flex, Form, Modal, Popconfirm} from "antd";
import {FilialPermissionModalFieldType, FilialPermissionModalType} from "../model/types";
import React from "react";
import {FILIALS} from "shared/config/constants";
import {useFilialPermissionModal} from "../model/useFilialPermissionModal";

export const FilialPermissionModal = ({
                                          visible,
                                          setVisible,
                                          selectedFilialPermissionId,
                                          setSelectedFilialPermissionId,
                                          apiRef
                                      }: FilialPermissionModalType) => {

    const {
        form,
        closeHandler,
        saveHandler,
        deleteHandler,
        isUpdateLoading,
        isDeleteLoading,
        isGetLoading
    } = useFilialPermissionModal({setVisible, selectedFilialPermissionId, setSelectedFilialPermissionId, apiRef});

    return (
        <Modal
            title={`${selectedFilialPermissionId ? "Редактирование" : "Добавление"} доступа филиала`}
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
                <Form.Item<FilialPermissionModalFieldType>
                    label="Филиал"
                    name="filial"
                    rules={[{required: true, message: 'Выберите филиал'}]}
                >
                    <AutoComplete
                        options={FILIALS}
                        placeholder="Выберите филиал"
                        allowClear
                        style={{width: '100%', height: 27}}
                    />
                </Form.Item>
                <Form.Item<FilialPermissionModalFieldType>
                    label="Роль"
                    name="role"
                    rules={[{required: true, message: 'Выберите роль'}]}
                >
                    <AutoComplete
                        options={[
                            {value: "editor"},
                            {value: "reader"}
                        ]}
                        placeholder="Выберите роль"
                        allowClear
                        style={{width: '100%', height: 27}}
                    />
                </Form.Item>
                <Flex justify={'end'} gap={'small'}>
                    {selectedFilialPermissionId && <Popconfirm
                        title={"Вы точно хотите удалить доступ филиала?"}
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