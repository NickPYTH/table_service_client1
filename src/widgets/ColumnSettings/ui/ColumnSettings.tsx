import {useColumnSettings} from "../store/useColumnSettings";
import {FieldType} from "widgets/ColumnSettings/store/types";
import {Checkbox, Form, Input, Modal, Select} from 'antd';
import {COLUMN_TYPES} from "shared/config/constants";
import {SelectTypeGrid} from "widgets/ColumnSettings/ui/SelectTypeGrid";

const ColumnSettings = () => {

    const {
        columnServerData,
        tableV2State,
        form,
        saveHandler,
        closeHandler,
        isGetLoading,
        isUpdateLoading
    } = useColumnSettings();

    return (
        <Modal
            title={`Настройка колонки`}
            open={tableV2State.isVisibleColumnSettingsModal}
            onOk={saveHandler}
            onCancel={closeHandler}
            okText="Сохранить"
            cancelText="Отменить"
            loading={isGetLoading || isUpdateLoading}
            destroyOnHidden
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
                <Form.Item<FieldType>
                    label="Название"
                    name="name"
                    rules={[{required: true, message: 'Введите название'}]}
                >
                    <Input/>
                </Form.Item>

                <Form.Item<FieldType>
                    label="Тип"
                    name="type"
                    rules={[{required: true, message: 'Выберите тип'}]}
                >
                    <Select
                        placeholder="Выберите тип"
                        options={COLUMN_TYPES}
                    />
                </Form.Item>

                <Form.Item<FieldType>
                    label="Скрытая колонка"
                    name="hidden"
                    valuePropName="checked"
                >
                    <Checkbox/>
                </Form.Item>

                <Form.Item<FieldType>
                    label="Обязательная колонка"
                    name="required"
                    valuePropName="checked"
                >
                    <Checkbox/>
                </Form.Item>

                <Form.Item<FieldType>
                    label="Только просмотр"
                    name="readonly"
                    valuePropName="checked"
                >
                    <Checkbox/>
                </Form.Item>
            </Form>
            {columnServerData?.type == 'list' &&
                <SelectTypeGrid columnId={columnServerData.id}/>
            }
        </Modal>
    )
}

export default ColumnSettings;