import React, {useContext, useEffect, useState} from 'react';
import {Button, Empty, Flex, message, Modal, Popconfirm, Space, Table, Tag, Typography, Upload} from 'antd';
import {
    DeleteOutlined,
    DownloadOutlined,
    FileOutlined,
    HistoryOutlined,
    PlusOutlined,
    UploadOutlined
} from '@ant-design/icons';
import type {ColumnsType} from 'antd/es/table';
import {FileHistoryModal} from "pages/TablePage/ui/Grid/FileHistoryModal";
import {host, ROLE} from "shared/config/constants";
import {TableContext} from "pages/TablePage/ui/TablePage";

const { Text } = Typography;

interface FileType {
    id: number;
    filename: string;
    file_size: number | null;
    file_extension: string;
    content_type: string;
    version: number;
    uploaded_at: string;
    updated_at: string;
    uploaded_by: string | null;
    description: string | null;
    download_url: string;
}

interface FileManagerModalProps {
    visible: boolean;
    onClose: () => void;
    cellId: number;
    files: FileType[];
    onFileUpload: (file: File) => Promise<any>;
    onFileDelete: (fileId: number) => Promise<any>;
    onFileUpdate: (fileId: number, file: File) => Promise<any>;
    isLocked: boolean;
}

export const FileManagerModal: React.FC<FileManagerModalProps> = ({
                                                                      visible,
                                                                      onClose,
                                                                      cellId,
                                                                      files,
                                                                      onFileUpload,
                                                                      onFileDelete,
                                                                      onFileUpdate,
                                                                      isLocked
                                                                  }) => {
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [historyModalVisible, setHistoryModalVisible] = useState(false);
    const [selectedFileId, setSelectedFileId] = useState<number | null>(null);
    const [selectedFilename, setSelectedFilename] = useState('');
    const [localFiles, setLocalFiles] = useState<FileType[]>(files);
    const tableContext = useContext(TableContext);

    useEffect(() => {
        setLocalFiles(files);
    }, [files]);

    const formatFileSize = (bytes: number | null | undefined): string => {
        if (!bytes || bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('ru-RU', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            message.warning('Выберите файл');
            return;
        }

        setUploading(true);
        try {
            const result = await onFileUpload(selectedFile);
            if (result) {
                setLocalFiles([result, ...localFiles]);
                setSelectedFile(null);
            }
        } catch (error) {
            message.error('Ошибка при загрузке файла');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (fileId: number) => {
        try {
            await onFileDelete(fileId);
            setLocalFiles(localFiles.filter(f => f.id !== fileId));
            message.success('Файл удален');
        } catch (error) {
            message.error('Ошибка при удалении');
        }
    };

    const handleDownload = async (file: FileType) => {
        try {
            const response = await fetch(file.download_url ? file.download_url : `${host}/api/cellfiles/${file.id}/download/`);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = file.filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            message.success('Файл скачан');
        } catch (error) {
            message.error('Ошибка при скачивании');
        }
    };

    const handleShowHistory = (fileId: number, filename: string) => {
        setSelectedFileId(fileId);
        setSelectedFilename(filename);
        setHistoryModalVisible(true);
    };

    const columns: ColumnsType<FileType> = [
        {
            title: 'Файл',
            dataIndex: 'filename',
            key: 'filename',
            width: '30%',
            render: (filename: string, record) => (
                <Space>
                    <FileOutlined style={{ color: '#1890ff' }} />
                    <Text ellipsis style={{ maxWidth: 200 }}>
                        {filename}
                    </Text>
                </Space>
            ),
        },
        {
            title: 'Размер',
            dataIndex: 'file_size',
            key: 'file_size',
            width: 100,
            render: (size) => formatFileSize(size),
        },
        {
            title: 'Версия',
            dataIndex: 'version',
            key: 'version',
            width: 80,
            render: (version) => `v${version}`,
        },
        {
            title: 'Загружен',
            dataIndex: 'uploaded_at',
            key: 'uploaded_at',
            width: 180,
            render: (date) => formatDate(date),
        },
        {
            title: 'Кто загрузил',
            dataIndex: 'uploaded_by',
            key: 'uploaded_by',
            width: 150,
            render: (user) => user || 'Неизвестно',
        },
        {
            title: 'Действия',
            key: 'actions',
            width: 150,
            fixed: 'right',
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="text"
                        size="small"
                        icon={<DownloadOutlined />}
                        onClick={() => handleDownload(record)}
                        title="Скачать"
                    />
                    <Upload
                        showUploadList={false}
                        beforeUpload={async (file) => {
                            await onFileUpdate(record.id, file);
                            const newFile = {
                                ...record,
                                filename: file.name,
                                file_size: file.size,
                                version: record.version + 1,
                                updated_at: new Date().toISOString(),
                            };
                            setLocalFiles([newFile, ...localFiles.filter(f => f.id !== record.id)]);
                            return false;
                        }}
                        disabled={isLocked}
                    >
                        <Button
                            type="text"
                            size="small"
                            icon={<UploadOutlined />}
                            title="Обновить версию"
                        />
                    </Upload>
                    <Button
                        type="text"
                        size="small"
                        icon={<HistoryOutlined />}
                        onClick={() => handleShowHistory(record.id, record.filename)}
                        title="История"
                    />

                    <Popconfirm
                        title="Удалить файл?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Да"
                        cancelText="Нет"
                    >
                        <Button
                            type="text"
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                            title="Удалить"
                        />
                    </Popconfirm>

                </Space>
            ),
        },
    ];

    return (
        <>
            <Modal
                title={
                    <Space>
                        <span>Управление файлами</span>
                    </Space>
                }
                open={visible}
                onCancel={onClose}
                width={1000}
                footer={null}
            >
                {!isLocked && (
                    <Flex style={{ marginBottom: 16}} gap={'middle'} align={'center'}>
                        <Upload
                            beforeUpload={(file) => {
                                setSelectedFile(file);
                                return false;
                            }}
                            showUploadList={false}
                            disabled={isLocked}
                        >
                            <Button>Добавить файл</Button>
                        </Upload>
                        {selectedFile && (
                            <>
                                <Text>Выбран: {selectedFile.name} ({formatFileSize(selectedFile.size)})</Text>
                                <Button
                                    type="primary"
                                    onClick={handleUpload}
                                    loading={uploading}
                                >
                                    Загрузить
                                </Button>
                            </>
                        )}
                    </Flex>
                )}

                <Table
                    columns={columns}
                    dataSource={localFiles}
                    rowKey="id"
                    size="small"
                    pagination={{ pageSize: 10 }}
                    locale={{
                        emptyText: <Empty description="Нет загруженных файлов" />
                    }}
                />
            </Modal>

            {selectedFileId && (
                <FileHistoryModal
                    visible={historyModalVisible}
                    onClose={() => {
                        setHistoryModalVisible(false);
                        setSelectedFileId(null);
                    }}
                    fileId={selectedFileId}
                    currentFilename={selectedFilename}
                />
            )}
        </>
    );
};