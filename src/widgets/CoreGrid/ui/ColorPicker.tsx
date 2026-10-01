import React, {useEffect, useState} from 'react';
import {ColorPicker, Modal} from "antd";
import {ColorPickerPropsType} from "widgets/CoreGrid/model/types";
import {tableAPI} from "service/TableService";
import {DataRowModel, TableContextType} from "pages/TablePage/types";

export const ColorPickerModal = (props: ColorPickerPropsType) => {
    const [chosenColor, setChosenColor] = useState("#1677ff")
    const [updateCellsColor,{
        isSuccess: colorUpdated,
    }] = tableAPI.useUpdateCellsColorMutation()


    useEffect(() => {
        if(colorUpdated){
            let cellIds = getActiveCells()
            if (props.tableContext) {
                const updatedRows = props.tableContext.rows.map(row => {
                    const newRow = { ...row } as Record<string, any>;
                    cellIds.forEach(cellId => {
                        Object.keys(newRow).forEach(key => {
                            const cell = newRow[key];
                            if (cell && typeof cell === 'object' && cell.id === cellId) {
                                newRow[key] = { ...cell, color: chosenColor };
                            }
                        });
                    });
                    return newRow as DataRowModel;
                });

                props.setContext((prev: TableContextType) => ({
                    ...prev,
                    rows: updatedRows
                }));
                props.apiRef.current.setCellSelectionModel({})
            }
        }
    },[colorUpdated])

    const getActiveCells = (): number[] => {
        const cellSelectionModel = props.apiRef.current.getCellSelectionModel();
        const cellIds: number[] = [];

        for (const [rowIdStr, columns] of Object.entries(cellSelectionModel)) {
            const rowId = Number(rowIdStr);
            const row = props.apiRef.current.getRow(rowId); // получаем строку по ID
            if (!row) continue;

            //@ts-ignore
            for (const colIdStr of Object.keys(columns)) {
                const colId = Number(colIdStr);
                const cell = (row as Record<string, any>)[String(colId)];
                if (cell && typeof cell === 'object' && cell.id) {
                    cellIds.push(cell.id);
                }
            }
        }
        return cellIds
    }

    return (
        <Modal
            title="Выбор цвета"
            open={props.isModalOpen}
            onCancel={() => props.setIsModalOpen(false)}
            onOk={() => {
                let cellIds = getActiveCells()


                // console.log("TEST", props.apiRef.current.set)
                updateCellsColor({pk:Number(props.tableId), cells:cellIds, color:chosenColor});
                // props.refreshTable();
            }}
        >
            <ColorPicker
                value={chosenColor}
                onChange={(color) => setChosenColor(color.toHexString())}
                presets={[
                    { label: 'Рекомендуемые', colors: ['#ff4d4f', '#1677ff', '#52c41a', '#faad14', '#722ed1'] },
                ]}
            />
            <div style={{ marginTop: 16 }}>
                Выбранный цвет: <span style={{ color: chosenColor }}>{chosenColor}</span>
            </div>
        </Modal>
    );
}
