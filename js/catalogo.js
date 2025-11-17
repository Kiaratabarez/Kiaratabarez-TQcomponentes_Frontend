document.addEventListener("DOMContentLoaded", () => {
const tabla = document.querySelector("#tabla-productos tbody");
const filtro = document.getElementById("categoria");
const orden = document.getElementById("orden");

//si no aparece una tabla se sale 
if (!tabla) return;
const filas = Array.from(tabla.querySelectorAll("tr"));

//Filtra por categoría
filtro.addEventListener("change", () => {
const categoria = filtro.value;
filas.forEach(fila => {
    const cat = fila.cells[4].textContent.trim();
    fila.style.display = (categoria === "todas" || cat === categoria) ? "" : "none";
});
});

// Ordena alfabéticamente por nombre.
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