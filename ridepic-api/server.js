// =========================================================================
// PARCHE COMPLETO DE COMPATIBILIDAD PARA NEDB EN VERSIONES MODERNAS DE NODE
// Esto restaura las funciones eliminadas que NeDB necesita para buscar y guardar
// =========================================================================
const util = require('util');

if (!util.isDate) {
    util.isDate = function (obj) {
        return Object.prototype.toString.call(obj) === '[object Date]';
    };
}

if (!util.isRegExp) {
    util.isRegExp = function (obj) {
        return Object.prototype.toString.call(obj) === '[object RegExp]';
    };
}
// =========================================================================

const express = require('express');
const cors = require('cors');
const Datastore = require('nedb');
const path = require('path');

const app = express();

// Middlewares obligatorios para permitir peticiones del cliente y leer JSON
app.use(cors());
app.use(express.json());

// Inicialización de la Base de Datos apuntando al archivo físico en el disco
let dbRidePicUsers;
try {
    const dbPath = path.resolve(__dirname, 'ridepicusers.db');
    dbRidePicUsers = new Datastore({ 
        filename: dbPath, 
        autoload: true,
        corruptAlertThreshold: 1
    });
    console.log(`[BD] Archivo de base de datos vinculado en: ${dbPath}`);
} catch (error) {
    console.error("[ERROR CRÍTICO] No se pudo inicializar NeDB:", error);
}

/**
 * 1. Ruta POST para Registrar Usuarios
 */
app.post('/registrar', (req, res) => {
    const { usuario, password } = req.body;

    if (!usuario || !password) {
        return res.status(400).json({ error: "Por favor, llena todos los campos" });
    }

    // Buscar en el disco si el usuario ya existe
    dbRidePicUsers.findOne({ usuario: usuario }, (err, usuarioExistente) => {
        if (err) {
            console.error("[BD ERROR] Error al buscar usuario:", err);
            return res.status(500).json({ error: "Error interno al consultar la base de datos." });
        }

        if (usuarioExistente) {
            return res.status(400).json({ error: "El nombre de usuario ya existe" });
        }

        // Insertar el nuevo usuario físicamente en el archivo
        dbRidePicUsers.insert({ usuario, password }, (err, nuevoUsuario) => {
            if (err) {
                console.error("[BD ERROR] Error de escritura en disco:", err);
                return res.status(500).json({ error: "Error al escribir los datos en el disco." });
            }
            
            console.log(`[ÉXITO] Usuario registrado correctamente: ${usuario}`);
            return res.status(201).json({ mensaje: "Usuario registrado con éxito." });
        });
    });
});

/**
 * 2. Ruta POST para Iniciar Sesión (Login)
 */
app.post('/login', (req, res) => {
    const { usuario, password } = req.body;

    if (!usuario || !password) {
        return res.status(400).json({ error: "Por favor, llena todos los campos" });
    }

    // Buscar las credenciales directamente en el disco duro
    dbRidePicUsers.findOne({ usuario: usuario }, (err, usuarioEncontrado) => {
        if (err) {
            console.error("[BD ERROR] Error al buscar usuario en login:", err);
            return res.status(500).json({ error: "Error interno del servidor." });
        }

        // Si el usuario no existe o la contraseña no coincide
        if (!usuarioEncontrado || usuarioEncontrado.password !== password) {
            return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
        }

        console.log(`[LOGIN ÉXITO] Sesión iniciada para: ${usuario}`);
        return res.status(200).json({ 
            mensaje: "Inicio de sesión exitoso",
            usuario: usuarioEncontrado.usuario 
        });
    });
});

// Levantar el servidor en el puerto 3000
const PORT = 3000;
const server = app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(` Servidor de RidePic corriendo en http://localhost:${PORT}`);
    console.log(` Base de datos activa: ridepicusers.db`);
    console.log(`==================================================`);
});

// Capturar error si el puerto ya está en uso
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`\n[ERROR] El puerto ${PORT} ya está ocupado por otro proceso.`);
    } else {
        console.error(`[ERROR] Ocurrió un fallo al levantar el servidor:`, err);
    }
});