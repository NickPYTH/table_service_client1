import {useColumnSettings} from "../store/useColumnSettings";
import {ColumnSettingsType, FieldType} from "widgets/ColumnSettings/store/types";
import {Form, Input, Modal, Select} from 'antd';
import {COLUMN_TYPES} from "shared/config/constants";

const ColumnSettings = () => {

    const {
        tableV2State,
        form,
        saveHandler,
        closeHandler,
        isGetLoading,
        isUpdateLoading
    } = useColumnSettings();

    return (
        <Modal
            title="Настройки колонки"
            open={tableV2State.isVisibleColumnSettingsModal}
            onOk={saveHandler}
            onCancel={closeHandler}
            okText="Сохранить"
            cancelText="Отменить"
            loading={isGetLoading || isUpdateLoading}
            destroyOnClose
        >
            <Form
                form={form}
                name="basic"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                style={{ maxWidth: 600 }}
                initialValues={{ remember: true }}
                autoComplete="off"
            >
                <Form.Item<FieldType>
                    label="Название"
                    name="name"
                    rules={[{ required: true, message: 'Введите название' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item<FieldType>
                    label="Тип"
                    name="type"
                    rules={[{ required: true, message: 'Выберите тип' }]}
                >
                    <Select
                        placeholder="Выберите тип"
                        options={COLUMN_TYPES}
                    />
                </Form.Item>

            </Form>
        </Modal>
    )
}

export default ColumnSettings;