import React, {useEffect, useState} from "react";
import {Button, Flex, Input, Modal} from "antd";
import {SelectTypeModel} from "entities/SelectTypeModel";
import {selectTypeAPI} from "service/SelectTypeService";

type PropsType = {
    visible: boolean;
    setVisible: Function;
    refresh: Function;
    item: SelectTypeModel;
}

export const SelectTypeItemEditModal = (props:PropsType) => {

    // States
    const [name, setName] = useState(props.item.name);
    const [code, setCode] = useState(props.item.filial_owner_code);
    // -----

    // Web requests
    const [update, {
        isSuccess: isSuccessUpdate,
    }] = selectTypeAPI.useUpdateMutation();
    // ----

    // Effects
    useEffect(() => {
        if (isSuccessUpdate) {
            props.setVisible(false);
            props.refresh();
        }
    }, [isSuccessUpdate]);
    // -----

    // Handlers
    const updateHandler = () => {
        if (name){
            update({...props.item, name: name, filial_owner_code: code});
        }
    };
    // -----

    return (
        <Modal title={`Редактирование`}
               maskClosable={false}
               open={props.visible}
               onCancel={() => props.setVisible(false)}
               width={'650px'}
               loading={false}
               footer={() => (<></>)}
        >
            <Flex gap={'small'} vertical>
                <Flex gap={'small'} justify={'space-between'} align={'center'}>
                    <div>Значение</div>
                    <Input value={name} onChange={(e) => setName(e.target.value)}/>
                </Flex>
                <Flex gap={'small'} justify={'space-between'} align={'center'}>
                    <div>Код филиала владельца</div>
                    <Input value={code ?? ""} onChange={(e) => setCode(e.target.value)}/>
                </Flex>
                <Button onClick={updateHandler}>Сохранить</Button>
            </Flex>
        </Modal>
    )
}