import {GridRenderEditCellParams} from "@mui/x-data-grid-premium";
import {Flex, Spin, AutoComplete} from "antd";
import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {columnV2API} from "service/ColumnV2Service";

type PropsType = {
    params: GridRenderEditCellParams;
    columnId: number
}
export const SelectEditCell = ({params, columnId}: PropsType) => {

    // Params
    const {id} = useParams();
    const {field, value, api, id: rowId} = params;
    // -----

    // States
    const [selectValue, setSelectValue] = useState(value);
    const [selectList, setSelectList] = useState<{value: string, label: string}[]>([]);
    // -----

    // Web requests
    const [getSelectList, {
        isLoading: isSelectListLoading,
        data: selectListData,
    }] = columnV2API.useGetColumnSelectListMutation();
    // -----

    // Effects
    useEffect(() => {
        getSelectList(columnId);
    }, []);
    useEffect(() => {
        if (selectListData){
            setSelectList(selectListData.rows.map(r=>({label: r.value, value: r.value})));
        }
    }, [selectListData]);
    // -----

    // Handlers
    const onSelectHandler = (selectedValue:any) => {
        setSelectValue(selectedValue);
    };
    const onChangeHandler = (value:string) => {
        setSelectValue(value);
        api.setEditCellValue({id:rowId, field, value})
    };
    // -----

    if (isSelectListLoading)
        return <Flex justify={'center'} align={'center'} style={{width: '100%'}}><Spin /></Flex>
    return(
        <AutoComplete
            autoFocus={true}
            options={selectList}
            value={selectValue}
            onChange={onChangeHandler}
            onSelect={onSelectHandler}
            placeholder="Выберите значение"
            allowClear
            style={{ width: '100%', height: 27 }}
        />
    )
}
