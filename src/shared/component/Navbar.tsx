import React, {useEffect, useState} from 'react';
import {Menu, MenuProps} from 'antd';
import {useLocation, useNavigate, useParams} from "react-router-dom";
import {userAPI} from "service/UserService";
import {useDispatch, useSelector} from "react-redux";
import {setCurrentUser, setFilials} from "store/slice/GeneralSlice";
import {RootStateType} from "store/store";
import {filialAPI} from "service/FilialService";

export const Navbar = () => {

    // Useful utils
    const currentUser = useSelector((state: RootStateType) => state.currentUser.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const regex = /^\/table_service\/tables_list\/\d+$/;
    // -----

    // States
    const [items, setItems] = useState<MenuProps['items']>([]);
    const [current, setCurrent] = useState(() => {
        if (location.pathname == '/table_service/tables_list') return 'tables_list';
        if (location.pathname == '/table_service/tutorial') return 'tutorial';
        return "";
    });
    // -----

    // Web requests
    const [getCurrentUser, {
        data: currentUserData,
        isLoading: isCurrentUserLoading
    }] = userAPI.useGetCurrentMutation();
    const [getFilials, {
        data: filials,
        isLoading: isFilialsLoading
    }] = filialAPI.useGetAllMutation();
    // -----

    // Effects
    useEffect(() => {
        getCurrentUser();
        getFilials();
    }, []);
    useEffect(() => {
        if (currentUserData) {
            if (currentUserData.id == null)
                navigate(`table_service/error_403`);
        }
        setItems([
            {
                label: 'Мои таблицы',
                key: 'tables_list',
            },
            {
                label: 'Инструкция',
                key: 'tutorial',
            },
        ]);
        dispatch(setCurrentUser(currentUserData))
    }, [currentUserData]);
    useEffect(() => {
        setCurrent(() => {
            if (location.pathname == '/table_service/tables_list') return 'tables_list';
            if (location.pathname == '/table_service/tutorial') return 'tutorial';
            return "";
        });
    }, [location]);
    useEffect(() => {
        if (filials) {
            dispatch(setFilials(filials));
        }
    }, [filials]);
    // -----

    // Handlers
    const onClick: MenuProps['onClick'] = (e) => {
        setCurrent(e.key);
        if (e.key === 'tables_list') navigate(`table_service/tables_list`)
        if (e.key === 'tutorial') navigate(`table_service/tutorial`)
    };
    // -----
    if (regex.test(location.pathname))
        return <></>
    return (<>
            <Menu id={'navbar'} disabled={isCurrentUserLoading || isFilialsLoading} onClick={onClick} selectedKeys={[current]} mode="horizontal" items={items}/>
        </>
    );
};
