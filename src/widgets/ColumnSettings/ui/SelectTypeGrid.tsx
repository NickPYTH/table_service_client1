import {Button, Divider, Flex, Typography} from "antd";
import {DataGridPremium} from "@mui/x-data-grid-premium";
import {useSelectTypeGrid} from "widgets/ColumnSettings/store/useSelectTypeGrid";
import {ruRU} from "@mui/x-data-grid-premium/locales";

const {Title} = Typography;

export const SelectTypeGrid = () => {

    const {
        columns
    } = useSelectTypeGrid();

    return (
        <Flex vertical gap={'small'}>
            <Divider style={{margin: 0}}/>
            <Title level={5}>Настройка выбора из списка</Title>
            <Flex gap={'small'}>
                <Button size={'small'}>Добавить</Button>
            </Flex>
            <DataGridPremium
                columns={columns}
                columnHeaderHeight={50}
                rowHeight={31}
                disableAggregation
                disableRowGrouping
                disablePivoting
                localeText={ruRU.components.MuiDataGrid.defaultProps.localeText}
            />
        </Flex>
    )
}