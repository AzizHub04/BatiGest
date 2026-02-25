const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const http = require('http');
const { Server } = require('socket.io');

// Charger les variables d'environnement
dotenv.config();

const app = express();
const server = http.createServer(app);

// Configuration Socket.io
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Middlewares
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Rendre io accessible dans les routes
app.set('io', io);

// Connexion MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connecté'))
  .catch((err) => console.log('❌ Erreur MongoDB:', err));

// Socket.io - Connexion
io.on('connection', (socket) => {
  console.log('Utilisateur connecté:', socket.id);

  // L'utilisateur rejoint sa room personnelle
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`Utilisateur ${userId} a rejoint sa room`);
  });

  // Rejoindre la room d'un chantier
  socket.on('join-chantier', (chantierId) => {
    socket.join(`chantier-${chantierId}`);
    console.log(`Socket ${socket.id} a rejoint chantier-${chantierId}`);
  });

  socket.on('disconnect', () => {
    console.log('Utilisateur déconnecté:', socket.id);
  });
});

//Authentification Route
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Routes responsables
const responsableRoutes = require('./routes/responsableRoutes');
app.use('/api/responsables', responsableRoutes);

// Routes chantiers
const chantierRoutes = require('./routes/chantierRoutes');
app.use('/api/chantiers', chantierRoutes);

// Routes travaux et taches
const travailRoutes = require('./routes/travailRoutes');
const tacheRoutes = require('./routes/tacheRoutes');
app.use('/api/travaux', travailRoutes);
app.use('/api/taches', tacheRoutes);

// Routes notes
const noteRoutes = require('./routes/noteRoutes');
app.use('/api/notes', noteRoutes);

// Routes couts
const coutRoutes = require('./routes/coutRoutes');
app.use('/api/couts', coutRoutes);

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});