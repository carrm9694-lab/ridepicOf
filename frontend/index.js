// ==========================================================================
// 1. FUNCIONES AUXILIARES PARA MENSAJES ESTÉTICOS Y PERFIL
// ==========================================================================

/**
 * Muestra un mensaje temporal de error o éxito en la interfaz de usuario.
 * @param {string} texto - El mensaje que se va a mostrar.
 * @param {string} [tipo="error"] - El tipo de mensaje ("error" o "exito").
 */
function mostrarMensaje(texto, tipo = "error") {
    const contenedorError = document.getElementById("mensajeError");
    if (!contenedorError) return;

    contenedorError.textContent = texto;
    contenedorError.style.display = "block";

    if (tipo === "error") {
        contenedorError.style.background = "rgba(255, 77, 77, 0.1)";
        contenedorError.style.borderColor = "rgba(255, 77, 77, 0.3)";
        contenedorError.style.color = "#ff4d4d";
    } else if (tipo === "exito") {
        contenedorError.style.background = "rgba(77, 255, 77, 0.1)";
        contenedorError.style.borderColor = "rgba(77, 255, 77, 0.3)";
        contenedorError.style.color = "#4dff4d";
    }

    setTimeout(() => {
        contenedorError.style.display = "none";
    }, 4000);
}

/**
 * Dispara el evento de clic en el input de archivo oculto para cambiar la foto de perfil.
 */
function cambiarFotoPerfil() {
    const input = document.getElementById('inputFotoPerfil');
    if (input) input.click();
}

/**
 * Actualiza la imagen de fondo del avatar del usuario en la interfaz.
 * @param {string|null} source - La cadena Base64 o URL de la imagen de origen.
 */
function actualizarFotoPerfilVista(source) {
    const avatar = document.querySelector('.avatar');
    if (!avatar) return;
    if (source) {
        avatar.style.backgroundImage = `url(${source})`;
        avatar.style.backgroundSize = 'cover';
        avatar.style.backgroundPosition = 'center';
    } else {
        avatar.style.backgroundImage = 'none';
    }
}

/**
 * Alterna la visibilidad del menú de opciones de la foto de perfil.
 */
function toggleMenuPerfil(event) {
    if (event) event.stopPropagation(); // Evita que el clic cierre el menú inmediatamente
    const menu = document.getElementById("menuPerfilOpciones");
    if (!menu) return;

    if (menu.style.display === "block") {
        menu.style.display = "none";
    } else {
        menu.style.display = "block";
    }
}

/**
 * Cierra la sesión activa borrando el localStorage y mandando al usuario al login.
 */
function cerrarSesion() {
    localStorage.removeItem("sesion");

    const menu = document.getElementById("menuPerfilOpciones");
    if (menu) menu.style.display = "none";

    // Ocultar la app y mostrar pantalla de login/registro
    document.getElementById("app").style.display = "none";
    document.getElementById("pantallaLogin").style.display = "flex";

    // Resetear textos visuales
    document.getElementById("nombreHeader").textContent = "...";
    actualizarFotoPerfilVista(null);

    mostrarMensaje("Sesión cerrada correctamente", "exito");
}

// Escuchador global para cerrar el menú si se hace clic fuera de él
document.addEventListener("click", () => {
    const menu = document.getElementById("menuPerfilOpciones");
    if (menu) menu.style.display = "none";
});

// ==========================================================================
// PODIO DINÁMICO: 3 FOTOS CON MÁS LIKES (Global)
// ==========================================================================

/**
 * Genera y actualiza dinámicamente el podio con las 3 publicaciones con más likes.
 */
function actualizarPodio() {
    const contenedorPodio = document.getElementById("contenedorPodio");
    if (!contenedorPodio) return;

    let posts = JSON.parse(localStorage.getItem("posts")) || [];
    
    if (posts.length === 0) {
        contenedorPodio.innerHTML = `<p style="color: #aaa; text-align: center; width: 100%; padding: 10px;">Aún no hay fotos para armar el podio.</p>`;
        return;
    }

    let ordenados = [...posts].sort((a, b) => (b.likes || 0) - (a.likes || 0));
    let top3 = ordenados.slice(0, 3);
    
    contenedorPodio.innerHTML = "";

    top3.forEach((post, i) => {
        const tarjetaPodio = document.createElement("div");
        tarjetaPodio.className = `tarjeta-podio lugar-${i + 1}`; 
        
        let puestoStyle = "";
        if (i === 0) puestoStyle = '<span class="puesto p1">1° Lugar</span>';
        if (i === 1) puestoStyle = '<span class="puesto p2">2° Lugar</span>';
        if (i === 2) puestoStyle = '<span class="puesto p3">3° Lugar</span>';

        tarjetaPodio.innerHTML = `
            <img src="${post.imagen}" alt="Top ${i+1}">
            <div style="font-size: 11px; font-weight: bold; margin-top: 3px; color: #fff;">@${post.usuario}</div>
            <div style="font-size: 10px; color: #ff4d4d; margin-bottom: 5px;">Likes: ${post.likes || 0}</div>
            ${puestoStyle}
        `;
        contenedorPodio.appendChild(tarjetaPodio);
    });
}

