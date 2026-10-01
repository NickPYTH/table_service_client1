import * as React from 'react';
import {GridRenderEditCellParams, useGridApiContext} from '@mui/x-data-grid-premium';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

interface CustomAutocompleteEditCellProps extends GridRenderEditCellParams {
    options: { value: any; label: string }[];
    placeholder?: string;
    autoComplete?: boolean;
    freeSolo?: boolean;
    multiple?: boolean;
    getOptionLabel?: (option: any) => string;
    onValueChange?: (value: any) => void;
}

export const EditCell: React.FC<CustomAutocompleteEditCellProps> = ({
                                                                                          id,
                                                                                          field,
                                                                                          value,
                                                                                          options,
                                                                                          placeholder = "Найти...",
                                                                                          autoComplete = true,
                                                                                          freeSolo = false,
                                                                                          multiple = false,
                                                                                          getOptionLabel,
                                                                                          onValueChange,
                                                                                      }) => {
    const apiRef = useGridApiContext();

    const handleChange = (event: any, newValue: any) => {
        const finalValue = multiple ? newValue : (newValue || null);

        apiRef.current.setEditCellValue({
            id,
            field,
            value: finalValue,
        });

        if (onValueChange) {
            onValueChange(finalValue);
        }
    };

    const defaultGetOptionLabel = (option: any) => {
        if (typeof option === 'string') return option;
        if (option?.label) return option.label;
        return String(option);
    };
    return (
        <Autocomplete
            options={options}
            value={options.find((o:{ value: any; label: string })=>o.value==value)}
            onChange={handleChange}
            openOnFocus
            //freeSolo={freeSolo}
            autoComplete={autoComplete}
            getOptionLabel={getOptionLabel || defaultGetOptionLabel}
            renderInput={(params) => (
                <TextField
                    {...params}
                    autoFocus
                    variant="standard"
                    placeholder={placeholder}
                />
            )}
            noOptionsText={'Ничего :('}
            size="small"
            disablePortal
            blurOnSelect={!multiple}
            style={{width: 300}}
        />
    );
};