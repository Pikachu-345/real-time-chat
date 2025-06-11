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

let redisClient;

let sessionStore = new SessionStore();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);


const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL, 
        methods: ["GET", "POST"],      
        credentials: true              
    }
});

io.use(async(socket,next)=>{
    const token = socket.handshake.auth.token;

    if (!token) {
        // console.log(`Socket.IO Auth: No token provided for socket ${socket.id}`);
        return next(new Error('Authentication failed: No token provided.'));
    }

    try {
        const decoded = jwt.verify(token, keys.jwtSecret);
        const user = await User.findById(decoded.id).select('-password'); 

        if (!user) {
            console.log(`Socket.IO Auth: User not found for token on socket ${socket.id}`);
            return next(new Error('Authentication failed: User not found.'));
        }

        socket.user = user;
        socket.userId = user._id.toString();
        console.log(`Socket.IO Auth: User ${user.username} (${user._id}) authenticated for socket ${socket.id}`);

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
})

io.on('connection',async (socket) => {
    const userId = socket.userId; 
    console.log(`User ${userId} successfully connected with socket ID: ${socket.id}`);

    try {
        console.log("here");
        const offlineMessagesKey = socket.userId;
        const messages = await redisClient.lRange(offlineMessagesKey, 0, -1); // Get all messages
        if (messages.length > 0) {
            console.log(`Delivering ${messages.length} offline messages to ${userId}`);
            for (const msg of messages) {
                console.log(msg);
                socket.emit('chat-message', JSON.parse(msg));
            }
            await redisClient.del(offlineMessagesKey); // Clear the queue after delivery
            console.log(`Offline messages for ${userId} cleared from Redis.`);
        }
    } catch (error) {
        console.error(`Error fetching offline messages for ${userId}:`, error);
    }

    socket.on('chat-message', async(recieverId,msg) => {
        console.log(`Socket.IO: Message from ${socket.user.username} (${socket.id}): ${msg} and reciver (${recieverId})`);
        const timestamp=new Date().toLocaleTimeString();
        const msgToStore={
            chatId : socket.user._id +"_" +recieverId,
            senderId : socket.user._id,
            senderUsername: socket.user.username, 
            message: msg,           
            timestamp, 
            messageType:"text"
        };
        if(sessionStore.isUserOnline(recieverId)){
            const [recieverSocketId] = sessionStore.findSocketsForUser(recieverId);
            console.log("shocket id is ",recieverSocketId);
            io.to(recieverSocketId).emit('chat-message',msgToStore );
        }else{
            const offlineMessagesKey = recieverId;
            await redisClient.rPush(offlineMessagesKey, JSON.stringify(msgToStore));
            msgToStore.status = 'queued_offline';
            console.log(`Message queued for offline user: ${recieverId}`);
        }
        msgToStore.chatId=recieverId+"_"+socket.user._id;
        socket.emit('chat-message', msgToStore);
    });

    // socket.on('requestInitialChats', () => {
    //     console.log(`Socket.IO: Client ${socket.id} requested initial chats.`);
    //     // hard-coded for now
    //     const initialChats = [
    //         { id: '1', name: 'General Chat', lastMessage: 'Welcome!', lastMessageTime: '10:00 AM', unreadCount: 0, avatarUrl: null },
    //         { id: '2', name: 'Private Group', lastMessage: 'Hello there!', lastMessageTime: 'Yesterday', unreadCount: 3, avatarUrl: null },
    //     ];
    //     socket.emit('initial chats', initialChats); 
    // });

    socket.on('disconnect', (reason) => {
        const disconnectedUserId = sessionStore.removeSocket(socket.id);
        console.log(`Socket.IO: User disconnected - ID: ${socket.id}, Reason: ${reason}`);
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
    res.send('Chat app backend is running!');
});//test

startServer();

process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1)); 
});