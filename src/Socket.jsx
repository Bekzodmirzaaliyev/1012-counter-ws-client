import { io } from 'socket.io-client';

const socket = io('https://one012-counter-ws-server.onrender.com') // Убедись, что порт совпадает

export default socket