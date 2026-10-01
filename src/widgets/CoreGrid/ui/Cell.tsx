import {ColumnModel} from "entities/ColumnModel";
import React, {useContext, useEffect, useState} from "react";
import {TableContext} from "pages/TablePage/ui/TablePage";
import {RootStateType} from "store/store";
import {useSelector} from "react-redux";
import {PermissionModel} from "entities/PermissionModel";
import {Badge, Button, Image, message, Popover, Spin, Tag} from "antd";
import {host, ROLE} from "shared/config/constants";
import {CellModel} from "entities/CellModel";
import {cellFileAPI} from "service/CellFileService";
import {EyeOutlined, FileOutlined, FolderOpenOutlined} from '@ant-design/icons';
import {FileManagerModal} from "entities/FileManagerModal";
import {GridCellSelectionModel} from "@mui/x-data-grid-premium";
import {GridApiPremium} from "@mui/x-data-grid-premium/models/gridApiPremium";

type PropsType = {
    formattedValue: string,
    column: ColumnModel,
    row: any,
    cellSelectionModel?: GridCellSelectionModel; // только модель, apiRef не нужен
    apiRef?: any;
}

export const Cell = (props: PropsType) => {
    const currentUser = useSelector((state: RootStateType) => state.currentUser.user);
    const tableContext = useContext(TableContext);

    const [isLocked, setIsLocked] = useState(false);
    const [cellValue, setCellValue] = useState(() => {
        return props.row[props.column.id ?? "123"] ?
            (props.row[props.column.id ?? "123"].formula_value && props.formattedValue.startsWith("=")) ?
                <>
                    <Tag>F</Tag>
                    {props.row[props.column.id ?? "123"].formula_value}
                </>
                :
                props.formattedValue
            :
            props.formattedValue;
    });

    const [files, setFiles] = useState<any[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentCellId, setCurrentCellId] = useState<number | null>(null);
    const [photoGalleyVisible, setPhotoGalleryVisible] = useState(false);

    const [createFile, { isLoading: isCreateFileLoading }] = cellFileAPI.useCreateFileMutation();
    const [updateFile, { isLoading: isUpdateFileLoading }] = cellFileAPI.useUpdateFileMutation();
    const [deleteFile, { isLoading: isDeleteFileLoading }] = cellFileAPI.useDeleteFileMutation();

    const getFilesFromCell = (): any[] => {
        const columnId = props.column.id as number;
        const cell = props.row[columnId] as CellModel;
        return cell?.files || [];
    };

    const getCellId = (): number | null => {
        const columnId = props.column.id as number;
        const cell = props.row[columnId] as CellModel;
        return cell?.id || null;
    };

    // ------ Единое вычисление фона ------
    const columnId = props.column.id as number;
    const cellData = props.row[columnId] as CellModel;
    const cellColor = cellData?.color;

    // Проверка выделения через модель (работает для одиночного и диапазонного)
    const isSelected = props.apiRef?.current?.isCellSelected(
        props.row.id,
        String(props.column.id)
    ) ?? false;

    // Базовый фон без учёта цвета
    let baseBackground = "inherit";
    if (props.column.required && (cellValue == null || cellValue == '')) {
        baseBackground = "rgba(243,127,123,0.57)";
    } else if (isLocked && tableContext?.tablePermission?.can_edit == true) {
        baseBackground = "#c4c4c4";
    }

    // Итоговый фон: если выделена – inherit (стандартный фон MUI), иначе цвет или базовый
    const cellBackground = isSelected ? "inherit" : (cellColor || baseBackground);
    // ---------------------------------

    useEffect(() => {
        if (tableContext) {
            if (props.column.data_type == 'file') return;
            let columnId: number = props.column.id as number;
            setIsLocked(
                !!tableContext.lockedCellsIds.find((lock => lock.cell_id == props.row[columnId]?.id && currentUser?.id != lock.user_id))
                ||
                (
                    tableContext.rowPermissions?.find((rp: PermissionModel) => rp.row == props.row.id) == undefined
                    ||
                    tableContext.columnPermissions?.find((cp: PermissionModel) => cp.column == props.column.id) == undefined
                )
                ||
                (
                    tableContext.withCellConfirm && props.formattedValue.length > 0 && (tableContext.role == ROLE.ADMIN || tableContext.role == ROLE.OWNER) && !props.column.available_if_confirm_mode_enabled
                )
                ||
                props.column.disabled
                ||
                tableContext.tablePermission?.can_edit == false
            );
        }
    }, [tableContext]);

    useEffect(() => {
        if (tableContext?.rows) {
            let columnId: number = props.column.id as number;
            tableContext.rows.map((r: any) => {
                if (r.id == props.row.id && columnId == props.column.id) {
                    let cell: CellModel = r[columnId];
                    if (cell) {
                        setCellValue(cell.formula_value ? cell.formula_value : cell.value);
                        setFiles(cell.files || []);
                        setCurrentCellId(cell.id);
                    }
                }
            });
        }
    }, [tableContext?.rows]);

    useEffect(() => {
        setFiles(getFilesFromCell());
        setCurrentCellId(getCellId());
    }, [props.row, props.column.id]);

    const demonLinkHandler = (path: string) => {
        if (tableContext?.demonWS && currentUser)
            tableContext?.demonWS.send(JSON.stringify({username: currentUser.username, path}));
    };

    const handleFileUpload = async (file: File) => {
        const formData = new FormData();
        const cellId = currentCellId;
        if (!cellId) {
            message.error('ID ячейки не найден');
            return false;
        }
        formData.append('cell', cellId.toString());
        formData.append('filename', file.name);
        formData.append('uploaded_file', file);
        try {
            const result = await createFile(formData).unwrap();
            setFiles([result, ...files]);
            message.success('Файл успешно загружен');
            return result;
        } catch (error) {
            message.error('Ошибка при загрузке файла');
            console.error(error);
            return false;
        }
    };

    const handleFileReplace = async (fileId: number, file: File) => {
        const formData = new FormData();
        formData.append('uploaded_file', file);
        try {
            const result = await updateFile({id: fileId, body: formData}).unwrap();
            const updatedFiles = files.map(f =>
                f.id === fileId ? {...result, download_url: `${host}/api/cellfiles/${result.id}/download/`} : f
            );
            setFiles([result, ...updatedFiles.filter(f => f.id !== fileId)]);
            message.success('Файл успешно обновлен');
            return result;
        } catch (error) {
            message.error('Ошибка при замене файла');
            console.error(error);
            return false;
        }
    };

    const handleDeleteFile = async (fileId: number) => {
        try {
            await deleteFile(fileId).unwrap();
            setFiles(files.filter(f => f.id !== fileId));
        } catch (error) {
            message.error('Ошибка при удалении файла');
            console.error(error);
        }
    };

    const openFileManager = () => {
        if (currentCellId) {
            setIsModalVisible(true);
        }
    };

    const formatFileSize = (bytes: number | null | undefined): string => {
        if (!bytes || bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // ------ Рендер файловой ячейки ------
    if (props.column.data_type === 'file') {
        const isLoading = isCreateFileLoading || isUpdateFileLoading || isDeleteFileLoading;
        const filesCount = files.length;
        const totalSize = files.reduce((sum, f) => sum + (f.file_size || 0), 0);
        const fileBg = isSelected ? "inherit" : (cellColor || (isLocked ? "#c4c4c4" : "inherit"));
        return (
            <>
                {photoGalleyVisible &&
                <Image.PreviewGroup
                    preview={{
                        visible: true,
                        onVisibleChange: (visible: boolean) => setPhotoGalleryVisible(visible)
                    }}
                >
                    {files.filter(file => file.file_extension == "jpg").map(file =>
                        <Image
                            key={file.id}
                            src={file.download_url}
                            style={{display: 'none'}}
                            alt={`Фото`}
                        />
                    )}
                </Image.PreviewGroup>
                }
                <div
                    style={{
                        height: "100%",
                        background: fileBg,
                        padding: "0 4px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "4px"
                    }}
                >
                    {isLoading ? (
                        <Spin size="small" style={{transform: "scale(0.8)"}}/>
                    ) : (
                        <>
                            <div style={{
                                flex: 1,
                                overflow: "hidden",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                cursor: filesCount > 0 ? "pointer" : "default",
                                minWidth: 0
                            }}>
                                <Badge count={filesCount} size="small" style={{backgroundColor: '#1890ff'}}>
                                    <FileOutlined style={{fontSize: "12px"}}/>
                                </Badge>
                                {filesCount > 0 ? (
                                    <span style={{
                                        fontSize: "11px",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap"
                                    }}>
                                        {filesCount} файл(ов), {formatFileSize(totalSize)}
                                    </span>
                                ) : (
                                    <span style={{
                                        fontSize: "11px",
                                        color: "#999"
                                    }}>
                                        Нет файлов
                                    </span>
                                )}
                            </div>
                            <div style={{display: "flex", gap: "2px", flexShrink: 0}}>
                                <Button
                                    type="text"
                                    size="small"
                                    icon={<EyeOutlined style={{fontSize: "12px"}}/>}
                                    onClick={() => setPhotoGalleryVisible(true)}
                                    disabled={isLocked}
                                    title="Просмотр изображений"
                                    style={{padding: "0 2px", height: "22px", width: "22px"}}
                                />
                                <Button
                                    type="text"
                                    size="small"
                                    icon={<FolderOpenOutlined style={{fontSize: "12px"}}/>}
                                    onClick={openFileManager}
                                    disabled={isLocked}
                                    title="Управление файлами"
                                    style={{padding: "0 2px", height: "22px", width: "22px"}}
                                />
                            </div>
                        </>
                    )}
                </div>
                <FileManagerModal
                    visible={isModalVisible}
                    onClose={() => setIsModalVisible(false)}
                    cellId={currentCellId || 0}
                    files={files}
                    onFileUpload={handleFileUpload}
                    onFileDelete={handleDeleteFile}
                    onFileUpdate={handleFileReplace}
                    isLocked={isLocked}
                />
            </>
        );
    }

    // ------ Рендер ссылки (демон) ------
    if (typeof props.formattedValue === 'string' && props.formattedValue.includes("/sgp.ru/data/")) {
        return (
            <div
                style={{
                    height: "100%",
                    background: cellBackground,
                    whiteSpace: 'normal',
                    wordWrap: 'break-word',
                    lineHeight: 1,
                    textAlign: 'start'
                }}>
                <a onClick={() => demonLinkHandler(props.formattedValue)}>{props.formattedValue}</a>
            </div>
        );
    }

    // ------ Рендер длинного текста (Popover) ------
    if (cellValue && typeof cellValue == 'string' && cellValue.length > 44) {
        return (
            <Popover content={cellValue} placement={'bottom'}>
                <div
                    style={{
                        height: "100%",
                        background: cellBackground,
                        whiteSpace: 'normal',
                        wordWrap: 'break-word',
                        lineHeight: 1,
                        textAlign: 'start'
                    }}>
                    {cellValue}
                </div>
            </Popover>
        );
    }

    // ------ Стандартный рендер ------
    return (
        <div
            style={{
                height: "100%",
                background: cellBackground,
                whiteSpace: 'normal',
                wordWrap: 'break-word',
                lineHeight: 1,
                textAlign: 'start'
            }}>
            {cellValue}
        </div>
    );
};