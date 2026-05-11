// Funciones para el login y registro



function login(){
    const usuario = document.getElementById("loginUsuario").value;
    const password = document.getElementById("loginPassword").value;

    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

    const encontrado = usuarios.find(u =>
        u.usuario === usuario && u.password === password
    );

    if(encontrado){
        localStorage.setItem("sesion", usuario);

        document.getElementById("pantallaLogin").style.display = "none";
        document.getElementById("app").style.display = "block";
        document.getElementById("nombreHeader").textContent = usuario;

    }else{
        alert("Usuario incorrecto ");
    }
}

function registrar(){
    const usuario = document.getElementById("loginUsuario").value;
    const password = document.getElementById("loginPassword").value;

    if(!usuario || !password){
        alert("Llena los campos");
        return;
    }

    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

    if(usuarios.find(u => u.usuario === usuario)){
        alert("Ese usuario ya existe");
        return;
    }

    usuarios.push({usuario, password});
    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    alert("Registrado correctamente ");
}


// Funciones para el manejo de publicaciones






// ================= SUBIR =================
function abrirSubida(){
    const input = document.getElementById("inputImagen");

    if(!input){
        console.error("No existe inputImagen ❌");
        return;
    }

    input.click();
}

// Esperar a que cargue todo
window.addEventListener("load", () => {

    const input = document.getElementById("inputImagen");

    if(!input){
        console.error("inputImagen no encontrado ❌");
        return;
    }

    input.addEventListener("change", function(){

        console.log("Archivo seleccionado ");

        const archivo = this.files[0];
        if(!archivo){
            console.log("No se seleccionó nada");
            return;
        }

        const lector = new FileReader();

        lector.onload = function(e){

            console.log("Imagen convertida ");

            const usuario = localStorage.getItem("sesion");

            if(!usuario){
                alert("No hay sesión activa ");
                return;
            }

            let posts = JSON.parse(localStorage.getItem("posts")) || [];

            posts.push({
                usuario: usuario,
                imagen: e.target.result,
                fecha: new Date().toLocaleString()
            });

            localStorage.setItem("posts", JSON.stringify(posts));

            console.log("Guardado en localStorage ");

            mostrarPublicaciones();
        }

        lector.readAsDataURL(archivo);
    });

});