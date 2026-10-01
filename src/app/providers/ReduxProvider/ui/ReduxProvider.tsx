import {FC, JSX, ReactNode} from "react";
import {Provider} from "react-redux";
import {setupStore} from "store/store";

const store = setupStore();

interface Props {
    children: ReactNode;
}

const ReduxProvider: ({children}: Props) => JSX.Element = ({children}) => {
    return (
        <Provider store={store}>
            {children}
        </Provider>
    )
}

export default ReduxProvider;