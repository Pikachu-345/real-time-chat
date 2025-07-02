const app = require('./app');
const connectDB = require('./config/db');
const connectRedis = require('./config/redis');
require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const User = require('./models/User');
const jwt = require('jsonwebtoken');
const keys = require('./config/keys');
const SessionStore = require('./config/sessionStore');
const { v4: uuidv4 } = require('uuid');

function generateMessageId() {
    return uuidv4();
}

let redisClient;
let sessionStore; 

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL,
        methods: ["GET", "POST"],
        credentials: true
    }
});

io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
        return next(new Error('Authentication failed: No token provided.'));
    }

    try {
        const decoded = jwt.verify(token, keys.jwtSecret);
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return next(new Error('Authentication failed: User not found.'));
        }

        socket.user = user;
        socket.userId = user._id.toString();

        const activeSocketsCount = sessionStore.addSocket(socket.userId, socket.id);
        console.log(`SessionStore: User ${socket.userId} now has ${activeSocketsCount} active sockets.`);

        next();
    } catch (error) {
        console.error(`Socket.IO Auth Error for socket ${socket.id}:`, error.message);
        if (error.name === 'TokenExpiredError') {
            return next(new Error('Authentication failed: Token expired.'));
        }
        if (error.name === 'JsonWebTokenError') {
            return next(new Error('Authentication failed: Invalid token.'));
        }
        return next(new Error('Authentication failed: Invalid token.'));
    }
});

io.on('connection', async (socket) => {
    const userId = socket.userId;

    try {
        const offlineNotificationsKey = userId;
        const queuedEvents = await redisClient.lRange(offlineNotificationsKey, 0, -1);
        if (queuedEvents.length > 0) {
            let lastMessageSent;
            for (const eventDataString of queuedEvents) {
                const { event, msgToSend } = JSON.parse(eventDataString);
                lastMessageSent = msgToSend;
                socket.emit(event, msgToSend);
            }
            await redisClient.del(offlineNotificationsKey);
            const msgToSend={ 
                messageId:lastMessageSent.messageId,
                chatId:`${lastMessageSent.recieverId}_${lastMessageSent.senderId}`, 
            }
            if(sessionStore.isUserOnline(lastMessageSent.senderId)){
                const [senderSocket] = sessionStore.findSocketsForUser(lastMessageSent.senderId);
                io.to(senderSocket).emit('sent-ack', msgToSend);
            } else {
                const offlineNotificationsKey = recieverId;
                await redisClient.rPush(offlineNotificationsKey, JSON.stringify({ event: "sent-ack", msgToSend }));
            } 
        }
    } catch (error) {
        console.error(`Error fetching offline notifications for ${userId}:`, error);
    }

    socket.on('send-message', async (payload) => {
        const { recieverId, tempMessageId, message, imageData } = payload;
        const timestamp = new Date().toLocaleTimeString();
        let msgToStore = {
            messageId: generateMessageId(),
            recieverId,
            senderId: socket.user._id,
            senderUsername: socket.user.username,
            message,
            timestamp,
            messageType: "text",
            status: "sent"
        };
        if(imageData){
            msgToStore.messageType="image";
            msgToStore.imageUrl=imageData;
        }

        if (sessionStore.isUserOnline(recieverId)) {
            const [recieverSocketId] = sessionStore.findSocketsForUser(recieverId);
            if (recieverSocketId) {
                msgToStore.status = "delivered";
                io.to(recieverSocketId).emit('send-message', msgToStore);
            } else {
                const offlineNotificationsKey = recieverId;
                await redisClient.rPush(offlineNotificationsKey, JSON.stringify({ event: "send-message", msgToSend: msgToStore }));
                msgToStore.status = 'sent';
            }
        } else {
            const offlineNotificationsKey = recieverId;
            await redisClient.rPush(offlineNotificationsKey, JSON.stringify({ event: "send-message", msgToSend: msgToStore }));
            msgToStore.status = 'sent';
        }

        let ackMessage = { 
            messageId:msgToStore.messageId, 
            chatId: recieverId + "_" + socket.user._id,
            tempMessageId,
            status:msgToStore.status
        };
        socket.emit('ack-message', ackMessage);
    });

    socket.on('read-message', async (messageId, senderIdOfMessage) => {
        const readReceipt = {
            messageId: messageId,
            readerId: socket.userId,
            // readerUsername: socket.user.username,
            timestamp: new Date().toLocaleTimeString(),
            type: 'read-receipt'
        };

        if (sessionStore.isUserOnline(senderIdOfMessage)) {
            const [senderSocketId] = sessionStore.findSocketsForUser(senderIdOfMessage);
            if (senderSocketId) {
                io.to(senderSocketId).emit('read-receipt', readReceipt);
            }
        } else {
            const offlineNotificationsKey = senderIdOfMessage;
            await redisClient.rPush(offlineNotificationsKey, JSON.stringify({ event: "read-receipt", msgToSend: readReceipt }));
        }
    });

    socket.on('init:call', ({ uniqueKey, to, callType }) => {
        const [senderSocketId] = sessionStore.findSocketsForUser(to);
        // console.log("received data",{ uniqueKey, to });
        io.to(senderSocketId).emit('incoming:call', { callType, uniqueKey, from: userId });
        // console.log("sent data",{ uniqueKey, from: userId });
    });

    socket.on('disconnect', (reason) => {
        sessionStore.removeSocket(socket.id);
    });
});

async function startServer() {
    try {
        await connectDB();
        redisClient = await connectRedis();
        sessionStore = new SessionStore();

        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
            console.log(`Socket.IO server running on port ${PORT}`);
        });

    } catch (error) {
        console.error("Failed to start application:", error);
        process.exit(1);
    }
}

app.get('/', (req, res) => {
    res.send('Backend is LIVE!');
});

startServer();

process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    server.close(() => process.exit(1));
});