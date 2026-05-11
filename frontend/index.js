const API_URL = "http://localhost:3000";

// FUNCIÓN PARA REGISTRARSE
async function registrar() {
    const usuario = document.getElementById("loginUsuario").value;
    const password = document.getElementById("loginPassword").value;

    const respuesta = await fetch(`${API_URL}/registrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, password })
    });

    const resultado = await respuesta.json();
    alert(resultado.mensaje);
}

// FUNCIÓN PARA ENTRAR (LOGIN)
async function login() {
    const usuario = document.getElementById("loginUsuario").value;
    const password = document.getElementById("loginPassword").value;

    const respuesta = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, password })
    });

    const datos = await respuesta.json();

    if (respuesta.ok) {
        localStorage.setItem("sesion", datos.usuario);
        document.getElementById("pantallaLogin").style.display = "none";
        document.getElementById("app").style.display = "block";
        document.getElementById("nombreHeader").textContent = datos.usuario;
        mostrarPublicaciones();
    } else {
        alert(datos.mensaje);
    }
}

// FUNCIÓN PARA MOSTRAR LAS FOTOS DESDE EL SERVIDOR
async function mostrarPublicaciones() {
    const galeria = document.querySelector(".galeria");
    const respuesta = await fetch(`${API_URL}/galeria`);
    const posts = await respuesta.json();

    galeria.innerHTML = "";
    posts.forEach(post => {
        galeria.innerHTML += `
            <div class="tarjeta">
                <div class="tarjeta-imagen"><img src="${post.imagen}"></div>
                <div class="tarjeta-contenido">
                    <div class="nombre-usuario">${post.usuario}</div>
                </div>
            </div>`;
    });
}

// LÓGICA PARA SUBIR LA FOTO (BOTÓN "SUBIR")
function abrirSubida() { document.getElementById("inputImagen").click(); }

window.addEventListener("load", () => {
    document.getElementById("inputImagen").addEventListener("change", function() {
        const lector = new FileReader();
        lector.onload = async (e) => {
            const usuario = localStorage.getItem("sesion");
            await fetch(`${API_URL}/publicar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuario, imagen: e.target.result })
            });
            mostrarPublicaciones();
        };
        lector.readAsDataURL(this.files[0]);
    });
});