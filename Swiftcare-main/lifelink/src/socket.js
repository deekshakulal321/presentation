// src/socket.js

import { io } from 'socket.io-client';

// The URL should match your backend server where Socket.IO is running
const SOCKET_SERVER_URL = "http://localhost:5000"; 

// Create the Socket.IO client instance
// The 'withCredentials: true' is CRITICAL for sending cookies/session data if you use them, 
// and matches the setting you have in your backend server.js
export const socket = io(SOCKET_SERVER_URL, {
    withCredentials: true,
    // You may add a token to the auth header if you are not using cookies
    // auth: {
    //     token: localStorage.getItem('token') // Example: if you store JWT in localStorage
    // }
});

socket.on('connect', () => {
    console.log('Socket.IO client connected to backend server.');
});

socket.on('disconnect', () => {
    console.log('Socket.IO client disconnected.');
});