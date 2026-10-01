import ruRU from "antd/locale/ru_RU";
import {FC, JSX, ReactNode} from "react";
import {ConfigProvider} from "antd";
import dayjs from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import updateLocale from "dayjs/plugin/updateLocale";
import 'dayjs/locale/ru';

dayjs.extend(weekday);
dayjs.extend(updateLocale);

dayjs.updateLocale('ru', {
    weekStart: 1
});

interface Props {
    children: ReactNode;
}

const AntdProvider: ({children}: Props) => JSX.Element = ({children}) => {
    return (
        <ConfigProvider
            locale={ruRU}
            theme={{
                components: {
                    Table: {
                        cellPaddingInline: 2,
                        cellPaddingBlock: 2,
                        borderColor: '#c4c4c4'
                    }
                }
            }}
        >
            {children}
        </ConfigProvider>
    )
}

export default AntdProvider;