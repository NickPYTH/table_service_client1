import {Flex} from "antd";
import {QuestionOutlined, SettingOutlined} from "@ant-design/icons";
import React from "react";

const barButtonStyle: React.CSSProperties = {
    width: 36,
    height: 36,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    border: "none",
    background: "transparent",
    color: "#fff",
    fontSize: 18,
    borderRadius: 8,
    cursor: "pointer",
};

export const PageBar = () => {
    return (
        <Flex
            align="center"
            justify="space-between"
            style={{
                height: 48,
                flexShrink: 0,
                padding: "0 12px",
                background: "#2E86C1",
                color: "#fff",
            }}
        >
            <button type="button" aria-label="Меню" style={barButtonStyle} onClick={() => {}}>
                <span
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 4px)",
                        gap: 3,
                    }}
                >
                    {Array.from({length: 9}, (_, index) => (
                        <span key={index} style={{width: 4, height: 4, borderRadius: 1, background: "#fff"}}/>
                    ))}
                </span>
            </button>
            <Flex align="center" gap={4}>
                <button type="button" aria-label="Настройки" style={barButtonStyle} onClick={() => {}}>
                    <SettingOutlined/>
                </button>
                <button type="button" aria-label="Помощь" style={barButtonStyle} onClick={() => {}}>
                    <QuestionOutlined/>
                </button>
                <button
                    type="button"
                    aria-label="Профиль"
                    onClick={() => {}}
                    style={{
                        ...barButtonStyle,
                        width: 32,
                        height: 32,
                        marginLeft: 6,
                        borderRadius: "50%",
                        border: "1.5px solid #fff",
                        fontSize: 12,
                        fontWeight: 600,
                        letterSpacing: 0.3,
                    }}
                >
                    NS
                </button>
            </Flex>
        </Flex>
    )
}
