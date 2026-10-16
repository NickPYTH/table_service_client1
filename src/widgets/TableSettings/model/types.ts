export type TableSettingsType = {
    visible: boolean;
    setVisible: (visible: boolean) => void;
}

export type FieldType = {
    alternative_name: string;
};

export type UserPermissionModalType = {
    visible: boolean;
    setVisible: (visible: boolean) => void;
    selectedUserPermissionId: number| null;
    setSelectedUserPermissionId: (selectedUserPermission: number | null) => void;
    apiRef: any
}

export type FilialPermissionModalType = {
    visible: boolean;
    setVisible: (visible: boolean) => void;
    selectedFilialPermissionId: number| null;
    setSelectedFilialPermissionId: (selectedFilialPermission: number | null) => void;
    apiRef: any
}

export type UserPermissionModalFieldType = {
    username: string;
    role: string;
};

export type FilialPermissionModalFieldType = {
    filial: string;
    role: string;
};
