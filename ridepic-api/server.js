const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors()); 
// Aumentamos el límite para que soportes fotos de alta calidad de tus motos
app.use(express.json({ limit: '50mb' }));

let usuarios = [];
let publicaciones = [];

app.post('/registrar', (req, res) => {
    const { usuario, password } = req.body;
    if (usuarios.find(u => u.usuario === usuario)) {
        return res.status(400).json({ mensaje: "El usuario ya existe" });
    }
    usuarios.push({ usuario, password });
    console.log(`Usuario registrado: ${usuario}`); // Esto ayuda a ver si funciona
    res.json({ mensaje: "¡Usuario guardado con éxito! ✅" });
});

app.post('/login', (req, res) => {
    const { usuario, password } = req.body;
    const encontrado = usuarios.find(u => u.usuario === usuario && u.password === password);
    if (encontrado) {
        res.json({ mensaje: "Entrando...", usuario: encontrado.usuario });
    } else {
        res.status(401).json({ mensaje: "Datos incorrectos ❌" });
    }
});

app.post('/publicar', (req, res) => {
    publicaciones.push(req.body);
    console.log("Nueva foto recibida");
    res.json({ mensaje: "Foto publicada" });
});

app.get('/galeria', (req, res) => {
    res.json(publicaciones);
});

// ESCUCHAR EN TODAS LAS INTERFACES
app.listen(3000, '0.0.0.0', () => {
    console.log("-----------------------------------------");
    console.log("SERVIDOR ACTIVO EN http://localhost:3000");
    console.log("-----------------------------------------");
});