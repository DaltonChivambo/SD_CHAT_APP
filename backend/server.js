const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

const corsOptions = {
	origin: process.env.FRONTEND_URL,
	methods: ["GET", "POST", "DELETE"],
	allowedHeaders: ["Content-Type", "Authorization"],
	credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT || 3000;

// All routers
const authRouter = require("./routes/auth");
const userRouter = require("./routes/user");
const chatRouter = require("./routes/chat");
const messageRouter = require("./routes/message");

// Connect to Database
main()
	.then(() => console.log("✅ 🛢 Banco de dados conectado!"))
	.catch((err) => console.log(err));

async function main() {
	await mongoose.connect(process.env.MONGODB_URI);
}

// Root route
app.get("/", (req, res) => {
	res.json({
		message: "Bem vindo ao SD-CHAT! --Backend SRV",
		frontend_url: process.env.FRONTEND_URL,
	});
});

// All routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/chat", chatRouter);
app.use("/api/message", messageRouter);

// Invaild routes
app.all("*", (req, res) => {
	res.json({ error: "Invaild Route" });
});

// Error handling middleware
app.use((err, req, res, next) => {
	const errorMessage = err.message || "Something Went Wrong!";
	res.status(500).json({ message: errorMessage });
});

// Start the server (modificado para escutar em todas as interfaces de rede)
const server = app.listen(process.env.PORT || 9000, '0.0.0.0', () => {
	console.log(`Servidor Frontend `, process.env.FRONTEND_URL);
});



// Socket.IO setup
const { Server } = require("socket.io");
const io = new Server(server, {
	pingTimeout: 60000,
	transports: ["websocket"],
	cors: corsOptions,
});

const User = require("./models/user");
const Chat = require("./models/chat");  // Usando minúsculo "chat"

// Socket connection
io.on("connection", (socket) => {

	const clientIp = socket.handshake.address;
	console.log(``);
	console.log(`🤝 SocketID: ${socket.id} 💻 Novo cliente conectado - IP: ${clientIp}`);


	// Join user and message send to client
	const setupHandler = async (userId) => {
		if (!socket.hasJoined) {
			socket.join(userId);
			socket.hasJoined = true;
			//console.log("User joined:", userId);

			try {
				// Atribui o userId ao socket
				socket.userId = userId;  // Agora o socket tem o userId

				// Buscar o usuário pelo ID
				const user = await User.findById(userId);
				if (user) {
					console.log(`✅ 🙋 ${user.firstName} Acessou o sistema - IP: ${clientIp} - UserID: ${userId}`);
					socket.emit("connected", { userName: user.firstName });
				} else {
					console.log("Usuário não encontrado");
				}
			} catch (error) {
				console.error("Error fetching user:", error);
			}

			socket.emit("connected");
		}
	};


	const newMessageHandler = (newMessageReceived) => {
		let chat = newMessageReceived?.chat;

		// Garantir que o nome do chat seja recuperado corretamente
		let chatName = chat?.chatName || 'Unnamed Group';  // Usando chatName, ou 'Unnamed Group' caso esteja vazio

		// Se for um chat privado, usa o nome do outro usuário
		if (!chat.isGroupChat && chat.users.length === 2) {
			const otherUser = chat.users.find(user => user._id.toString() !== newMessageReceived.sender._id.toString());
			chatName = otherUser ? otherUser.firstName : 'Unknown User';
		}

		// Enviar para os usuários
		chat?.users.forEach((user) => {
			if (user._id === newMessageReceived.sender._id) return;

			// Log para o nome do usuário e nome do chat
			console.log(``);
			console.log(`✅ ✉︎  ${newMessageReceived.sender.firstName} Enviou mensagem para ${chatName}`);

			// Enviar a mensagem para o usuário correto
			socket.in(user._id).emit("message received", newMessageReceived);
		});
	};



	// Join a Chat Room and Typing effect
	const joinChatHandler = async (room) => {
		if (!socket.currentRoom) {
			// Se o usuário não estiver em nenhuma sala, entra na sala
			socket.join(room);
			socket.currentRoom = room;

			try {
				// Buscar o chat pelo ID da sala
				const chat = await Chat.findById(room);
				const chatName = chat ? chat.chatName : 'Unnamed Group';

				// Verificar se o userId foi atribuído corretamente ao socket
				if (!socket.userId) {
					console.log("Erro: userId não encontrado no socket");
					return; // Impedir continuar caso userId não exista
				}

				// Buscar o usuário associado ao socket usando o userId
				const user = await User.findById(socket.userId);
				if (!user) {
					console.log("Erro: Usuário não encontrado.");
					return; // Impedir continuar caso o usuário não seja encontrado
				}

				const userName = user.firstName;

				// Emitir o evento de usuário entrando na sala com o nome da sala e o nome do usuário
				socket.emit("user joined room", { room: chatName, user: userName });

				// Log para saber que o usuário entrou na sala
				console.log(`${userName} entrou na sala ${chatName}`);
			} catch (error) {
				console.error("Erro ao buscar usuário ou chat:", error);
			}
		} else {
			// Se o usuário já estiver em uma sala, sai da sala atual
			if (socket.currentRoom === room) {
				console.log(`User ainda está na sala: ${room} `);
				return;
			}
			socket.leave(socket.currentRoom);
			console.log(`User saiu da sala: ${socket.currentRoom}`);

			// Entrar na nova sala
			socket.join(room);
			socket.currentRoom = room;

			// Emitir nome da sala com nome do usuário que entrou
			try {
				const chat = await Chat.findById(room);
				const chatName = chat ? chat.chatName : 'Unnamed Group';
				const user = await User.findById(socket.userId);
				const userName = user ? user.firstName : 'Unknown User';

				socket.emit("user joined room", { room: chatName, user: userName });
				console.log(`${userName} entrou na sala ${chatName}`);
			} catch (error) {
				console.error("Erro ao buscar usuário ou chat:", error);
			}
		}
	};




	const typingHandler = (room) => {
		socket.in(room).emit("typing");
	};
	const stopTypingHandler = (room) => {
		socket.in(room).emit("stop typing");
	};

	// Clear, Delete and Create chat handlers
	const clearChatHandler = (chatId) => {
		socket.in(chatId).emit("clear chat", chatId);
	};
	const deleteChatHandler = (chat, authUserId) => {
		chat.users.forEach((user) => {
			if (authUserId === user._id) return;
			console.log("Chat delete:", user.firstName);
			socket.in(user._id).emit("delete chat", chat._id);
		});
	};
	const chatCreateChatHandler = (chat, authUserId) => {
		chat.users.forEach((user) => {
			if (authUserId === user._id) return;
			console.log("Create chat:", user.firstName);
			socket.in(user._id).emit("chat created", chat);
		});
	};

	socket.on("setup", setupHandler);
	socket.on("new message", newMessageHandler);
	socket.on("join chat", joinChatHandler);
	socket.on("typing", typingHandler);
	socket.on("stop typing", stopTypingHandler);
	socket.on("clear chat", clearChatHandler);
	socket.on("delete chat", deleteChatHandler);
	socket.on("chat created", chatCreateChatHandler);

	socket.on("disconnect", () => {
		console.log("❌ 💻 Cliente Desconectado - IP:", clientIp);
		socket.off("setup", setupHandler);
		socket.off("new message", newMessageHandler);
		socket.off("join chat", joinChatHandler);
		socket.off("typing", typingHandler);
		socket.off("stop typing", stopTypingHandler);
		socket.off("clear chat", clearChatHandler);
		socket.off("delete chat", deleteChatHandler);
		socket.off("chat created", chatCreateChatHandler);
	});
});
