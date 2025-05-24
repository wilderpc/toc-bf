document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById("modalProyecto");
  const abrir = document.querySelector(".create-button");
  const cerrar = document.getElementById("cerrarModal");
  const cancelar = document.getElementById("cancelarBtn");
  const crearBtn = document.getElementById("crearBtn");
  const form = document.getElementById("formProyecto");
  const tabla = document.querySelector(".project-table");

  let modoEdicion = false;
  let idProyectoEditando = null;

  abrir.addEventListener("click", () => {
    abrirModal();
  });

  cerrar.addEventListener("click", cerrarModal);
  cancelar.addEventListener("click", cerrarModal);

  window.addEventListener("click", (event) => {
    if (event.target === modal) cerrarModal();
  });

  form.addEventListener("input", () => {
    const nombre = form.querySelector('input[type="text"]');
    crearBtn.disabled = nombre.value.trim() === "";
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const [nombre, numero] = form.querySelectorAll("input");
    const [cuenta, tipo] = form.querySelectorAll("select");

    const datos = {
      nombre: nombre.value,
      numero: numero.value,
      cuenta: cuenta.value,
      tipo: tipo.value,
      fecha: new Date().toLocaleDateString()
    };

    if (modoEdicion) {
      datos.id = idProyectoEditando;
      actualizarProyecto(datos);
    } else {
      datos.id = Date.now();
      guardarProyecto(datos);
      agregarFila(datos);
    }

    cerrarModal();
    form.reset();
    crearBtn.disabled = true;
  });

  function abrirModal(proyecto = null) {
    modal.style.display = "block";
    if (proyecto) {
      const [nombre, numero] = form.querySelectorAll("input");
      const [cuenta, tipo] = form.querySelectorAll("select");

      nombre.value = proyecto.nombre;
      numero.value = proyecto.numero;
      cuenta.value = proyecto.cuenta;
      tipo.value = proyecto.tipo;

      crearBtn.textContent = "Guardar cambios";
      modoEdicion = true;
      idProyectoEditando = proyecto.id;
    } else {
      crearBtn.textContent = "Crear proyecto";
      modoEdicion = false;
      idProyectoEditando = null;
    }
  }

  function cerrarModal() {
    modal.style.display = "none";
    form.reset();
    crearBtn.disabled = true;
    crearBtn.textContent = "Crear proyecto";
    modoEdicion = false;
  }

  function agregarFila(proyecto) {
    const fila = document.createElement("tr");
    fila.setAttribute("data-id", proyecto.id);

    fila.innerHTML = `
      <td><img src="Icon/edificio.png" width="20"/></td>
      <td>${proyecto.nombre}<br><span class="sub">${proyecto.tipo}</span></td>
      <td>${proyecto.numero}</td>
      <td><span class="access">Build</span></td>
      <td>${proyecto.cuenta}</td>
      <td>${proyecto.fecha}</td>
      <td>
        <button class="edit-btn">✏️</button>
        <button class="delete-btn">🗑️</button>
      </td>
    `;
    tabla.appendChild(fila);

    fila.querySelector(".delete-btn").addEventListener("click", () => {
      eliminarProyecto(proyecto.id);
    });

    fila.querySelector(".edit-btn").addEventListener("click", () => {
      abrirModal(proyecto);
    });
  }

  function guardarProyecto(proyecto) {
    const proyectos = JSON.parse(localStorage.getItem("proyectos")) || [];
    proyectos.push(proyecto);
    localStorage.setItem("proyectos", JSON.stringify(proyectos));
  }

  function actualizarProyecto(proyectoActualizado) {
    let proyectos = JSON.parse(localStorage.getItem("proyectos")) || [];

    proyectos = proyectos.map(p => p.id === proyectoActualizado.id ? proyectoActualizado : p);
    localStorage.setItem("proyectos", JSON.stringify(proyectos));

    // Actualiza visualmente la fila
    const fila = tabla.querySelector(`tr[data-id="${proyectoActualizado.id}"]`);
    if (fila) {
      fila.children[1].innerHTML = `${proyectoActualizado.nombre}<br><span class="sub">${proyectoActualizado.tipo}</span>`;
      fila.children[2].textContent = proyectoActualizado.numero;
      fila.children[4].textContent = proyectoActualizado.cuenta;
    }
  }


let idPendienteEliminar = null;

function eliminarProyecto(id) {
  idPendienteEliminar = id;
  document.getElementById("confirmModal").style.display = "block";
}

document.getElementById("cerrarConfirm").onclick = () => {
  document.getElementById("confirmModal").style.display = "none";
  idPendienteEliminar = null;
};

document.getElementById("cancelarEliminar").onclick = () => {
  document.getElementById("confirmModal").style.display = "none";
  idPendienteEliminar = null;
};

document.getElementById("confirmarEliminar").onclick = () => {
  const fila = tabla.querySelector(`tr[data-id="${idPendienteEliminar}"]`);
  if (fila) fila.remove();

  let proyectos = JSON.parse(localStorage.getItem("proyectos")) || [];
  proyectos = proyectos.filter(p => p.id !== idPendienteEliminar);
  localStorage.setItem("proyectos", JSON.stringify(proyectos));

  document.getElementById("confirmModal").style.display = "none";
  idPendienteEliminar = null;
};



  function cargarProyectos() {
    const proyectos = JSON.parse(localStorage.getItem("proyectos")) || [];
    proyectos.forEach(agregarFila);
  }

  cargarProyectos();


//Inicio buscador de proyectos.

buscador.addEventListener("input", () => {
  const texto = buscador.value.toLowerCase();
  const filas = tabla.querySelectorAll("tr");

  filas.forEach(fila => {
    const nombre = fila.children[1]?.textContent.toLowerCase();
    if (!nombre) return;

    fila.style.display = nombre.includes(texto) ? "" : "none";
  });
});

ordenarBtn.addEventListener("click", () => {
  const proyectos = JSON.parse(localStorage.getItem("proyectos")) || [];

  proyectos.sort((a, b) => {
    return ordenAscendente
      ? a.nombre.localeCompare(b.nombre)
      : b.nombre.localeCompare(a.nombre);
  });

  ordenAscendente = !ordenAscendente;
  ordenarBtn.textContent = ordenAscendente ? "Ordenar A-Z" : "Ordenar Z-A";

  // Limpiar y reinsertar en la tabla
  tabla.innerHTML = `
    <tr>
      <th></th><th>Nombre</th><th>N°</th><th>Acceso</th><th>Cuenta</th><th>Fecha</th><th>Acciones</th>
    </tr>
  `;
  proyectos.forEach(agregarFila);
});

//Fin buscador de proyectos.


});

const buscador = document.getElementById("buscador");
const ordenarBtn = document.getElementById("ordenarBtn");
let ordenAscendente = true;