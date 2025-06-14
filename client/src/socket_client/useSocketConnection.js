import { useEffect } from 'react';
import socket from './socket'; 

const useSocketConnection = () => {
  useEffect(() => {
    console.log('useSocketConnection: Attempting to connect socket...');
    socket.connect();

    socket.on('connect', () => {
      console.log('useSocketConnection: Socket connected!', socket.id);
    });
    socket.on('disconnect', (reason) => {
      console.log('useSocketConnection: Socket disconnected:', reason);
    });
    socket.on('connect_error', (error) => {
        console.error('useSocketConnection: Socket connection error:', error);
    });

    return () => {
      console.log('useSocketConnection: Disconnecting socket...');
      socket.disconnect();
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
    };
  }, []); 

  return socket; 
};

export default useSocketConnection;