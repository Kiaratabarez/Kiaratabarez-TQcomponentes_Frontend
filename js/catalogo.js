document.addEventListener("DOMContentLoaded", () => {
const tabla = document.querySelector("#tabla-productos tbody");
const filas = Array.from(tabla.querySelectorAll("tr"));
const filtro = document.getElementById("categoria");
const orden = document.getElementById("orden");

// 🔹 Filtrar por categoría
filtro.addEventListener("change", () => {
const categoria = filtro.value;
filas.forEach(fila => {
    const cat = fila.cells[4].textContent.trim();
    fila.style.display = (categoria === "todas" || cat === categoria) ? "" : "none";
});
});

// 🔹 Ordenar alfabéticamente por nombre
orden.addEventListener("change", () => {
const tipo = orden.value;
const ordenadas = [...filas].sort((a, b) => {
    const nombreA = a.cells[1].textContent.toLowerCase();
    const nombreB = b.cells[1].textContent.toLowerCase();
    return tipo === "nombre-asc"
    ? nombreA.localeCompare(nombreB)
    : nombreB.localeCompare(nombreA);
});
tabla.innerHTML = "";
ordenadas.forEach(f => tabla.appendChild(f));
});
});