// ==========================================================================
// 2. LÓGICA DE INICIO DE SESIÓN Y REGISTRO (CON SERVIDOR FÍSICO)
// ==========================================================================

/**
 * Autentica al usuario haciendo una petición POST al servidor.
 */
async function login() {
    const usuario = document.getElementById("loginUsuario").value.trim();
    const password = document.getElementById("loginPassword").value;

    if (!usuario || !password) {
        mostrarMensaje("Por favor, llena todos los campos", "error");
        return;
    }

    try {
        const respuesta = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ usuario, password })
        });

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            mostrarMensaje(resultado.error || "Usuario o contraseña incorrectos", "error");
            return;
        }

        localStorage.setItem("sesion", resultado.usuario);

        document.getElementById("pantallaLogin").style.display = "none";
        document.getElementById("app").style.display = "block";
        document.getElementById("nombreHeader").textContent = resultado.usuario;

        const contenedorError = document.getElementById("mensajeError");
        if (contenedorError) contenedorError.style.display = "none";

        const fotoGuardada = localStorage.getItem(`fotoPerfil_${resultado.usuario}`);
        actualizarFotoPerfilVista(fotoGuardada);

        mostrarPublicaciones();
        actualizarPodio();

    } catch (error) {
        console.error("Error en login:", error);
        mostrarMensaje("No se pudo conectar con el servidor.", "error");
    }
}

/**
 * Registra un nuevo usuario guardándolo físicamente en el disco del servidor.
 */
async function registrar() {
    const usuario = document.getElementById("loginUsuario").value.trim();
    const password = document.getElementById("loginPassword").value;

    if (!usuario || !password) {
        mostrarMensaje("Por favor, llena todos los campos", "error");
        return;
    }

    try {
        const respuesta = await fetch("http://localhost:3000/registrar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ usuario, password })
        });

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            mostrarMensaje(resultado.error || "Error al registrar", "error");
            return;
        }

        mostrarMensaje("Registrado con éxito. Ya puedes iniciar sesión", "exito");
        document.getElementById("loginUsuario").value = "";
        document.getElementById("loginPassword").value = "";

    } catch (error) {
        console.error("Error en registro:", error);
        mostrarMensaje("No se pudo conectar con el servidor.", "error");
    }
}

// ==========================================================================
// 3. SECCIÓN DE PUBLICACIONES, LIKES, COMENTARIOS Y BORRADO
// ==========================================================================

function abrirSubida(){
    const input = document.getElementById("inputImagen");
    if(input) input.click();
}

function mostrarPublicaciones(filtroUsuario = "") {
    const contenedorGaleria = document.querySelector(".galeria");
    if(!contenedorGaleria) return;

    contenedorGaleria.innerHTML = "";
    let posts = JSON.parse(localStorage.getItem("posts")) || [];
    const usuarioActivo = localStorage.getItem("sesion");

    if (filtroUsuario !== "") {
        posts = posts.filter(post => 
            post.usuario.toLowerCase().includes(filtroUsuario.toLowerCase())
        );
    }

    if(posts.length === 0) {
        contenedorGaleria.innerHTML = `<p style="color: #aaa; grid-column: 1/-1; text-align: center; padding: 20px;">No se encontraron publicaciones.</p>`;
        return;
    }

    let postsOriginales = JSON.parse(localStorage.getItem("posts")) || [];

    posts.slice().reverse().forEach((post) => {
        const index = postsOriginales.findIndex(p => p.fecha === post.fecha && p.usuario === post.usuario);

        let comentariosHTML = "";
        if(post.comentarios && post.comentarios.length > 0) {
            post.comentarios.forEach(com => {
                comentariosHTML += `
                    <div class="comentario-item">
                        <strong>@${com.usuario}:</strong> ${com.texto}
                    </div>
                `;
            });
        }

        let botonBorrarHTML = "";
        if(post.usuario === usuarioActivo) {
            botonBorrarHTML = `
                <button style="width: 100%; padding: 6px; margin-top: 10px; border: none; border-radius: 6px; background: #ff4d4d; color: white; cursor: pointer; font-size: 11px; font-weight: bold;" onclick="borrarPost(${index})">
                    Eliminar Publicación
                </button>
            `;
        }

        const tarjeta = document.createElement("div");
        tarjeta.className = "tarjeta";
        tarjeta.innerHTML = `
            <div class="tarjeta-imagen">
                <img src="${post.imagen}" alt="Foto de @${post.usuario}">
            </div>
            <div class="tarjeta-contenido">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <strong style="color: black;">@${post.usuario}</strong>
                    <button class="btn-like" onclick="darLike(${index})">
                        Me gusta: <span>${post.likes || 0}</span>
                    </button>
                </div>
                <div style="font-size: 11px; color: #888; text-align: left; margin-top: 4px;">${post.fecha}</div>
                
                <div class="seccion-comentarios">
                    <div class="lista-comentarios">${comentariosHTML}</div>
                    <div class="caja-comentario">
                        <input type="text" id="inputComentario-${index}" placeholder="Escribe un comentario...">
                        <button onclick="agregarComentario(${index})">Enviar</button>
                    </div>
                </div>
                ${botonBorrarHTML}
            </div>
        `;
        contenedorGaleria.appendChild(tarjeta);
    });
}

