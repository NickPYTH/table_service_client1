import {CellModel} from "entities/CellModel";

export function updateCellValueInArray(dataArray: any, targetId: any, newValue: any, newFormulaValue:any) {
    // Создаем копию массива, чтобы не мутировать исходные данные
    const result = JSON.parse(JSON.stringify(dataArray));

    // Перебираем все объекты в массиве
    result.forEach((item: any) => {
        // Перебираем все ключи в объекте (кроме rowId)
        for (const key in item) {
            if (key === 'rowId') continue;

            // Проверяем, есть ли у текущего элемента нужный ID
            if (item[key].id === targetId) {
                // Заменяем значение
                item[key].value = newValue;
                item[key].formula_value = newFormulaValue;
                // Можно прервать цикл, если ID уникальны в рамках одного объекта
                break;
            }
        }
    });

    return result;
};

export function updateCellsValueInArray(dataArray: any, cells: CellModel[]) {
    // Создаем копию массива, чтобы не мутировать исходные данные
    const result = JSON.parse(JSON.stringify(dataArray));

    // Перебираем все объекты в массиве
    result.forEach((item: any) => {
        // Перебираем все ключи в объекте (кроме rowId)
        for (const key in item) {
            if (key === 'rowId') continue;

            // Проверяем, есть ли у текущего элемента нужный ID
            let cell:CellModel | undefined = cells.find((c:CellModel) => c.id == item[key].id);
            if (cell) {
                // Заменяем значение
                item[key].value = cell.value;
                item[key].formula_value = cell.formula_value;
            }
        }
    });

    return result;
};

export function formatFormula(input:string) {
    const FUNCTIONS = [
        'ЕСЛИ', 'РАЗНИЦА', 'РАЗНДАТ', 'СЕГОДНЯ',
        'СУММ', 'РАЗН', 'СРЗНАЧ', 'МИН', 'МАКС', 'СЧЁТ', 'ЕПУСТО',
        'SUM', 'AVG', 'AVERAGE', 'MIN', 'MAX', 'COUNT',
        'И', 'ИЛИ', 'НЕ'
    ];

    const sortedFunctions = FUNCTIONS.sort((a, b) => b.length - a.length);

    let str = input.trim();
    if (str.startsWith('=')) {
        str = str.substring(1);
    }

    let depth = 0;
    let lines = [];
    let currentLine = '';
    let i = 0;

    while (i < str.length) {
        const remaining = str.substring(i);
        let matched = false;

        // Проверяем, начинается ли с текущей позиции одна из функций
        for (const func of sortedFunctions) {
            const prefix = func + '(';
            if (remaining.toUpperCase().startsWith(prefix.toUpperCase())) {
                // Нашли функцию с открывающей скобкой
                if (currentLine.trim()) {
                    lines.push(currentLine.trimEnd());
                }
                currentLine = '    '.repeat(depth) + func + '(';
                depth++;
                i += prefix.length;

                // Если это функция с одним параметром (например, СЕГОДНЯ(), ЕПУСТО())
                // пробуем извлечь её содержимое до закрывающей скобки
                const result = extractBalancedParentheses(str, i);
                currentLine += result.content + ')';
                i = result.endIndex + 1;
                depth--;
                matched = true;
                break;
            }
        }

        if (matched) continue;

        // Обработка операторов сравнения и логических операторов (для красоты)
        if (/^(==|!=|<>|>=|<=|&&|\|\|)/.test(remaining)) {
            currentLine += ' ' + remaining.substring(0, 2) + ' ';
            i += 2;
            continue;
        }

        // Одиночные операторы
        if (/^[<>=]/.test(remaining) && !/^(==|!=|<>|>=|<=)/.test(remaining)) {
            currentLine += ' ' + remaining[0] + ' ';
            i += 1;
            continue;
        }

        const ch = str[i];

        // Точка с запятой — разделитель аргументов
        if (ch === ';') {
            lines.push(currentLine.trimEnd() + ';');
            currentLine = '    '.repeat(depth);
            i++;
            continue;
        }

        // Закрывающая скобка
        if (ch === ')') {
            if (currentLine.trim()) {
                lines.push(currentLine.trimEnd());
            }
            depth = Math.max(0, depth - 1);
            lines.push('    '.repeat(depth) + ')');
            currentLine = '    '.repeat(depth);
            i++;
            continue;
        }

        // Открывающая скобка (просто в выражении)
        if (ch === '(') {
            currentLine += '(';
            i++;
            continue;
        }

        // Запятая в аргументах функций
        if (ch === ',') {
            currentLine += ', ';
            i++;
            continue;
        }

        // Обычный символ
        currentLine += ch;
        i++;
    }

    if (currentLine.trim()) {
        lines.push(currentLine.trimEnd());
    }

    let result = lines.join('\n');

    result = '=\n' + result;

    result = result.replace(/\n{3,}/g, '\n\n');

    return result;
}

function extractBalancedParentheses(str:string, startIndex:number) {
    let depth = 1;
    let i = startIndex;
    let content = '';

    while (i < str.length && depth > 0) {
        const ch = str[i];

        // Проверяем, не начало ли это вложенной строки
        if (ch === '"' || ch === "'") {
            const quote = ch;
            content += ch;
            i++;
            while (i < str.length && str[i] !== quote) {
                if (str[i] === '\\') {
                    content += str[i];
                    i++;
                }
                content += str[i];
                i++;
            }
            if (i < str.length) {
                content += str[i];
                i++;
            }
            continue;
        }

        if (ch === '(') {
            depth++;
            content += ch;
        } else if (ch === ')') {
            depth--;
            if (depth > 0) {
                content += ch;
            }
        } else {
            content += ch;
        }
        i++;
    }

    return {
        content: content,
        endIndex: i - 1
    };
}
