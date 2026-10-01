import type {UploadProps} from "antd";
import {Button, Divider, Flex, Input, Popconfirm, Tooltip, Upload} from "antd";
import {useEffect, useState} from "react";
import {GridColDef} from "@mui/x-data-grid-premium";
import {DataGrid} from "shared/component/DataGrid";
import {selectTypeAPI} from "service/SelectTypeService";
import {useNotification} from "app/providers/NotificationProvider/ui/NotificationProvider";
import {SelectTypeItemEditModal} from "pages/TablePage/ui/Settings/ColumnSettings/SelectTypeItemEditModal";
import {SelectTypeModel} from "entities/SelectTypeModel";
import {InfoCircleOutlined, UploadOutlined} from "@ant-design/icons";
import {host} from "shared/config/constants";
import {columnAPI} from "service/ColumnService";

type PropsType = {
    columnId: number;
}

export const SelectTypeList = (props:PropsType) => {

    // Notification context
    const notification = useNotification();
    // -----

    // States
    const [newSelectTypeRecord, setNewSelectTypeRecord] = useState("");
    const [isVisibleSelectTypeItemEditModal, setIsVisibleSelectTypeItemEditModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<SelectTypeModel | null>(null);
    const [uploading, setUploading] = useState(false);
    // -----

    // Web requests
    const [createSelectType, {
        isSuccess: isSuccessCreateType,
    }] = selectTypeAPI.useCreateMutation();
    const [deleteSelectType, {
        isSuccess: isSuccessDeleteType,
    }] = selectTypeAPI.useDeleteMutation();
    const [getSelectTypeList, {
        data: selectTypeList,
    }] = selectTypeAPI.useGetAllByColumnIdMutation();
    const [clearDuplicates, {
        isSuccess: isClearDuplicatesSuccess,
    }] = columnAPI.useClearDuplicatesMutation();
    // -----

    // Effects
    useEffect(() => {
        getSelectTypeList(props.columnId);
    }, []);
    useEffect(() => {
        if (isSuccessCreateType || isSuccessDeleteType) {
            getSelectTypeList(props.columnId);
            setNewSelectTypeRecord("");
        }
    }, [isSuccessCreateType, isSuccessDeleteType]);
    useEffect(() => {
        if (isClearDuplicatesSuccess) {
            alert("Дубли удалены!");
            getSelectTypeList(props.columnId);
        }
    }, [isClearDuplicatesSuccess])
    // -----

    // Useful utils
    const columns: GridColDef[] = [
        {
            field: "id",
            headerName: "ИД"
        },
        {
            field: "name",
            headerName: "Содержимое",
            width: 240
        },
        {
            field: "filial_owner_code",
            headerName: "Код филиала владельца (необязательно)",
            width: 200
        },
        {
            field: "actions",
            headerName: "",
            width: 180,
            renderCell: (params) => {
                return (<Flex justify={'center'} gap={'small'} style={{width: '100%'}}>
                    <Button size={'small'} onClick={() => {
                        setSelectedItem(params.row as SelectTypeModel);
                        setIsVisibleSelectTypeItemEditModal(true);
                    }}>
                        Изменить
                    </Button>
                    <Popconfirm title={"Вы точно хотите удалить "}
                                okText={"Да"}
                                onConfirm={() => deleteSelectType(params.id as number)}>
                        <Button
                            size={'small'}
                            danger>
                            Удалить
                        </Button>
                    </Popconfirm>
                </Flex>)
            }
        },
    ]
    // -----

    // Handlers
    const createSelectTypeHandler = () => {
        if (newSelectTypeRecord.trim()){
            if (selectTypeList?.find((st) => st.name == newSelectTypeRecord.trim())){
                notification.error({
                    message: "Нельзя так!",
                    description: "Такое значение уже существует"
                });
                return;
            }
            createSelectType({
                name: newSelectTypeRecord,
                column_id: props.columnId,
                filial_owner_code: null
            });
        } else {
            notification.error({
                message: "Нельзя так!",
                description: "Новое значение не может быть пустым"
            });
        }
    }

    // File upload handler
    const uploadProps: UploadProps = {
        name: 'file',
        action: `${host}/api/loadSelectList?columnId=${props.columnId}`,
        onChange(info) {
            if (info.file.status === 'uploading') {
                setUploading(true);
                return;
            }
            if (info.file.status === 'done') {
                setUploading(false);
                notification.success({
                    message: "Успешно!",
                    description: "Файл успешно загружен"
                });
                // Обновляем список после загрузки
                getSelectTypeList(props.columnId);
            } else if (info.file.status === 'error') {
                setUploading(false);
                notification.error({
                    message: "Ошибка!",
                    description: info.file.error?.message || "Не удалось загрузить файл"
                });
            }
        },
        beforeUpload: (file) => {
            const isXLSX = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                file.name.endsWith('.xlsx');
            if (!isXLSX) {
                notification.error({
                    message: "Ошибка!",
                    description: "Можно загружать только XLSX файлы"
                });
                return false;
            }
            return true;
        },
        showUploadList: false,
        accept: '.xlsx'
    };
    // -----

    return(
        <Flex vertical gap={'small'}>
            {(isVisibleSelectTypeItemEditModal && selectedItem) &&
                <SelectTypeItemEditModal
                    visible={isVisibleSelectTypeItemEditModal}
                    setVisible={setIsVisibleSelectTypeItemEditModal}
                    refresh={() => getSelectTypeList(props.columnId)}
                    item={selectedItem} /> }
            <Divider style={{margin: 0, padding: 0}} />
            <Flex gap={'small'}>
                <Input placeholder="Введите новое значение" size={'small'} value={newSelectTypeRecord} onChange={(e) => setNewSelectTypeRecord(e.target.value)}/>
                <Button onClick={createSelectTypeHandler} type={'primary'} size={'small'}>Добавить</Button>
            </Flex>
            <Flex gap={'small'} align="center" justify={'space-between'}>
                <Flex justify={'space-between'}>
                    <Upload {...uploadProps}>
                        <Button
                            icon={<UploadOutlined />}
                            loading={uploading}
                            size={'small'}
                        >
                            Загрузить XLSX
                        </Button>
                    </Upload>
                    <Tooltip
                        title={
                            <div>
                                <div>Файл должен содержать:</div>
                                <div>1 1 лист</div>
                                <div>2 Данные в колонках от A1 до AN</div>
                                <div>3 Поддерживается формат .xlsx</div>
                                <div>4 Предыдущие данные пропадут</div>
                            </div>
                        }
                        placement="right"
                    >
                        <InfoCircleOutlined style={{ color: '#1890ff', cursor: 'help' }} />
                    </Tooltip>
                </Flex>
                <Button size={'small'} onClick={() => clearDuplicates(props.columnId)}>Удалить дубликаты</Button>
            </Flex>
            {selectTypeList &&
                <DataGrid columns={columns} gridData={selectTypeList} setSelected={() => {}} setModalVisible={() => {}}/>
            }
        </Flex>
    )
}