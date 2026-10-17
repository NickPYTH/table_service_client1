import {RefObject, useEffect, useRef} from "react";
import {useParams} from "react-router-dom";
import type {GridApiPremium, GridInitialState} from "@mui/x-data-grid-premium";

const STATE_VERSION = 1;

const defaultPinnedColumns: GridInitialState["pinnedColumns"] = {
    right: ["action"],
    left: ["order_f"],
};

type StoredGridState = {
    version: number;
    state: GridInitialState;
};

const storageKey = (tableId: string) => `table-service:v2:grid-state:${tableId}`;

const readStoredState = (tableId: string): GridInitialState | null => {
    try {
        const raw = localStorage.getItem(storageKey(tableId));
        if (!raw) return null;
        const parsed = JSON.parse(raw) as StoredGridState;
        if (parsed?.version !== STATE_VERSION || !parsed.state) return null;
        return parsed.state;
    } catch {
        return null;
    }
};

const sanitizeState = (state: GridInitialState): GridInitialState => {
    const {preferencePanel: _preferencePanel, ...rest} = state;
    const paginationModel = state.pagination?.paginationModel;
    return {
        ...rest,
        pagination: paginationModel ? {paginationModel} : undefined,
    };
};

const applyServerVisibility = (
    visibility: Record<string, boolean | undefined> | undefined,
    hiddenColumns: Record<string, boolean>,
) => {
    const columnVisibilityModel: Record<string, boolean> = {...hiddenColumns};
    if (!visibility) return columnVisibilityModel;

    for (const [field, visible] of Object.entries(visibility)) {
        if (hiddenColumns[field] === false) continue;
        columnVisibilityModel[field] = Boolean(visible);
    }
    return columnVisibilityModel;
};

const buildInitialState = (tableId: string, hiddenColumns: Record<string, boolean>): GridInitialState => {
    const saved = readStoredState(tableId);
    if (!saved) {
        return {
            pinnedColumns: defaultPinnedColumns,
            columns: {columnVisibilityModel: {...hiddenColumns}},
        };
    }

    const sanitized = sanitizeState(saved);
    return {
        ...sanitized,
        pinnedColumns: sanitized.pinnedColumns ?? defaultPinnedColumns,
        columns: {
            ...sanitized.columns,
            columnVisibilityModel: applyServerVisibility(sanitized.columns?.columnVisibilityModel, hiddenColumns),
        },
    };
};

export const usePersistedGridState = (
    apiRef: RefObject<GridApiPremium | null>,
    hiddenColumns: Record<string, boolean>,
) => {
    const {id} = useParams();
    const initialStateRef = useRef<GridInitialState | null>(null);
    const hiddenColumnsRef = useRef(hiddenColumns);
    hiddenColumnsRef.current = hiddenColumns;

    const gridReady = Boolean(id) && Object.keys(hiddenColumns).length > 0;
    if (gridReady && id && !initialStateRef.current) {
        initialStateRef.current = buildInitialState(id, hiddenColumns);
    }

    useEffect(() => {
        if (!gridReady || !id) return;
        const api = apiRef.current;
        if (!api?.subscribeEvent || !api.exportState) return;

        let timer = 0;
        let lastSaved = "";

        const save = () => {
            window.clearTimeout(timer);
            try {
                const exported = sanitizeState(api.exportState());
                const state: GridInitialState = {
                    ...exported,
                    columns: {
                        ...exported.columns,
                        columnVisibilityModel: applyServerVisibility(
                            exported.columns?.columnVisibilityModel,
                            hiddenColumnsRef.current,
                        ),
                    },
                };
                const serialized = JSON.stringify({version: STATE_VERSION, state} satisfies StoredGridState);
                if (serialized === lastSaved) return;
                lastSaved = serialized;
                localStorage.setItem(storageKey(id), serialized);
            } catch {
                // localStorage может быть недоступен или переполнен
            }
        };

        const schedule = () => {
            window.clearTimeout(timer);
            timer = window.setTimeout(save, 400);
        };

        const unsubscribe = api.subscribeEvent("stateChange", schedule);
        window.addEventListener("beforeunload", save);

        return () => {
            unsubscribe();
            window.removeEventListener("beforeunload", save);
            save();
        };
    }, [apiRef, gridReady, id]);

    return initialStateRef.current;
};
