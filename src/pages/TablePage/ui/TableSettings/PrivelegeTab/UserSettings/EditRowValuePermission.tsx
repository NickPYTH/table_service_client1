import { Button, Flex, Select, Modal, Table, Popconfirm, Typography, notification, Input, Tag, Popover, Checkbox } from "antd";
import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { rowValuePermissionsApi } from "service/RowValuePermissionsService";
import { userAPI } from "service/UserService";
import { columnAPI } from "service/ColumnService";
import { ProfileModel } from "entities/ProfileModel";
import { UserModel } from "entities/UserModel";
import { RowValuePermission } from "entities/RowValuePermission";
import { tableAPI } from "service/TableService";

const { Text } = Typography;

type ModalProps = {
    visible: boolean;
    setVisible: (visible: boolean) => void;
    tableId: string;
};

type RowValuePermissionForm = {
    id?: number;
    clientKey: string;
    column_id: number;
    user_ids: number[];
    cell_value: string;
};

type OptionType = {
    value: number;
    label: string;
};

const makeClientKey = () =>
    `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const getRecordKey = (r: { clientKey: string }) => r.clientKey;

const ruleKey = (columnId: number, cellValue: string) =>
    `${columnId}|${(cellValue || "").trim()}`;

const sameIds = (a: number[], b: number[]) => {
    if (a.length !== b.length) return false;
    const sa = a.slice().sort((x, y) => x - y);
    const sb = b.slice().sort((x, y) => x - y);
    return sa.every((v, i) => v === sb[i]);
};

const normalizeList = (raw: any): RowValuePermission[] => {
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.data)) return raw.data;
    if (Array.isArray(raw?.results)) return raw.results;
    return [];
};

const getErrorText = (err: any) => {
    const data = err?.data;
    if (typeof data === "string" && data.trim()) return data;
    if (data?.detail) {
        return Array.isArray(data.detail) ? data.detail.join("; ") : String(data.detail);
    }
    if (Array.isArray(data?.non_field_errors) && data.non_field_errors.length) {
        return data.non_field_errors.join("; ");
    }
    if (data && typeof data === "object") {
        const parts: string[] = [];
        Object.keys(data).forEach((key) => {
            const val = data[key];
            if (Array.isArray(val)) parts.push(`${key}: ${val.join(", ")}`);
            else if (val != null && val !== "") parts.push(`${key}: ${String(val)}`);
        });
        if (parts.length) return parts.join("; ");
    }
    return err?.error || err?.message || "Неизвестная ошибка";
};

const applyPendingInputs = (
    list: RowValuePermissionForm[],
    cellInputValues: { [key: string]: string },
): RowValuePermissionForm[] =>
    list.map((p) => {
        const key = getRecordKey(p);
        return cellInputValues[key] !== undefined
            ? { ...p, cell_value: cellInputValues[key] }
            : p;
    });

const toFormRows = (server: RowValuePermission[]): RowValuePermissionForm[] =>
    (server || []).map((p) => ({
        id: p.id,
        clientKey: p.id != null ? `srv-${p.id}` : makeClientKey(),
        column_id: p.column_id,
        user_ids: (p.user_ids || []).slice(),
        cell_value: p.cell_value || "",
    }));

const UserSelectPopover = React.memo(({
                                          value,
                                          recordKey,
                                          searchResults,
                                          isSearching,
                                          onSearch,
                                          onToggle,
                                          open,
                                          onOpenChange,
                                          getUserDisplayName,
                                          usersMap,
                                      }: {
    value: number[];
    recordKey: string;
    searchResults: ProfileModel[] | undefined;
    isSearching: boolean;
    onSearch: (text: string) => void;
    onToggle: (recordKey: string, userId: number, checked: boolean) => void;
    open: boolean;
    onOpenChange: (recordKey: string, visible: boolean) => void;
    getUserDisplayName: (user: UserModel) => string;
    usersMap: Map<number, UserModel>;
}) => {
    const [searchText, setSearchText] = useState("");
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const getLabel = useCallback((userId: number) => {
        const user = usersMap.get(userId);
        return user ? getUserDisplayName(user) : `ID: ${userId}`;
    }, [usersMap, getUserDisplayName]);

    const options: OptionType[] = useMemo(() => {
        const resultOptions: OptionType[] = (searchResults || []).map((profile: ProfileModel) => ({
            value: profile.user.id,
            label: getUserDisplayName(profile.user),
        }));

        const selectedIds = new Set(resultOptions.map((o) => o.value));
        const selectedOptions: OptionType[] = value
            .filter((id) => !selectedIds.has(id))
            .map((id) => ({ value: id, label: getLabel(id) }));

        return selectedOptions.concat(resultOptions);
    }, [searchResults, value, getUserDisplayName, getLabel]);

    const handleSearchChange = useCallback((text: string) => {
        setSearchText(text);
        if (searchTimeout.current) clearTimeout(searchTimeout.current);

        if (text.length > 1) {
            searchTimeout.current = setTimeout(() => onSearch(text), 300);
        } else if (text.length === 0) {
            onSearch("");
        }
    }, [onSearch]);

    useEffect(() => () => {
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
    }, []);

    useEffect(() => {
        if (!open) {
            setSearchText("");
            onSearch("");
        }
    }, [open, onSearch]);

    const selectedNames = value.slice(0, 3).map((id) => ({ id, name: getLabel(id) }));
    const remaining = value.length > 3 ? value.length - 3 : 0;
    const displayOptions = options.length > 50 ? options.slice(0, 50) : options;

    const popoverContent = (
        <div style={{ width: 320, maxHeight: 400, display: "flex", flexDirection: "column" }}>
            <Input.Search
                placeholder="Поиск пользователей..."
                onChange={(e) => handleSearchChange(e.target.value)}
                loading={isSearching}
                style={{ marginBottom: 8, flexShrink: 0 }}
                allowClear
                size="small"
                value={searchText}
            />
            <div style={{ flex: 1, overflow: "auto", minHeight: 200, maxHeight: 300 }}>
                {displayOptions.length > 0 ? (
                    displayOptions.map((option) => (
                        <div
                            key={option.value}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                padding: "4px 8px",
                                borderRadius: 4,
                                cursor: "pointer",
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "#f5f5f5"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                        >
                            <Checkbox
                                checked={value.includes(option.value)}
                                onChange={(e) => onToggle(recordKey, option.value, e.target.checked)}
                            />
                            <span style={{ fontSize: 13 }}>{option.label}</span>
                        </div>
                    ))
                ) : (
                    <div style={{ textAlign: "center", padding: "20px 0" }}>
                        <Text type="secondary">
                            {isSearching
                                ? "Поиск..."
                                : searchText.length > 1
                                    ? "Пользователи не найдены"
                                    : "Введите имя для поиска"}
                        </Text>
                    </div>
                )}
            </div>
            <div
                style={{
                    marginTop: 8,
                    borderTop: "1px solid #f0f0f0",
                    paddingTop: 8,
                    display: "flex",
                    justifyContent: "space-between",
                }}
            >
                <Text type="secondary">Выбрано: {value.length}</Text>
                {options.length > 50 && (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        Показано: 50 из {options.length}
                    </Text>
                )}
            </div>
        </div>
    );

    return (
        <Popover
            content={popoverContent}
            title={<span style={{ fontSize: 14 }}>Выбор пользователей</span>}
            trigger="click"
            open={open}
            onOpenChange={(visible) => onOpenChange(recordKey, visible)}
            placement="bottomLeft"
            overlayStyle={{ maxWidth: 340 }}
        >
            <Button style={{ width: "100%", textAlign: "left", height: "auto", minHeight: 24 }}>
                {value.length === 0 ? (
                    <Text type="secondary" style={{ fontSize: 13 }}>Выберите пользователей</Text>
                ) : (
                    <span style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {selectedNames.map(({ id, name }) => (
                            <Tag key={id} style={{ margin: 0, fontSize: 12 }}>
                                {name.length > 20 ? `${name.slice(0, 20)}...` : name}
                            </Tag>
                        ))}
                        {remaining > 0 && <Tag style={{ margin: 0 }}>+{remaining}</Tag>}
                    </span>
                )}
            </Button>
        </Popover>
    );
});

export const EditRowValuePermission = (props: ModalProps) => {
    const [permissions, setPermissions] = useState<RowValuePermissionForm[]>([]);
    const [initialPermissions, setInitialPermissions] = useState<RowValuePermissionForm[]>([]);
    const [pendingDeletes, setPendingDeletes] = useState<number[]>([]);
    const [selectedUsersMap, setSelectedUsersMap] = useState<Map<number, UserModel>>(new Map());
    const [popoverVisible, setPopoverVisible] = useState<{ [key: string]: boolean }>({});
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [cellInputValues, setCellInputValues] = useState<{ [key: string]: string }>({});

    const hydratedRef = useRef(false);
    const isSavingRef = useRef(false);

    const [getColumns, {
        data: tableColumns,
        isLoading: isLoadingColumns,
    }] = columnAPI.useGetAllByTableIdMutation();

    const [getPermissions, {
        data: existingPermissions,
        isLoading: isLoadingPermissions,
    }] = rowValuePermissionsApi.useGetAllByTableIdMutation();

    const [getAllUsers, {
        data: allUsers,
        isLoading: isLoadingAllUsers,
        isError: isUsersError,
        isSuccess: isUsersSuccess,
    }] = userAPI.useGetAllByIdMutation();

    const [searchUsers, {
        data: searchResults,
        isLoading: isSearching,
    }] = userAPI.useSearchMutation();

    const [createPermission, { isLoading: isCreating }] =
        rowValuePermissionsApi.useCreateMutation();

    const [deletePermission, { isLoading: isDeleting }] =
        rowValuePermissionsApi.useDeleteMutation();

    const [updatePermissions, { isLoading: isUpdating }] =
        tableAPI.useUpdateRowValuePermissionsMutation();

    const getUserFullName = useCallback((user: UserModel) => {
        const parts: string[] = [];
        if (user.last_name) parts.push(user.last_name);
        if (user.first_name) parts.push(user.first_name);
        const fullName = parts.join(" ").trim();
        return fullName || user.username || user.email || `ID: ${user.id}`;
    }, []);

    const getUserDisplayName = useCallback((user: UserModel) => (
        `${getUserFullName(user)} (${user.username})`
    ), [getUserFullName]);

    const applyHydration = useCallback((server: RowValuePermission[]) => {
        const formatted = toFormRows(server);
        setPermissions(formatted);
        setInitialPermissions(formatted.map((p) => ({
            ...p,
            user_ids: p.user_ids.slice(),
        })));
        setPendingDeletes([]);
        setCellInputValues({});
        setPopoverVisible({});
    }, []);

    const resetState = useCallback(() => {
        setPermissions([]);
        setInitialPermissions([]);
        setPendingDeletes([]);
        setSelectedUsersMap(new Map());
        setPopoverVisible({});
        setCellInputValues({});
        setIsInitialLoad(true);
        hydratedRef.current = false;
    }, []);

    useEffect(() => {
        if (props.visible && props.tableId) {
            hydratedRef.current = false;
            setIsInitialLoad(true);
            setPendingDeletes([]);
            setPopoverVisible({});
            setCellInputValues({});
            getColumns(props.tableId);
            getPermissions(parseInt(props.tableId, 10));
        } else if (!props.visible) {
            hydratedRef.current = false;
        }
    }, [props.visible, props.tableId, getColumns, getPermissions]);

    useEffect(() => {
        if (!props.visible || !existingPermissions) return;
        if (isSavingRef.current) return;
        if (hydratedRef.current) return;

        applyHydration(normalizeList(existingPermissions));
        hydratedRef.current = true;

        const flatIds = normalizeList(existingPermissions).flatMap(
            (p: RowValuePermission) => p.user_ids || [],
        );
        const userIds = Array.from(new Set(flatIds));
        if (userIds.length > 0) {
            getAllUsers(userIds);
        } else {
            setIsInitialLoad(false);
        }
    }, [props.visible, existingPermissions, applyHydration, getAllUsers]);

    useEffect(() => {
        if (isUsersSuccess || isUsersError) {
            if (allUsers && allUsers.length > 0) {
                setSelectedUsersMap((prev) => {
                    const newMap = new Map(prev);
                    allUsers.forEach((user: UserModel) => {
                        newMap.set(user.id, user);
                    });
                    return newMap;
                });
            }
            setIsInitialLoad(false);
        }
    }, [allUsers, isUsersSuccess, isUsersError]);

    useEffect(() => {
        if (searchResults && searchResults.length > 0) {
            setSelectedUsersMap((prev) => {
                const newMap = new Map(prev);
                searchResults.forEach((profile: ProfileModel) => {
                    newMap.set(profile.user.id, profile.user);
                });
                return newMap;
            });
        }
    }, [searchResults]);

    const handleSearchUsers = useCallback((text: string) => {
        if (text.length > 1) {
            searchUsers({
                text,
                id: parseInt(props.tableId, 10),
                type: "table",
            });
        }
    }, [searchUsers, props.tableId]);

    const addPermission = useCallback(() => {
        if (!tableColumns || tableColumns.length === 0) {
            notification.warning({
                message: "Ошибка",
                description: "Сначала загрузите список колонок",
                placement: "topRight",
            });
            return;
        }
        const firstId = tableColumns[0] && tableColumns[0].id != null
            ? tableColumns[0].id
            : 0;
        setPermissions((prev) => prev.concat([{
            clientKey: makeClientKey(),
            column_id: firstId,
            user_ids: [],
            cell_value: "",
        }]));
    }, [tableColumns]);

    const removePermission = useCallback((record: RowValuePermissionForm) => {
        const key = getRecordKey(record);

        if (record.id != null) {
            setPendingDeletes((prev) =>
                prev.indexOf(record.id!) >= 0 ? prev : prev.concat([record.id!]),
            );
        }

        setPermissions((prev) => prev.filter((p) => getRecordKey(p) !== key));
        setCellInputValues((prev) => {
            const next = { ...prev };
            delete next[key];
            return next;
        });
        setPopoverVisible((prev) => {
            const next = { ...prev };
            delete next[key];
            return next;
        });
    }, []);

    const updatePermission = useCallback((
        recordKey: string,
        field: keyof RowValuePermissionForm,
        value: unknown,
    ) => {
        setPermissions((prev) => prev.map((p) =>
            getRecordKey(p) === recordKey ? { ...p, [field]: value } : p,
        ));
    }, []);

    const toggleUserSelection = useCallback((recordKey: string, userId: number, checked: boolean) => {
        setPermissions((prev) => prev.map((p) => {
            if (getRecordKey(p) !== recordKey) return p;
            const newUserIds = checked
                ? (p.user_ids.indexOf(userId) >= 0 ? p.user_ids : p.user_ids.concat([userId]))
                : p.user_ids.filter((id) => id !== userId);
            return { ...p, user_ids: newUserIds };
        }));
    }, []);

    const setPopoverOpen = useCallback((recordKey: string, visible: boolean) => {
        setPopoverVisible((prev) => ({ ...prev, [recordKey]: visible }));
    }, []);

    const validatePermissions = useCallback((list: RowValuePermissionForm[]): string | null => {
        for (let i = 0; i < list.length; i++) {
            const p = list[i];
            if (!p.column_id) return "Выберите колонку для всех записей";
            if (!p.user_ids || p.user_ids.length === 0) {
                return "Выберите хотя бы одного пользователя для всех записей";
            }
            if (!p.cell_value || p.cell_value.trim() === "") {
                return "Введите значение ячейки для всех записей";
            }
        }

        const seen: { [key: string]: boolean } = {};
        for (let i = 0; i < list.length; i++) {
            const p = list[i];
            const key = ruleKey(p.column_id, p.cell_value);
            if (seen[key]) {
                const column = (tableColumns || []).find((c) => c.id === p.column_id);
                const colName = column && column.name ? column.name : String(p.column_id);
                return `Дубликат: колонка "${colName}" со значением "${p.cell_value}" уже существует`;
            }
            seen[key] = true;
        }
        return null;
    }, [tableColumns]);

    const isDirty = useCallback((list: RowValuePermissionForm[]) => {
        if (pendingDeletes.length > 0) return true;
        if (Object.keys(cellInputValues).length > 0) return true;
        if (list.length !== initialPermissions.length) return true;

        return list.some((p) => {
            if (!p.id) return true;
            const initial = initialPermissions.find((ip) => ip.id === p.id);
            if (!initial) return true;
            return initial.column_id !== p.column_id
                || initial.cell_value !== p.cell_value
                || !sameIds(initial.user_ids, p.user_ids);
        });
    }, [cellInputValues, initialPermissions, pendingDeletes]);

    const handleSave = useCallback(async () => {
        if (isSavingRef.current) return;
        isSavingRef.current = true;

        const snapshot = applyPendingInputs(permissions, cellInputValues)
            .map((p) => ({ ...p, cell_value: (p.cell_value || "").trim() }));
        const tableId = parseInt(props.tableId, 10);

        const validationError = validatePermissions(snapshot);
        if (validationError) {
            notification.warning({
                message: "Ошибка валидации",
                description: validationError,
                placement: "topRight",
            });
            isSavingRef.current = false;
            return Promise.reject();
        }

        try {
            const serverList = normalizeList(await getPermissions(tableId).unwrap());
            const byId = new Map<number, RowValuePermission>();
            const byRule = new Map<string, RowValuePermission>();
            serverList.forEach((row) => {
                if (row.id != null) byId.set(row.id, row);
                byRule.set(ruleKey(row.column_id, row.cell_value || ""), row);
            });

            const idsToDelete: number[] = pendingDeletes.slice();
            const toCreate: Array<{
                column_id: number;
                user_ids: number[];
                cell_value: string;
            }> = [];

            const addDelete = (id?: number) => {
                if (id == null) return;
                if (idsToDelete.indexOf(id) < 0) idsToDelete.push(id);
            };

            for (let i = 0; i < snapshot.length; i++) {
                const local = snapshot[i];
                const key = ruleKey(local.column_id, local.cell_value);
                const onServer = byRule.get(key);
                const byLocalId = local.id != null ? byId.get(local.id) : undefined;

                const equal = (row?: RowValuePermission) =>
                    !!row
                    && row.column_id === local.column_id
                    && (row.cell_value || "").trim() === local.cell_value
                    && sameIds(row.user_ids || [], local.user_ids);

                if (equal(onServer) || equal(byLocalId)) {
                    continue;
                }

                if (local.id != null) addDelete(local.id);
                if (onServer && onServer.id != null) addDelete(onServer.id);

                toCreate.push({
                    column_id: local.column_id,
                    user_ids: local.user_ids.slice(),
                    cell_value: local.cell_value,
                });
            }

            // Фаза A — все удаления
            for (let i = 0; i < idsToDelete.length; i++) {
                try {
                    await deletePermission(idsToDelete[i]).unwrap();
                } catch (e: any) {
                    if (e?.status !== 404) throw e;
                }
            }

            // Фаза B — все создания
            const createErrors: string[] = [];
            for (let i = 0; i < toCreate.length; i++) {
                const item = toCreate[i];
                try {
                    await createPermission({
                        table_id: tableId,
                        column_id: item.column_id,
                        user_ids: item.user_ids,
                        cell_value: item.cell_value,
                    } as RowValuePermission).unwrap();
                } catch (e: any) {
                    const again = normalizeList(await getPermissions(tableId).unwrap());
                    const exists = again.some(
                        (row) =>
                            ruleKey(row.column_id, row.cell_value || "") ===
                            ruleKey(item.column_id, item.cell_value)
                            && sameIds(row.user_ids || [], item.user_ids),
                    );
                    if (!exists) {
                        createErrors.push(`«${item.cell_value}»: ${getErrorText(e)}`);
                    }
                }
            }

            if (createErrors.length) {
                notification.warning({
                    message: "Сохранено частично",
                    description: createErrors.join("; "),
                    placement: "topRight",
                });
                const latest = normalizeList(await getPermissions(tableId).unwrap());
                applyHydration(latest);
                hydratedRef.current = true;
                setPendingDeletes([]);
                return Promise.reject();
            }

            notification.success({
                message: "Успешно",
                description:
                    idsToDelete.length === 0 && toCreate.length === 0
                        ? "Изменений не было"
                        : `Удалено: ${idsToDelete.length}, создано: ${toCreate.length}`,
                placement: "topRight",
            });

            // sync колонок из Save НЕ вызываем (у вас 404 на update_row_value_permissions)
            props.setVisible(false);
            resetState();
        } catch (e: any) {
            notification.error({
                message: "Ошибка",
                description: getErrorText(e),
                placement: "topRight",
            });
            return Promise.reject();
        } finally {
            isSavingRef.current = false;
        }
    }, [
        permissions,
        cellInputValues,
        pendingDeletes,
        validatePermissions,
        deletePermission,
        createPermission,
        getPermissions,
        applyHydration,
        props,
        resetState,
    ]);

    const handleCancel = useCallback(() => {
        const snapshot = applyPendingInputs(permissions, cellInputValues);
        if (isDirty(snapshot) && !window.confirm("Есть несохраненные изменения. Вы уверены?")) {
            return;
        }
        props.setVisible(false);
        resetState();
    }, [permissions, cellInputValues, isDirty, props, resetState]);

    const handleUpdate = async () => {
        const snapshot = applyPendingInputs(permissions, cellInputValues);
        if (isDirty(snapshot)) {
            notification.warning({
                message: "Есть несохранённые изменения",
                description: "Сначала сохраните или отмените правки, потом обновляйте колонки.",
                placement: "topRight",
            });
            return;
        }

        if (!window.confirm("Обновить права в колонках таблицы по текущим правилам?")) {
            return;
        }

        try {
            await updatePermissions(Number(props.tableId)).unwrap();
            notification.success({
                message: "Успешно",
                description: "Права в колонках обновлены",
                placement: "topRight",
            });
        } catch (e: any) {
            if (e?.status === 404) {
                notification.warning({
                    message: "Sync недоступен",
                    description: "update_row_value_permissions вернул 404 — проверьте URL в TableService",
                    placement: "topRight",
                });
                return;
            }
            notification.error({
                message: "Ошибка",
                description: getErrorText(e) || "Не удалось обновить права в колонках",
                placement: "topRight",
            });
        }
    };

    const columnOptions = useMemo(() => {
        if (!tableColumns) return [];
        return tableColumns
            .filter((c) => c.id != null)
            .map((c) => ({
                value: c.id as number,
                label: c.name || `Колонка ${c.id}`,
            }));
    }, [tableColumns]);

    const tableColumnsConfig = useMemo(() => [
        {
            title: "Колонка",
            dataIndex: "column_id",
            key: "column_id",
            width: 200,
            render: (value: number, record: RowValuePermissionForm) => {
                const recordKey = getRecordKey(record);
                return (
                    <Select
                        size="small"
                        value={value || undefined}
                        placeholder="Выберите колонку"
                        style={{ width: "100%" }}
                        onChange={(val) => updatePermission(recordKey, "column_id", val)}
                        options={columnOptions}
                        loading={isLoadingColumns}
                        showSearch
                        filterOption={(input: string, option: any) =>
                            String(option && option.label ? option.label : "")
                                .toLowerCase()
                                .indexOf(input.toLowerCase()) >= 0
                        }
                        disabled={columnOptions.length === 0}
                    />
                );
            },
        },
        {
            title: "Пользователи",
            dataIndex: "user_ids",
            key: "user_ids",
            width: 350,
            render: (value: number[], record: RowValuePermissionForm) => {
                const recordKey = getRecordKey(record);
                return (
                    <UserSelectPopover
                        value={value}
                        recordKey={recordKey}
                        searchResults={searchResults}
                        isSearching={isSearching}
                        onSearch={handleSearchUsers}
                        onToggle={toggleUserSelection}
                        open={!!popoverVisible[recordKey]}
                        onOpenChange={setPopoverOpen}
                        getUserDisplayName={getUserDisplayName}
                        usersMap={selectedUsersMap}
                    />
                );
            },
        },
        {
            title: "Значение ячейки",
            dataIndex: "cell_value",
            key: "cell_value",
            width: 200,
            render: (value: string, record: RowValuePermissionForm) => {
                const recordKey = getRecordKey(record);
                const currentValue = cellInputValues[recordKey] !== undefined
                    ? cellInputValues[recordKey]
                    : (value || "");

                return (
                    <Input
                        size="small"
                        value={currentValue}
                        placeholder="Введите значение"
                        onChange={(e) => {
                            const nextVal = e.target.value;
                            setCellInputValues((prev) => {
                                const next = { ...prev };
                                next[recordKey] = nextVal;
                                return next;
                            });
                        }}
                        onBlur={() => {
                            if (cellInputValues[recordKey] !== undefined) {
                                updatePermission(recordKey, "cell_value", cellInputValues[recordKey]);
                                setCellInputValues((prev) => {
                                    const next = { ...prev };
                                    delete next[recordKey];
                                    return next;
                                });
                            }
                        }}
                    />
                );
            },
        },
        {
            title: "",
            key: "actions",
            width: 80,
            render: (_: unknown, record: RowValuePermissionForm) => (
                <Flex justify="center">
                    <Popconfirm
                        title="Удалить правило? (применится после «Сохранить»)"
                        onConfirm={() => removePermission(record)}
                        okText="Да"
                        cancelText="Нет"
                    >
                        <Button size="small" danger loading={isDeleting}>
                            Удалить
                        </Button>
                    </Popconfirm>
                </Flex>
            ),
        },
    ], [
        columnOptions,
        isLoadingColumns,
        updatePermission,
        searchResults,
        isSearching,
        handleSearchUsers,
        toggleUserSelection,
        popoverVisible,
        setPopoverOpen,
        getUserDisplayName,
        selectedUsersMap,
        cellInputValues,
        removePermission,
        isDeleting,
    ]);

    const isLoading = isLoadingPermissions || isLoadingColumns || (isInitialLoad && isLoadingAllUsers);

    const canSave = !isLoadingPermissions && (
        permissions.length > 0
        || initialPermissions.length > 0
        || pendingDeletes.length > 0
    );

    return (
        <Modal
            title="Управление правами по значению ячейки"
            open={props.visible}
            onCancel={handleCancel}
            onOk={() => handleSave()}
            okText="Сохранить все"
            cancelText="Отмена"
            confirmLoading={isCreating || isDeleting}
            width={1200}
            maskClosable={false}
            okButtonProps={{
                loading: isCreating || isDeleting,
                disabled: !canSave,
            }}
            destroyOnHidden
        >
            <Flex gap="middle" vertical>
                <Flex justify="space-between" align="center">
                    <Text type="secondary">
                        Удаления применяются после «Сохранить». Sync колонок — отдельной кнопкой.
                    </Text>
                    <Flex gap="small">
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={handleUpdate}
                            disabled={!tableColumns || tableColumns.length === 0}
                            loading={isUpdating}
                        >
                            Обновить права в колонках
                        </Button>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={addPermission}
                            disabled={!tableColumns || tableColumns.length === 0}
                        >
                            Добавить строку
                        </Button>
                    </Flex>
                </Flex>

                <Table
                    dataSource={permissions}
                    columns={tableColumnsConfig}
                    rowKey={(record) => getRecordKey(record)}
                    loading={isLoading}
                    pagination={false}
                    scroll={{ y: 360, x: 800 }}
                    bordered
                    size="middle"
                    locale={{
                        emptyText: 'Нет прав. Нажмите "Добавить строку"',
                    }}
                />
            </Flex>
        </Modal>
    );
};