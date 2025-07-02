import { useEffect } from 'react';
import socket from './socket'; 
import { useUserActions } from '../utils/useUserActions'; 
import { useAuth } from '../context/AuthContext';

const useSocketEvents = () => {
    const { addMessage, updateMessageStatus, updateMessage } = useUserActions();
    const { user } = useAuth();

    useEffect(() => {
        const handleChatMessage = (data) => {
            console.log("Received send-message:", data);
            addMessage(data);
        };

        const handleAckMessage = (data) => {
            console.log("Received ack-message:", data);
            updateMessage(data.messageId, data.chatId, data.status, data.tempMessageId); 
        };

        const handleSentAck = (data) => {
            console.log("Received sent-ack:", data);
            updateMessageStatus(data.messageId, data.chatId, 'delivered');
        };

        const handleReadReceipt = (data) => {
            console.log("Received read-receipt:", data);
            const chatId = `${data.readerId}_${user._id}`
            updateMessageStatus(data.messageId,chatId,"seen");
        };

        socket.on('send-message', handleChatMessage);
        socket.on('ack-message', handleAckMessage);
        socket.on('sent-ack', handleSentAck);
        socket.on('read-receipt', handleReadReceipt);

        return () => {
            socket.off('send-message', handleChatMessage);
            socket.off('ack-message', handleAckMessage);
            socket.off('sent-ack', handleSentAck);
            socket.off('read-receipt', handleReadReceipt);
        };
    }, [addMessage]); 
};

export default useSocketEvents;