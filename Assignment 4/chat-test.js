const readline = require('readline');
const { io } = require('socket.io-client');

const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZiMDQzYTQyNGQyNWVkOTAzODJhMzYxNiIsInJvbGUiOiJ1c2VyIiwidXNlcm5hbWUiOiJBbnVzaGthIiwiaWF0IjoxNzk1NDQzMzA4LCJleHAiOjE3OTU1Mjk3MDh9._vxd7W5yGbaYpH_0Q8x6UspHr7W6HpKtbl8r6pKBDyk';
const ROOM = 'general';
const SENDER = 'Anushka';

const socket = io('http://localhost:5000', {
  auth: { token: TOKEN }
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

socket.on('connect', () => {
  console.log(`Connected (${socket.id}). Joining #${ROOM}...`);
  socket.emit('joinRoom', ROOM);
  rl.prompt();
});

socket.on('systemMessage', (data) => {
  console.log(`\n[SYSTEM] ${data.message}`);
  rl.prompt();
});

socket.on('chatMessage', (data) => {
  console.log(`\n[${data.room}] ${data.sender}: ${data.message}`);
  rl.prompt();
});

socket.on('connect_error', (err) => {
  console.error('Connection failed:', err.message);
  process.exit(1);
});

rl.setPrompt(`${SENDER}> `);

rl.on('line', (line) => {
  const text = line.trim();
  if (text) {
    socket.emit('chatMessage', {
      room: ROOM,
      sender: SENDER,
      message: text
    });
  }
  rl.prompt();
});