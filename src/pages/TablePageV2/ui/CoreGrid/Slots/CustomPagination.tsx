import React from 'react';
import {
    useGridApiContext,
    useGridSelector,
    gridPageCountSelector,
    gridPageSelector,
} from '@mui/x-data-grid-premium';
import {
    Pagination,
    Select,
    MenuItem,
    Box,
    FormControl,
    InputLabel,
    Typography
} from '@mui/material';

export function CustomPaginationWithSelect() {
    const apiRef = useGridApiContext();
    const pageCount = useGridSelector(apiRef, gridPageCountSelector);
    const currentPage = useGridSelector(apiRef, gridPageSelector);
    const { pageSize } = apiRef.current.state.pagination.paginationModel;

    const handlePageSelect = (event: any) => {
        const newPage = event.target.value;
        console.log(newPage)
        apiRef.current.setPage(newPage);
    };

    const handlePageSizeChange = (event: any) => {
        const newPageSize = event.target.value;
        apiRef.current.setPageSize(newPageSize);
    };

    // Создаем массив страниц для выпадающего списка
    const pageOptions = Array.from({ length: pageCount }, (_, i) => i);

    return (
        <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            padding="16px"
            sx={{ width: '100%'}}
        >
            <Box display="flex" alignItems="center" gap={2}>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Строк</InputLabel>
                    <Select
                        value={pageSize}
                        onChange={handlePageSizeChange}
                        label="Строк"
                    >
                        <MenuItem value={50}>50</MenuItem>
                        <MenuItem value={100}>100</MenuItem>
                        <MenuItem value={1000}>1000</MenuItem>
                        <MenuItem value={5000}>5000</MenuItem>
                        <MenuItem value={100000}>100000</MenuItem>
                        <MenuItem value={500000}>500000</MenuItem>
                        <MenuItem value={1000000}>1000000</MenuItem>
                    </Select>
                </FormControl>

                <Typography variant="body2" color="textSecondary">
                    Всего страниц: {pageCount}
                </Typography>
            </Box>

            <Box display="flex" alignItems="center" gap={2}>
                <FormControl size="small" sx={{ minWidth: 130 }}>
                    <InputLabel>Страница</InputLabel>
                    <Select
                        value={currentPage+1}
                        onChange={handlePageSelect}
                        label="Страница"
                    >
                        {pageOptions.map(page => (
                            <MenuItem key={page} value={page}>
                                Страница {page}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Pagination
                    count={pageCount}
                    page={currentPage+1}
                    onChange={(event, value) => {
                        apiRef.current.setPage(value-1)
                    }}
                    showFirstButton
                    showLastButton
                    color="primary"
                    size="medium"
                />
            </Box>
        </Box>
    );
}