function filtrarUsuarios() {
    const textoBusqueda = document.getElementById("inputBuscar").value;
    mostrarPublicaciones(textoBusqueda);
}

function darLike(index) {
    let posts = JSON.parse(localStorage.getItem("posts")) || [];
    if(!posts[index].likes) posts[index].likes = 0;
    posts[index].likes += 1;
    
    localStorage.setItem("posts", JSON.stringify(posts));
    
    const textoBusqueda = document.getElementById("inputBuscar") ? document.getElementById("inputBuscar").value : "";
    mostrarPublicaciones(textoBusqueda);
    actualizarPodio(); 
}

function agregarComentario(index) {
    const input = document.getElementById(`inputComentario-${index}`);
    if(!input || !input.value.trim()) return;

    const usuarioActivo = localStorage.getItem("sesion") || "Anonimo";
    let posts = JSON.parse(localStorage.getItem("posts")) || [];

    if(!posts[index].comentarios) posts[index].comentarios = [];

    posts[index].comentarios.push({
        usuario: usuarioActivo,
        texto: input.value.trim()
    });

    localStorage.setItem("posts", JSON.stringify(posts));
    
    const textoBusqueda = document.getElementById("inputBuscar") ? document.getElementById("inputBuscar").value : "";
    mostrarPublicaciones(textoBusqueda);
}

function borrarPost(index) {
    let posts = JSON.parse(localStorage.getItem("posts")) || [];
    posts.splice(index, 1);
    localStorage.setItem("posts", JSON.stringify(posts));
    
    mostrarMensaje("Publicación eliminada", "exito");

    const textoBusqueda = document.getElementById("inputBuscar") ? document.getElementById("inputBuscar").value : "";
    mostrarPublicaciones(textoBusqueda);
    actualizarPodio(); 
}

// ==========================================================================
// 4. LOGICA GENERADOR DE CARTAS HOT WHEELS
// ==========================================================================

function generarCartaHotWheels() {
    const usuarioActivo = localStorage.getItem("sesion");
    if (!usuarioActivo) {
        mostrarMensaje("Por favor, inicia sesión primero", "error");
        return;
    }

    let posts = JSON.parse(localStorage.getItem("posts")) || [];
    const postsDelUsuario = posts.filter(post => post.usuario === usuarioActivo);

    if (postsDelUsuario.length === 0) {
        mostrarMensaje("Sube al menos una foto para generar tu tarjeta Hot Wheels", "error");
        return;
    }

    const postMasLikes = postsDelUsuario.reduce((max, post) => 
        (post.likes || 0) > (max.likes || 0) ? post : max, postsDelUsuario[0]);

    document.getElementById('fotoCarroCarta').src = postMasLikes.imagen;
    document.getElementById('nombreUsuarioCarta').textContent = usuarioActivo;
    document.getElementById('modeloCarta').textContent = 'EDICIÓN ESPECIAL';

    document.getElementById('modalHotWheels').style.display = 'flex';
}

function cerrarModalHotWheels() {
    document.getElementById('modalHotWheels').style.display = 'none';
}

// ==========================================================================
// 5. INICIALIZADORES Y DETECTORES DE EVENTOS (LOAD)
// ==========================================================================

window.addEventListener("load", () => {
    const inputImagen = document.getElementById("inputImagen");
    if(inputImagen) {
        inputImagen.addEventListener("change", function(){
            const archivo = this.files[0];
            if(!archivo) return;

            const lector = new FileReader();
            lector.onload = function(e){
                const usuario = localStorage.getItem("sesion");
                if(!usuario) {
                     mostrarMensaje("Inicia sesión para subir fotos", "error");
                     return;
                }

                let posts = JSON.parse(localStorage.getItem("posts")) || [];
                posts.push({
                    usuario: usuario,
                    imagen: e.target.result,
                    fecha: new Date().toLocaleString(),
                    likes: 0,
                    comentarios: []
                });

                localStorage.setItem("posts", JSON.stringify(posts));
                mostrarMensaje("Foto subida con éxito", "exito");
                
                mostrarPublicaciones();
                actualizarPodio(); 
            }
            lector.readAsDataURL(archivo);
        });
    }

    const inputFotoPerfil = document.getElementById("inputFotoPerfil");
    if(inputFotoPerfil) {
        inputFotoPerfil.addEventListener("change", function(){
            const archivo = this.files[0];
            if(!archivo) return;

            const lector = new FileReader();
            lector.onload = function(e){
                const usuario = localStorage.getItem("sesion");
                if(!usuario) return;

                localStorage.setItem(`fotoPerfil_${usuario}`, e.target.result);
                actualizarFotoPerfilVista(e.target.result);
                mostrarMensaje("Foto de perfil actualizada", "exito");
            }
            lector.readAsDataURL(archivo);
        });
    }
});