const express = require('express');
const cors = require('cors');
const http = require('http');
require('dotenv').config();
require('./config');
const { Server } = require('socket.io');
const User = require('./userModel');
const UserChat = require('./userChats');
const customerModel = require('./customerMOdel')
const moment = require('moment');

const app = express();
const MainServer = http.createServer(app);
app.use(cors())
// const io = new Server(MainServer);

const io = new Server(MainServer, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

// Route handler for the root URL
app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/users', async (req, res) => {
    try {
        //Select Only First Name and Last Name
        const resullt = await User.find().populate({
            path: 'username',
            select: 'first_name last_name' // Select only the first_name and last_name fields
        })
        res.send({ data: resullt });
    } catch (error) {
        console.log(error);
    }
});

app.get('/userMessages/:sender/:receiver', async (req, res) => {
    const { sender, receiver } = req.params;
    console.log(sender);
    console.log(receiver)
    try {
        // let result = await UserChat.find({ $and: [{ sender: sender }, { receiver: receiver }] });   
        let result = await UserChat.find({
            $or: [
                { $and: [{ sender: sender }, { receiver: receiver }] },
                { $and: [{ sender: receiver }, { receiver: sender }] }
            ]
        })
        res.send({ data: result })
    } catch (error) {
        console.log(error)
    }
})

io.on("connection", (socket) => {
    console.log('User Connected: ' + socket.id);

    socket.on('join', async (user) => {
        try {
            const userInChat = await User.findOne({ username: user });
            if (userInChat !== null) {
                const result = await User.updateOne({ username: user }, { $set: { socketId: socket.id,is_active:true } });
            } else {
                const collection = new User({ username: user, socketId: socket.id,is_active:true });
                const result = await collection.save();
            }
        } catch (error) {
            console.log(error)
        }
    })

    socket.on('privateMessage', async ({ sender, receiver, message,is_payment,amount }) => {
        try {
            const receiverUser = await User.findOne({ username: receiver });
            if (receiverUser) {
                io.emit('privateMessage', { sender, message });
                console.log(sender)
                const chatMessage = new UserChat({ sender: sender, receiver, message,msgTime:moment().format("hh:mm"),is_payment,paid_amount:amount && amount });
                await chatMessage.save();
            } else {
                console.log('User not found');
            }
        } catch (error) {
            console.error('Error sending private message:', error);
        }
    });

    // Handle disconnection
    socket.on('disconnect', async() => {
        try {
            console.log('User Disconnected: ' + socket.id);
            const result = await User.updateOne({ socketId:socket.id }, { $set: { is_active:false } });
        } catch (error) {
            console.log(error)
        }
    });

    // Handle custom events
    socket.on('chat_message', (msg) => {
        console.log('Message received:', msg);
        // Broadcast the message to all connected clients
        io.emit('chat_message', msg);
    });
});

MainServer.listen(3001, () => {
    console.log(`Server started on port ${3001}`);
});

