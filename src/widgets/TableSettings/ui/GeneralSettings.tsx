import {Button, Flex, Form, Input} from "antd";
import {FieldType} from "widgets/TableSettings/model/types";
import React from "react";
import {useGeneralSettings} from "widgets/TableSettings/model/useGeneralSettings";

export const GeneralSettings = () => {

    const {
        form,
        saveHandler,
        isGetLoading,
        isUpdateLoading
    } = useGeneralSettings();

    return(
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
                name="alternative_name"
                rules={[{required: true, message: 'Введите название'}]}
            >
                <Input/>
            </Form.Item>
            <Flex justify={'end'}>
                <Button disabled={isGetLoading || isUpdateLoading} type="primary" onClick={saveHandler}>Сохранить</Button>
            </Flex>
        </Form>
    )
}