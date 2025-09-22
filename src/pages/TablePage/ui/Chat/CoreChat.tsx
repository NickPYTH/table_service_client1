import {Button, Flex, Input, Modal} from "antd"
import React, {useEffect, useState} from "react";
import {TableModel} from "entities/TableModel";
import {wsHost} from "shared/config/constants";
import {MessageModel} from "entities/MessageModel";
import {ChatMessage} from "pages/TablePage/ui/Chat/ChatMessage";
import { SendOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import {RootStateType} from "store/store";

type PropsType = {
    visible: boolean;
    setVisible: Function;
    table: TableModel;
}
export const CoreChat = (props: PropsType) => {

    // Store
    const currentUser = useSelector((state: RootStateType) => state.currentUser.user);
    // -----

    // States
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [messages, setMessages] = useState<MessageModel[]>([]);
    const [messageText, setMessageText] = useState("");
    // -----

    // Effects
    useEffect(() => {
        // Подключение к чату
        const socket = new WebSocket(`${wsHost}/ws/chats/`);

        socket.onopen = () => {
            console.log('WebSocket chats connected');
            setSocket(socket);
        };

        socket.onmessage = (event) => {
            const message: {type: string, messages: string} = JSON.parse(event.data);
            if (message.type == 'get_chat_data') {
                let messagesList:MessageModel[] = JSON.parse(message.messages);
                setMessages(messagesList);
            }
        };

        socket.onclose = () => {
            console.log('WebSocket chats disconnected');
        };

        socket.onerror = (error) => {
            console.error('WebSocket chats error:', error);
        };

        return () => {
            socket.close();
        };
    }, []);
    useEffect(() => {
        if (socket) {
            socket.send(JSON.stringify({table_id: props.table.id, type: 'get_chat_data'}));
        }
    }, [socket]);
    // -----

    // Handlers
    const sendMessageHandler = () => {
        if (messageText.trim() && socket && currentUser){
            socket.send(JSON.stringify({type: 'send_message', table_id: props.table.id, user_id: currentUser.id, message: messageText}))
            setMessageText("");
        }
    }
    // -----

    return(
        <Modal title={`Обсуждение таблицы`}
               maskClosable={false}
               open={props.visible}
               onCancel={() => props.setVisible(false)}
               width={'650px'}
               loading={false}
               footer={() => (<></>)}
        >
            <Flex style={{height: window.innerHeight*0.5}} gap={'small'} vertical justify={'space-between'}>
                <Flex style={{height: window.innerHeight*0.5 - 60, overflowY: 'scroll', padding: 10}} gap={'small'} vertical>
                    {messages.map((message:MessageModel) => <ChatMessage message={message}/>)}
                </Flex>
                <Flex gap={'small'}>
                    <Input placeholder={"Сообщение"} variant={'outlined'} value={messageText} onChange={(e)=>setMessageText(e.target.value)}/>
                    <Button onClick={sendMessageHandler} icon={<SendOutlined/>}/>
                </Flex>
            </Flex>
        </Modal>
    )
}