import React, {useEffect, useState} from 'react';
import {Empty, Modal, Spin, Table, Tag, Typography} from 'antd';
import {ClockCircleOutlined, HistoryOutlined, UserOutlined} from '@ant-design/icons';
import type {ColumnsType} from 'antd/es/table';
import {host} from "shared/config/constants";

const { Text, Title } = Typography;

interface FileHistoryItem {
    version: number;
    filename: string;
    replaced_at: string;
    replaced_by: string | null;
}

interface FileHistoryData {
    current_version: number;
    current_filename: string;
    history: FileHistoryItem[];
}

interface FileHistoryModalProps {
    visible: boolean;
    onClose: () => void;
    fileId: number;
    currentFilename: string;
}

export const FileHistoryModal: React.FC<FileHistoryModalProps> = ({
                                                                      visible,
                                                                      onClose,
                                                                      fileId,
                                                                      currentFilename
                                                                  }) => {
    const [loading, setLoading] = useState(false);
    const [historyData, setHistoryData] = useState<FileHistoryData | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (visible && fileId) {
            fetchHistory();
        }
    }, [visible, fileId]);

    const fetchHistory = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `${host}/api/cellfiles/${fileId}/history/`
            );
            if (response.ok) {
                const data = await response.json();
                setHistoryData(data);
            } else {
                setError('Не удалось загрузить историю файла');
            }
        } catch (error) {
            console.error('Ошибка загрузки истории:', error);
            setError('Ошибка при загрузке истории');
        } finally {
            setLoading(false);
        }
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

    const columns: ColumnsType<FileHistoryItem> = [
        {
            title: 'Версия',
            dataIndex: 'version',
            key: 'version',
            width: 80,
            render: (version: number) => (
                <Tag color={version === historyData?.current_version ? 'blue' : 'default'}>
                    v{version}
                </Tag>
            ),
        },
        {
            title: 'Имя файла',
            dataIndex: 'filename',
            key: 'filename',
            ellipsis: true,
            render: (filename: string, record: FileHistoryItem) => (
                <Text>
                    {filename}
                    {record.version === historyData?.current_version && (
                        <Tag color="green" style={{ marginLeft: 8 }}>Текущий</Tag>
                    )}
                </Text>
            ),
        },
        {
            title: 'Кто изменил',
            dataIndex: 'replaced_by',
            key: 'replaced_by',
            width: 150,
            render: (replaced_by: string | null) => (
                <span>
                    {replaced_by || 'Неизвестно'}
                </span>
            ),
        },
        {
            title: 'Дата изменения',
            dataIndex: 'replaced_at',
            key: 'replaced_at',
            width: 180,
            render: (replaced_at: string) => (
                <span>
                    {formatDate(replaced_at)}
                </span>
            ),
        },
    ];

    return (
        <Modal
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>История изменений файла</span>
                </div>
            }
            open={visible}
            onCancel={onClose}
            footer={null}
            width={800}
        >
            {loading ? (
                <div style={{ textAlign: 'center', padding: 40 }}>
                    <Spin size="large" />
                </div>
            ) : error ? (
                <Empty
                    description={error}
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
            ) : historyData ? (
                <>
                    <div style={{ marginBottom: 16 }}>
                        <Text type="secondary">
                            Текущий файл: <strong>{historyData.current_filename}</strong>
                        </Text>
                        <br />
                        <Text type="secondary">
                            Всего версий: <strong>{historyData.history.length + 1}</strong>
                        </Text>
                    </div>

                    <Table
                        columns={columns}
                        dataSource={historyData.history}
                        rowKey="version"
                        size="small"
                        pagination={false}
                        scroll={{ y: 400 }}
                    />
                </>
            ) : null}
        </Modal>
    );
};