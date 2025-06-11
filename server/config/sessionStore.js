class SessionStore {
    constructor() {
        // Maps userId to a Set of socket.ids
        // Example: { "user_alice": Set("socket123", "socket456"), "user_bob": Set("socket789") }
        this.userToSockets = new Map();

        // Maps socket.id to userId
        // Example: { "socket123": "user_alice", "socket456": "user_alice", "socket789": "user_bob" }
        this.socketToUser = new Map();
    }

    /**
     * Associates a socket.id with a userId.
     * This should be called when a user authenticates and connects.
     *
     * @param {string} userId - The persistent ID of the user.
     * @param {string} socketId - The current Socket.IO ID for this connection.
     * @returns {number} The number of active sockets for this user after adding.
     */
    addSocket(userId, socketId) {
        if (!userId || !socketId) {
            console.warn('Attempted to add a socket without userId or socketId.');
            return 0;
        }

        // Add socketId to the user's set of sockets
        if (!this.userToSockets.has(userId)) {
            this.userToSockets.set(userId, new Set());
        }
        this.userToSockets.get(userId).add(socketId);

        // Store the reverse mapping
        this.socketToUser.set(socketId, userId);

        return this.userToSockets.get(userId).size;
    }

    /**
     * Removes a socket.id from the store.
     * This should be called when a socket disconnects.
     *
     * @param {string} socketId - The Socket.IO ID that disconnected.
     * @returns {string | null} The userId of the disconnected socket, or null if not found.
     */
    removeSocket(socketId) {
        if (!socketId) {
            console.warn('Attempted to remove a socket without socketId.');
            return null;
        }

        const userId = this.socketToUser.get(socketId);
        if (userId) {
            // Remove socketId from the user's set
            const sockets = this.userToSockets.get(userId);
            if (sockets) {
                sockets.delete(socketId);
                // If the user has no more active sockets, remove the user entirely
                if (sockets.size === 0) {
                    this.userToSockets.delete(userId);
                }
            }
            // Remove the reverse mapping
            this.socketToUser.delete(socketId);
        }
        return userId;
    }

    /**
     * Finds all active socket.ids for a given userId.
     *
     * @param {string} userId - The ID of the user to find sockets for.
     * @returns {Set<string> | undefined} A Set of socket.ids, or undefined if the user is not online.
     */
    findSocketsForUser(userId) {
        if (!userId) {
            console.warn('Attempted to find sockets without userId.');
            return undefined;
        }
        return this.userToSockets.get(userId);
    }

    /**
     * Finds the userId associated with a given socket.id.
     *
     * @param {string} socketId - The Socket.IO ID to find the user for.
     * @returns {string | undefined} The userId, or undefined if the socket.id is not registered.
     */
    findUserBySocketId(socketId) {
        if (!socketId) {
            console.warn('Attempted to find user by socketId without socketId.');
            return undefined;
        }
        return this.socketToUser.get(socketId);
    }

    /**
     * Checks if a user is currently online (has at least one active socket).
     *
     * @param {string} userId - The ID of the user to check.
     * @returns {boolean} True if the user is online, false otherwise.
     */
    isUserOnline(userId) {
        if (!userId) {
            return false;
        }
        const sockets = this.userToSockets.get(userId);
        return sockets && sockets.size > 0;
    }

    /**
     * Returns a list of all currently online user IDs.
     *
     * @returns {string[]} An array of online user IDs.
     */
    getOnlineUsers() {
        return Array.from(this.userToSockets.keys());
    }

    /**
     * Gets the total number of active user sessions (not distinct users).
     * @returns {number} Total number of active sockets.
     */
    getTotalActiveSockets() {
        return this.socketToUser.size;
    }

    /**
     * Gets the total number of unique online users.
     * @returns {number} Total number of unique online users.
     */
    getTotalOnlineUsers() {
        return this.userToSockets.size;
    }
}

module.exports = SessionStore; // Export for use in your server.js