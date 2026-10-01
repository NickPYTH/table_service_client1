import {Modal, Select, Button, Space} from "antd";
import {GridCellSelectionModel} from "@mui/x-data-grid-premium";
import {DataRowModel} from "pages/TablePage/types";
import {useContext, useEffect, useState} from "react";
import {TableContext} from "pages/TablePage/ui/TablePage";
import {cellAPI} from "service/CellService";

type PropsType = {
    visible: boolean,
    setVisible: Function,
    cellSelectionModel: GridCellSelectionModel
}

export const InsertSelectedValueModal = (props:PropsType) => {
    // Context
    const tableContext = useContext(TableContext);
    // -----

    // States
    const [selectedCellValue, setSelectedCellValue] = useState<string | null>(null);
    const [valueList, setValueList] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    // -----

    // Web requests
    const [updateRange, {isLoading: isUpdating}] = cellAPI.useUpdateRangeMutation();
    // -----

    // Effects
    useEffect(() => {
        if (tableContext) {
            const data = tableContext.rows;
            let valueList: string[] = [];
            console.log(props.cellSelectionModel)
            // Обход строк
            Object.keys(props.cellSelectionModel).forEach((rowId: any) => {
                const row = data.find((row: DataRowModel) => row.id == rowId);
                if (row) {
                    // Обход колонок
                    Object.keys(props.cellSelectionModel[rowId]).forEach((columnId: string) => {
                        //@ts-ignore
                        const cell = row[columnId];
                        if (cell && typeof cell === 'object' && cell.value) {
                            if (!valueList.includes(cell.value)) {
                                valueList.push(cell.value);
                            }
                        }
                    });
                }
            });

            // Сортируем значения для удобства
            valueList.sort();
            // Добавляем пустое значение в начало списка
            valueList.unshift('');

            setValueList(valueList);

            // Устанавливаем первое непустое значение по умолчанию
            const firstValue = valueList.find(v => v !== '');
            setSelectedCellValue(firstValue || null);
        }
    }, [props.cellSelectionModel, tableContext]);
    // -----

    // Handlers
    const updateHandler = async () => {
        if (!tableContext || selectedCellValue === null) return;

        setIsLoading(true);

        try {
            const data = tableContext.rows;
            const cells: {value: string, id: number, formula_value: string}[] = [];

            // Обход строк
            Object.keys(props.cellSelectionModel).forEach((rowId: any) => {
                const row = data.find((row: DataRowModel) => row.id == rowId);
                if (row) {
                    // Обход колонок
                    Object.keys(row).forEach((columnId: string) => {
                        //@ts-ignore
                        const cell = row[columnId];
                        if (cell && typeof cell === 'object') {
                            const selectedColumnId = props.cellSelectionModel[rowId];
                            if (selectedColumnId && selectedColumnId[cell.column]) {
                                cells.push({
                                    id: cell.id,
                                    value: selectedCellValue,
                                    formula_value: ""
                                });
                            }
                        }
                    });
                }
            });

            if (cells.length > 0) {
                await updateRange(cells).unwrap();
                props.setVisible(false);
            }
        } catch (error) {
            console.error('Ошибка при обновлении ячеек:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        if (!isLoading) {
            props.setVisible(false);
        }
    };

    const handleSelectChange = (value: string) => {
        setSelectedCellValue(value);
    };
    // -----

    return(
        <Modal
            title="Выберите значение"
            maskClosable={false}
            open={props.visible}
            onCancel={handleCancel}
            width={500}
            footer={[
                <Button
                    key="cancel"
                    onClick={handleCancel}
                    disabled={isLoading}
                >
                    Отмена
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    onClick={updateHandler}
                    loading={isLoading || isUpdating}
                >
                    Применить
                </Button>
            ]}
        >
            <Space direction="vertical" style={{width: '100%'}} size="middle">
                <div>
                    <p style={{marginBottom: 8}}>Выберите значение для вставки в выбранные ячейки:</p>
                    <Select
                        style={{width: '100%'}}
                        placeholder="Выберите значение"
                        value={selectedCellValue}
                        onChange={handleSelectChange}
                        options={valueList.map(value => ({
                            label: value || '(пусто)',
                            value: value
                        }))}
                        showSearch
                        filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        disabled={isLoading}
                    />
                </div>
                {valueList.length === 0 && (
                    <div style={{color: '#ff4d4f'}}>
                        Нет доступных значений для выбора
                    </div>
                )}
            </Space>
        </Modal>
    )
}