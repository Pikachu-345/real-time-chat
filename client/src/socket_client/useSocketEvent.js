import { useEffect } from 'react';
import socket from './socket'; // Your Socket.IO client instance
import { useUserActions } from '../utils/useUserActions'; 
import { useAuth } from '../context/AuthContext';

// This custom hook centralizes Socket.IO event listeners
const useSocketEvents = () => {
    const { addMessage, updateMessageStatus, updateMessage } = useUserActions();
    const { user } = useAuth();

    useEffect(() => {
        // --- Incoming Messages (chat-message) ---
        const handleChatMessage = (data) => {
            console.log("Received send-message:", data);
            addMessage(data);

            // Optional: If the message is for the currently active chat and it's from another user,
            // you might want to automatically send a read receipt.
            // You'd need to get the activeChatId from Recoil here.
            // const currentActiveChatId = get(activeChatId); // This requires a different Recoil getter setup,
            // or pass activeChatId from component that uses this hook.
            // For simplicity, let's assume `data.recieverId` is the current user's ID
            // and `data.senderId` is the other party.
            // If the chat with `data.senderId` is active, send read receipt.
            // You might need `useRecoilValue(activeChatId)` here to get the current value.
            // However, it's safer to have the `ChatWindow` component itself trigger `read-message`
            // when it becomes active or messages are viewed, to ensure accuracy.
            // For now, let's keep the automatic read receipt out of this hook as it might be complex.
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