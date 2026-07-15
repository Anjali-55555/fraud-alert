import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { token, user } = useAuth();
  const { addToast } = useToast();
  const [socket, setSocket] = useState(null);
  const [liveTransactions, setLiveTransactions] = useState([]);
  const [liveAlerts, setLiveAlerts] = useState([]);

  useEffect(() => {
    if (!token || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    // Connect to websocket server
    const socketUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:5000' 
      : window.location.origin;

    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5
    });

    setSocket(newSocket);

    // Join room based on user role
    newSocket.on('connect', () => {
      console.log('[Websocket] Connected to server');
      newSocket.emit('join_room', user.role);
    });

    // Listen for live transactions
    newSocket.on('new_transaction', (tx) => {
      setLiveTransactions(prev => [tx, ...prev.slice(0, 49)]); // Keep last 50
      
      // If client is analyst/admin/manager and transaction is high risk, trigger popups
      if (tx.riskLevel === 'High' && user.role !== 'Customer') {
        addToast(
          'Critical Threat Detected', 
          `Transaction ${tx.transactionId} of $${tx.amount} flagged as High Risk (${tx.riskScore}/100) at ${tx.merchant}.`,
          'Critical'
        );
      }
    });

    // Listen for system alert broadcasts
    newSocket.on('new_alert', (alert) => {
      setLiveAlerts(prev => [alert, ...prev.slice(0, 19)]); // Keep last 20
      if (user.role !== 'Customer') {
        addToast(alert.title, alert.message, 'warning');
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [token, user, addToast]);

  return (
    <SocketContext.Provider value={{ socket, liveTransactions, liveAlerts, setLiveTransactions }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
