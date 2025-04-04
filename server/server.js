const express = require('express');
const app = express();
const userRoutes = require('./routes/userRoutes')
const User = require('./models/User');
const Message = require('./models/Message')
const rooms = ['general', 'tech', 'finance', 'crypto'];
const bots = ['career'];
const prompt = ['You are a career advisor. Answer the user\'s questions about career advice. Answer in 10 words or less.'];
const cors = require('cors');

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cors());

app.use('/users', userRoutes)
require('./connection')

const server = require('http').createServer(app);
const PORT = 5001;
const io = require('socket.io')(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
})


async function getLastMessagesFromRoom(room){
  let roomMessages = await Message.aggregate([
    {$match: {to: room}},
    {$group: {_id: '$date', messagesByDate: {$push: '$$ROOT'}}}
  ])
  return roomMessages;
}

function sortRoomMessagesByDate(messages){
  return messages.sort(function(a, b){
    let date1 = a._id.split('/');
    let date2 = b._id.split('/');

    date1 = date1[2] + date1[0] + date1[1]
    date2 =  date2[2] + date2[0] + date2[1];

    return date1 < date2 ? -1 : 1
  })
}

// socket connection

io.on('connection', (socket)=> {

  socket.on('new-user', async ()=> {
    const members = await User.find();
    io.emit('new-user', members)
  })

  socket.on('join-room', async(newRoom, previousRoom)=> {
    socket.join(newRoom);
    socket.leave(previousRoom);
    let roomMessages = await getLastMessagesFromRoom(newRoom);
    roomMessages = sortRoomMessagesByDate(roomMessages);
    socket.emit('room-messages', roomMessages)
  })

  socket.on('message-room', async (room, content, sender, time, date) => {
    const newMessage = await Message.create({ content, from: sender, time, date, to: room });

    let ids = room.split('-');
    if (bots.includes(ids[0]) || bots.includes(ids[1])) {
        const bot = ids[0] === sender ? ids[1] : ids[0];
        const apiResponse = await fetch("http://localhost:11434/api/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "llama3.2:1b",
                prompt: prompt[bots.indexOf(bot)] + " " + content,
                stream: false,
            }),
        });
        const responseData = await apiResponse.json();
        const response = responseData.response;
        const botResponse = await Message.create({ content: response, from: bot, time, date, to: room });

        // Emit updated messages to the room after bot response
        let roomMessages = await getLastMessagesFromRoom(room);
        roomMessages = sortRoomMessagesByDate(roomMessages);
        io.to(room).emit('room-messages', roomMessages);
    } else {
        // Emit updated messages to the room for normal messages
        let roomMessages = await getLastMessagesFromRoom(room);
        roomMessages = sortRoomMessagesByDate(roomMessages);
        io.to(room).emit('room-messages', roomMessages);
    }

    socket.broadcast.emit('notifications', room);
  })

  app.delete('/logout', async(req, res)=> {
    try {
      const {_id, newMessages} = req.body;
      const user = await User.findById(_id);
      user.status = "offline";
      user.newMessages = newMessages;
      await user.save();
      const members = await User.find();
      socket.broadcast.emit('new-user', members);
      res.status(200).send();
    } catch (e) {
      console.log(e);
      res.status(400).send()
    }
  })

})


app.get('/rooms', (req, res)=> {
  res.json(rooms)
})

app.get('/chatbots', (req, res)=>{
  res.json(bots);
})

server.listen(PORT, ()=> {
  console.log('listening to port', PORT)
})
