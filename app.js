import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore, collection, setDoc, getDocs, doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAoivMmCg1sSS2WlZVge0W-RaOnj4FPNBc",
    authDomain: "stockessen-9c8c8.firebaseapp.com",
    projectId: "stockessen-9c8c8",
    storageBucket: "stockessen-9c8c8.firebasestorage.app",
    messagingSenderId: "311075502813",
    appId: "1:311075502813:web:cba56d0f6b3a48cd6b7934"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let productosCache = [];

class ProductoEssen {
    constructor(codigo, producto, linea, valorPuntos, stock) {
        this.id = Date.now().toString() + Math.random().toString().slice(2, 5);
        this.codigo = codigo;
        this.producto = producto;
        this.linea = linea;
        this.valorPuntos = valorPuntos || 0;
        this.stock = stock;
    }
}

class UI {
    static async inicializar() {
        const lista = document.querySelector('#producto-list');
        lista.innerHTML = '<tr><td colspan="6">Conectando a la base de datos en la nube... ☁️</td></tr>';

        await Datos.cargarInicialesBBDD();
        await UI.refrescarYMostrar();
    }

    static async refrescarYMostrar() {
        productosCache = await Datos.traerProductos();
        UI.renderizarTabla();
    }

    static renderizarTabla(filtro = '') {
        const lista = document.querySelector('#producto-list');
        lista.innerHTML = '';

        let filtrados = productosCache;

        if (filtro) {
            filtrados = filtrados.filter(p =>
                p.codigo.toLowerCase().includes(filtro.toLowerCase()) ||
                p.producto.toLowerCase().includes(filtro.toLowerCase()) ||
                p.linea.toLowerCase().includes(filtro.toLowerCase())
            );
        }

        // Dividir en grupos
        let principales = filtrados.filter(p => p.linea.toUpperCase() !== 'ACCESORIOS');
        let accesorios = filtrados.filter(p => p.linea.toUpperCase() === 'ACCESORIOS');

        // Leer estado de los botones de filtro
        const mostrarPrincipales = document.querySelector('#btnradio-principales').checked;
        const mostrarAccesorios = document.querySelector('#btnradio-accesorios').checked;

        // Ordenar por stock descendente
        principales.sort((a, b) => b.stock - a.stock);
        accesorios.sort((a, b) => b.stock - a.stock);

        let renderGroup = (grupo, titulo) => {
            if (grupo.length > 0) {
                const headerRow = document.createElement('tr');
                headerRow.innerHTML = `<td colspan="6" style="background-color: rgba(35, 213, 171, 0.1); color: #23d5ab; letter-spacing: 2px;" class="fw-bold text-uppercase py-3">${titulo}</td>`;
                lista.appendChild(headerRow);

                let counterStock = 0;
                grupo.forEach(producto => {
                    let rowClass = "";
                    if (producto.stock == 0) {
                        rowClass = "row-sin-stock";
                    } else {
                        rowClass = counterStock % 2 === 0 ? "row-con-stock-par" : "row-con-stock-impar";
                        counterStock++;
                    }
                    UI.agregarProductoALista(producto, rowClass);
                });
            }
        };

        if (mostrarPrincipales) {
            renderGroup(principales, "🥘 LÍNEAS PRINCIPALES");
        }

        if (mostrarAccesorios) {
            renderGroup(accesorios, "⚡ ACCESORIOS");
        }
    }

    static agregarProductoALista(producto, rowClass = "") {
        const lista = document.querySelector('#producto-list');
        const fila = document.createElement('tr');
        if (rowClass) fila.className = rowClass;

        fila.innerHTML = `
        <td>${producto.codigo}</td>
        <td>${producto.producto}</td>
        <td>${producto.linea}</td>
        <td>${producto.valorPuntos}</td>
        <td class="text-nowrap">
            <button class="btn btn-sm btn-outline-secondary decrease-stock" data-id="${producto.id}">-</button>
            <span class="mx-2 stock-value">${producto.stock}</span>
            <button class="btn btn-sm btn-outline-secondary increase-stock" data-id="${producto.id}">+</button>
        </td>
        <td class="text-nowrap">
            <button class="btn btn-info btn-sm edit me-1" data-id="${producto.id}">✏️</button>
            <button class="btn btn-delete btn-sm delete" data-id="${producto.id}">X</button>
        </td>
        `;
        lista.appendChild(fila);
    }

    static mostrarAlerta(mensaje, className) {
        const div = document.createElement('div');
        div.className = `alert alert-${className}`;
        div.appendChild(document.createTextNode(mensaje));

        const container = document.querySelector('.main-container');
        const form = document.querySelector('#producto-form');
        container.insertBefore(div, form);

        setTimeout(() => document.querySelector('.alert')?.remove(), 3000);
    }

    static cargarProductoEnFormulario(id) {
        const producto = productosCache.find(p => p.id === id);

        if (producto) {
            document.querySelector('#edit-id').value = producto.id;
            document.querySelector('#codigo').value = producto.codigo;
            document.querySelector('#producto').value = producto.producto;
            document.querySelector('#linea').value = producto.linea;
            document.querySelector('#valorPuntos').value = producto.valorPuntos;
            document.querySelector('#stock').value = producto.stock;

            document.querySelector('#submit-btn').value = 'Guardar Cambios';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    static limpiarCampos() {
        document.querySelector('#codigo').value = '';
        document.querySelector('#producto').value = '';
        document.querySelector('#linea').value = '';
        document.querySelector('#valorPuntos').value = '';
        document.querySelector('#stock').value = '';
        document.querySelector('#edit-id').value = '';
        document.querySelector('#submit-btn').value = 'Agregar Producto';
    }

    static botonDeCarga(habilitar) {
        const btn = document.querySelector('#submit-btn');
        if (habilitar) {
            btn.disabled = false;
            btn.value = document.querySelector('#edit-id').value ? 'Guardar Cambios' : 'Agregar Producto';
        } else {
            btn.disabled = true;
            btn.value = 'Guardando...';
        }
    }
}

class Datos {
    static async traerProductos() {
        const querySnapshot = await getDocs(collection(db, "productos"));
        let productos = [];
        querySnapshot.forEach((doc) => {
            productos.push(doc.data());
        });
        return productos;
    }

    static async agregarProducto(producto) {
        // En Firestore usamos el ID que generamos como nombre del documento
        await setDoc(doc(db, "productos", producto.id), Object.assign({}, producto));
    }

    static async removerProducto(id) {
        await deleteDoc(doc(db, "productos", id));
    }

    static async actualizarProducto(productoActualizado) {
        await updateDoc(doc(db, "productos", productoActualizado.id), Object.assign({}, productoActualizado));
    }

    static async cargarInicialesBBDD() {
        const snapshot = await getDocs(collection(db, "productos"));

        if (snapshot.empty) {
            const existentes = [];

            const iniciales = [
                // LINEA AQUA
                { codigo: "3018", producto: "Cacerola 3018", linea: "LINEA AQUA", valorPuntos: 0, stock: 2 },
                { codigo: "2020", producto: "Cacerola 2020", linea: "LINEA AQUA", valorPuntos: 0, stock: 2 },
                { codigo: "4024", producto: "Sartén 4024", linea: "LINEA AQUA", valorPuntos: 0, stock: 3 },
                { codigo: "-", producto: "Cuadrada 31", linea: "LINEA AQUA", valorPuntos: 0, stock: 1 },
                { codigo: "-", producto: "Bifera Rec", linea: "LINEA AQUA", valorPuntos: 0, stock: 2 },
                { codigo: "-", producto: "Rectangular", linea: "LINEA AQUA", valorPuntos: 0, stock: 2 },
                // LINEA TERRA
                { codigo: "3018", producto: "3018 c/asas", linea: "LINEA TERRA", valorPuntos: 0, stock: 1 },
                { codigo: "3018", producto: "Cacerola 3018", linea: "LINEA TERRA", valorPuntos: 0, stock: 4 },
                { codigo: "2020", producto: "Cacerola 2020", linea: "LINEA TERRA", valorPuntos: 0, stock: 2 },
                { codigo: "2024", producto: "Cacerola 2024", linea: "LINEA TERRA", valorPuntos: 0, stock: 2 },
                { codigo: "2028", producto: "Cacerola 2028", linea: "LINEA TERRA", valorPuntos: 0, stock: 1 },
                { codigo: "4024", producto: "Sartén 4024", linea: "LINEA TERRA", valorPuntos: 0, stock: 3 },
                { codigo: "4028", producto: "Sartén 4028", linea: "LINEA TERRA", valorPuntos: 0, stock: 1 },
                { codigo: "6030", producto: "Paellera 6030", linea: "LINEA TERRA", valorPuntos: 0, stock: 1 },
                { codigo: "-", producto: "Bifera Rectang", linea: "LINEA TERRA", valorPuntos: 0, stock: 4 },
                { codigo: "-", producto: "Cuadrada 31 cms", linea: "LINEA TERRA", valorPuntos: 0, stock: 1 },
                { codigo: "-", producto: "Cuadrada 24 cms", linea: "LINEA TERRA", valorPuntos: 0, stock: 1 },
                { codigo: "-", producto: "Rectangular", linea: "LINEA TERRA", valorPuntos: 0, stock: 1 },
                { codigo: "-", producto: "Flip", linea: "LINEA TERRA", valorPuntos: 0, stock: 1 },
                { codigo: "-", producto: "Sarten Chef Nuevo", linea: "LINEA TERRA", valorPuntos: 0, stock: 1 },
                { codigo: "-", producto: "Sarten Expres", linea: "LINEA TERRA", valorPuntos: 0, stock: 1 },
                { codigo: "-", producto: "Jarro Quick", linea: "LINEA TERRA", valorPuntos: 0, stock: 2 },
                // LINEA MARSALA
                { codigo: "3018", producto: "Cacerola 3018", linea: "LINEA MARSALA", valorPuntos: 0, stock: 1 },
                { codigo: "6030", producto: "6030 Sin Anti", linea: "LINEA MARSALA", valorPuntos: 0, stock: 1 },
                { codigo: "7030", producto: "Producto 7030", linea: "LINEA MARSALA", valorPuntos: 0, stock: 1 },
                { codigo: "-", producto: "Bifera c/Mango", linea: "LINEA MARSALA", valorPuntos: 0, stock: 2 },
                { codigo: "-", producto: "Bifera Simple", linea: "LINEA MARSALA", valorPuntos: 0, stock: 2 },
                // CAPRI
                { codigo: "3018", producto: "3018 C/MAN", linea: "CAPRI", valorPuntos: 0, stock: 1 },
                { codigo: "2024", producto: "Cacerola 2024", linea: "CAPRI", valorPuntos: 0, stock: 0 },
                { codigo: "2028", producto: "Cacerola 2028", linea: "CAPRI", valorPuntos: 0, stock: 1 },
                { codigo: "4024", producto: "Sartén 4024", linea: "CAPRI", valorPuntos: 0, stock: 2 },
                { codigo: "4028", producto: "Sartén 4028", linea: "CAPRI", valorPuntos: 0, stock: 1 },
                { codigo: "4033", producto: "4033 8 L", linea: "CAPRI", valorPuntos: 0, stock: 1 },
                { codigo: "-", producto: "FLIP", linea: "CAPRI", valorPuntos: 0, stock: 1 },
                { codigo: "6030", producto: "Paellera 6030", linea: "CAPRI", valorPuntos: 0, stock: 1 },
                // LINEA ROSA
                { codigo: "4024", producto: "Sartén 4024", linea: "LINEA ROSA", valorPuntos: 0, stock: 2 },
                { codigo: "4024", producto: "Sartén 4024 T/V", linea: "LINEA ROSA", valorPuntos: 0, stock: 1 },
                { codigo: "4028", producto: "Sartén 4028", linea: "LINEA ROSA", valorPuntos: 0, stock: 1 },
                { codigo: "-", producto: "DISCO", linea: "LINEA ROSA", valorPuntos: 0, stock: 2 },
                { codigo: "-", producto: "SOPORTE", linea: "LINEA ROSA", valorPuntos: 0, stock: 2 },
                { codigo: "-", producto: "Grill", linea: "LINEA ROSA", valorPuntos: 0, stock: 1 },
                // LINEA GRANITO
                { codigo: "-", producto: "WOK de 30 c", linea: "LINEA GRANITO", valorPuntos: 0, stock: 2 },
                { codigo: "-", producto: "Tapas", linea: "LINEA GRANITO", valorPuntos: 0, stock: 2 },
                // COMPLEMENTOS
                { codigo: "-", producto: "Savarin 18", linea: "COMPLEMENTOS", valorPuntos: 0, stock: 2 },
                { codigo: "-", producto: "Savarin 24", linea: "COMPLEMENTOS", valorPuntos: 0, stock: 4 },
                { codigo: "-", producto: "Savarin 28", linea: "COMPLEMENTOS", valorPuntos: 0, stock: 1 },
                { codigo: "-", producto: "Savarin 30", linea: "COMPLEMENTOS", valorPuntos: 0, stock: 3 },
                { codigo: "-", producto: "Vapo 18 a 28", linea: "COMPLEMENTOS", valorPuntos: 0, stock: 0 },
                { codigo: "-", producto: "Vapo 28 c", linea: "COMPLEMENTOS", valorPuntos: 0, stock: 1 },
                { codigo: "-", producto: "Budineras", linea: "COMPLEMENTOS", valorPuntos: 0, stock: 2 },
                // SET NUIT 28 cm
                { codigo: "-", producto: "Cac *Sart*bifera 24 cm", linea: "SET NUIT 28 CM", valorPuntos: 0, stock: 1 },
                { codigo: "-", producto: "Cacerola c/tapa", linea: "SET NUIT 28 CM", valorPuntos: 0, stock: 1 },
                { codigo: "-", producto: "Bifera", linea: "SET NUIT 28 CM", valorPuntos: 0, stock: 1 },
                { codigo: "-", producto: "Flif Nuit", linea: "SET NUIT 28 CM", valorPuntos: 0, stock: 0 },
                // Linea Fuego
                { codigo: "3018", producto: "3018 c/asas", linea: "LINEA FUEGO", valorPuntos: 0, stock: 1 },
                { codigo: "3018", producto: "3018 c/mango", linea: "LINEA FUEGO", valorPuntos: 0, stock: 1 },
                // LINEA C/SENSOR
                { codigo: "-", producto: "Wok", linea: "LINEA C/SENSOR", valorPuntos: 0, stock: 2 },
                // Linea Cherry
                { codigo: "2024", producto: "Cacerola 2024", linea: "LINEA CHERRY", valorPuntos: 0, stock: 1 },
                { codigo: "4024", producto: "Sartén 4024", linea: "LINEA CHERRY", valorPuntos: 0, stock: 2 },
                // ACCESORIOS RECIEN AÑADIDOS
                { codigo: "-", producto: "Abrelatas 5 en 1", linea: "ACCESORIOS", valorPuntos: 0, stock: 0 },
                { codigo: "-", producto: "Abrelatas Blanco", linea: "ACCESORIOS", valorPuntos: 21, stock: 2 },
                { codigo: "-", producto: "Aros de Silicona Capri", linea: "CAPRI", valorPuntos: 0, stock: 1 },
                { codigo: "-", producto: "Asas Terras", linea: "LINEA TERRA", valorPuntos: 6, stock: 3 },
                { codigo: "-", producto: "Balanza digital dibujos", linea: "ACCESORIOS", valorPuntos: 32, stock: 3 },
                { codigo: "-", producto: "Batidor y espatula AQUA", linea: "LINEA AQUA", valorPuntos: 18, stock: 1 },
                { codigo: "-", producto: "Batidor y espatula terra", linea: "LINEA TERRA", valorPuntos: 18, stock: 2 },
                { codigo: "-", producto: "Bols de acero grande c/tapa", linea: "ACCESORIOS", valorPuntos: 0, stock: 1 },
                { codigo: "-", producto: "Bombillas", linea: "ACCESORIOS", valorPuntos: 7, stock: 4 },
                { codigo: "-", producto: "Bombilla Neo", linea: "ACCESORIOS", valorPuntos: 0, stock: 2 },
                { codigo: "-", producto: "Cernidor", linea: "ACCESORIOS", valorPuntos: 18, stock: 2 },
                { codigo: "-", producto: "Copetinero rosa", linea: "LINEA ROSA", valorPuntos: 0, stock: 1 },
                { codigo: "-", producto: "Colador solo el grande", linea: "ACCESORIOS", valorPuntos: 11, stock: 1 },
                { codigo: "-", producto: "Corta Pizza", linea: "ACCESORIOS", valorPuntos: 18, stock: 1 },
                { codigo: "-", producto: "Cuchara p/servir helados", linea: "ACCESORIOS", valorPuntos: 12, stock: 1 },
                { codigo: "-", producto: "Cuchillo Serrucho de Pan", linea: "ACCESORIOS", valorPuntos: 19, stock: 2 },
                { codigo: "-", producto: "Desmoldatorta", linea: "ACCESORIOS", valorPuntos: 37, stock: 1 },
                { codigo: "-", producto: "Estira Masa", linea: "ACCESORIOS", valorPuntos: 18, stock: 1 },
                { codigo: "-", producto: "Lim Abrillantador", linea: "ACCESORIOS", valorPuntos: 0, stock: 1 },
                { codigo: "-", producto: "Lim Desengrasante", linea: "ACCESORIOS", valorPuntos: 0, stock: 2 },
                { codigo: "-", producto: "Mandolina", linea: "ACCESORIOS", valorPuntos: 42, stock: 2 },
                { codigo: "-", producto: "Mate HERMETICO", linea: "ACCESORIOS", valorPuntos: 0, stock: 1 },
                { codigo: "-", producto: "Mate c/bombilla Neo Aqua", linea: "LINEA AQUA", valorPuntos: 23, stock: 3 },
                { codigo: "-", producto: "Mate c/bombilla Neo Nuit", linea: "NUIT", valorPuntos: 0, stock: 1 },
                { codigo: "-", producto: "Moldes p/Tartaletas x4", linea: "ACCESORIOS", valorPuntos: 11, stock: 1 },
                { codigo: "-", producto: "Molinillo de Especias tr. Tam", linea: "ACCESORIOS", valorPuntos: 35, stock: 5 },
                { codigo: "-", producto: "Multimixer", linea: "ACCESORIOS", valorPuntos: 0, stock: 1 },
                { codigo: "-", producto: "Pela Vegetal", linea: "ACCESORIOS", valorPuntos: 13, stock: 2 },
                { codigo: "-", producto: "Pincel de silicona AQUA", linea: "LINEA AQUA", valorPuntos: 0, stock: 1 },
                { codigo: "-", producto: "Posas pava", linea: "ACCESORIOS", valorPuntos: 0, stock: 2 },
                { codigo: "-", producto: "TERMOS", linea: "ACCESORIOS", valorPuntos: 0, stock: 1 },
                { codigo: "-", producto: "Rejilla desmolda Tortas", linea: "ACCESORIOS", valorPuntos: 37, stock: 1 },
                { codigo: "-", producto: "Repasador aqua", linea: "LINEA AQUA", valorPuntos: 0, stock: 2 },
                { codigo: "-", producto: "Repasador terra", linea: "LINEA TERRA", valorPuntos: 0, stock: 1 },
                { codigo: "-", producto: "Salero y pimentero", linea: "ACCESORIOS", valorPuntos: 22, stock: 1 },
                { codigo: "-", producto: "Set mate NUIT", linea: "NUIT", valorPuntos: 0, stock: 1 },
                { codigo: "-", producto: "Set de Cuchillas p/ car y verd", linea: "ACCESORIOS", valorPuntos: 37, stock: 2 },
                { codigo: "-", producto: "Set de Utensilios Color Marsala", linea: "LINEA MARSALA", valorPuntos: 0, stock: 3 },
                { codigo: "-", producto: "Set de utensillos Rosa", linea: "LINEA ROSA", valorPuntos: 0, stock: 1 },
                { codigo: "-", producto: "Set de utensillos terra", linea: "LINEA TERRA", valorPuntos: 0, stock: 3 },
                { codigo: "-", producto: "Set Utensilio B. Aqua", linea: "LINEA AQUA", valorPuntos: 0, stock: 3 },
                { codigo: "-", producto: "Set Utensilio B. me gus", linea: "ACCESORIOS", valorPuntos: 0, stock: 1 },
                { codigo: "-", producto: "Tabla de picar gris Chica20x30", linea: "ACCESORIOS", valorPuntos: 25, stock: 1 },
                { codigo: "-", producto: "Tabla picar beig grande35x20", linea: "ACCESORIOS", valorPuntos: 32, stock: 1 },
                { codigo: "-", producto: "Tarros de almacen apilables x3", linea: "ACCESORIOS", valorPuntos: 14, stock: 1 },
                { codigo: "-", producto: "Tazas Medidoras de alum.", linea: "ACCESORIOS", valorPuntos: 11, stock: 1 },
                { codigo: "-", producto: "Vaso Medidor", linea: "ACCESORIOS", valorPuntos: 16, stock: 1 },
                { codigo: "-", producto: "Vaso Termico", linea: "ACCESORIOS", valorPuntos: 0, stock: 0 },
                { codigo: "-", producto: "Afilador de cuchillos", linea: "ACCESORIOS", valorPuntos: 0, stock: 1 }
            ];

            // Promesas asincronicas para subir todos los productos mas rapido SOLO si no existen
            const promesas = [];
            iniciales.forEach(p => {
                // Buscamos si ya existe alguien con mismo Codigo y Producto para no sobrescribir su stock
                const yaExiste = existentes.some(ext => ext.codigo === p.codigo && ext.producto === p.producto);
                if (!yaExiste) {
                    const nuevo = new ProductoEssen(p.codigo, p.producto, p.linea, p.valorPuntos, p.stock);
                    promesas.push(setDoc(doc(db, "productos", nuevo.id), Object.assign({}, nuevo)));
                } // Si existe, no hacemos nada y respetamos el que está en Firebase
            });
            await Promise.all(promesas);
        }
    }
}

// ----------------------------------------------------
// LISTENERS (Eventos Principales)

document.addEventListener('DOMContentLoaded', () => {
    UI.inicializar();
});

// Cambios en los botones de categoría
document.querySelector('#btnradio-principales').addEventListener('change', () => {
    UI.renderizarTabla(document.querySelector('#search').value);
});

document.querySelector('#btnradio-accesorios').addEventListener('change', () => {
    UI.renderizarTabla(document.querySelector('#search').value);
});

document.querySelector('#producto-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const codigo = document.querySelector('#codigo').value;
    const productoText = document.querySelector('#producto').value;
    const linea = document.querySelector('#linea').value;
    const valorPuntos = document.querySelector('#valorPuntos').value;
    const stock = document.querySelector('#stock').value;
    const editId = document.querySelector('#edit-id').value;

    if (codigo === '' || productoText === '' || linea === '' || stock === '') {
        UI.mostrarAlerta('Por favor ingrese todos los datos obligatorios', 'danger');
    } else {
        UI.botonDeCarga(false); // Para no clickear de nuevo por error
        try {
            if (editId) {
                const productoActualizado = new ProductoEssen(codigo, productoText, linea, valorPuntos, stock);
                productoActualizado.id = editId;
                await Datos.actualizarProducto(productoActualizado);
                UI.mostrarAlerta('Producto actualizado exitosamente en Firebase', 'success');
            } else {
                const producto = new ProductoEssen(codigo, productoText, linea, valorPuntos, stock);
                await Datos.agregarProducto(producto);
                UI.mostrarAlerta('Producto agregado exitosamente a Firebase', 'success');
            }
            UI.limpiarCampos();
            await UI.refrescarYMostrar();
        } catch (error) {
            UI.mostrarAlerta('Error al comunicarse con la nube', 'danger');
            console.error(error);
        }
        UI.botonDeCarga(true);
    }
});

document.querySelector('#producto-list').addEventListener('click', async (e) => {
    const boton = e.target.closest('button, .btn, .delete');
    if (!boton) return;

    if (boton.classList.contains('delete')) {
        if (confirm('¿Estás seguro que deseas eliminar este producto permanentemente de la nube?')) {
            const id = boton.dataset.id;

            // Efecto visual instantaneo
            boton.parentElement.parentElement.remove();

            await Datos.removerProducto(id);
            UI.mostrarAlerta('Producto Eliminado de Firebase', 'success');

            // Actualizar el cache
            productosCache = productosCache.filter(p => p.id !== id);
        }
    } else if (boton.classList.contains('edit')) {
        const id = boton.dataset.id;
        UI.cargarProductoEnFormulario(id);
    } else if (boton.classList.contains('increase-stock')) {
        const id = boton.dataset.id;
        let p = productosCache.find(prod => prod.id === id);

        // Actualizamos de inmediato en pantalla cacheada para que no haya lagg visual
        p.stock = parseInt(p.stock) + 1;
        UI.renderizarTabla(document.querySelector('#search').value);

        // Mandamos el guardado asincronicamente
        Datos.actualizarProducto(p).catch(err => console.error('Error al subir stock', err));

    } else if (boton.classList.contains('decrease-stock')) {
        const id = boton.dataset.id;
        let p = productosCache.find(prod => prod.id === id);

        if (parseInt(p.stock) > 0) {
            p.stock = parseInt(p.stock) - 1;
            UI.renderizarTabla(document.querySelector('#search').value);

            Datos.actualizarProducto(p).catch(err => console.error('Error al bajar stock', err));
        }
    }
});

document.querySelector('#search').addEventListener('input', (e) => {
    UI.renderizarTabla(e.target.value);
});

// EXPORTAR a EXCEL
document.querySelector('#btn-exportar').addEventListener('click', () => {
    if (productosCache.length === 0) {
        UI.mostrarAlerta('No hay productos para exportar.', 'warning');
        return;
    }

    const exportar = productosCache.map(p => ({
        ID: p.id,
        Codigo: p.codigo,
        Producto: p.producto,
        Linea: p.linea,
        Puntos: p.valorPuntos,
        Stock: p.stock
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportar);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Stock");
    XLSX.writeFile(workbook, "StockEssen.xlsx");
});

// IMPORTAR desde EXCEL
document.querySelector('#input-importar').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!confirm('Esto actualizará o añadirá información en Firestore usando las filas del Excel. ¿Continuar?')) {
        e.target.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
        try {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array' });

            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const excelRows = XLSX.utils.sheet_to_json(firstSheet);

            if (excelRows.length === 0) throw new Error("Excel vacío");

            const lista = document.querySelector('#producto-list');
            lista.innerHTML = '<tr><td colspan="6">Sincronizando Excel con Firebase... ⏳</td></tr>';

            const updatePromises = [];
            for (let row of excelRows) {
                const isValidID = row.ID && row.ID.toString().trim() !== "";

                const productoParaSubir = new ProductoEssen(
                    (row.Codigo || "-").toString(),
                    (row.Producto || "").toString(),
                    (row.Linea || "").toString(),
                    parseInt(row.Puntos) || 0,
                    parseInt(row.Stock) || 0
                );

                if (isValidID) {
                    productoParaSubir.id = row.ID.toString();
                    updatePromises.push(Datos.actualizarProducto(productoParaSubir));
                } else {
                    updatePromises.push(Datos.agregarProducto(productoParaSubir));
                }
            }

            await Promise.all(updatePromises);
            UI.mostrarAlerta('Stock sincronizado correctamente a la Nube desde tu archivo Excel. ✅', 'success');
            await UI.refrescarYMostrar();
        } catch (err) {
            console.error(err);
            UI.mostrarAlerta('Error al leer o importar el archivo Excel.', 'danger');
            await UI.refrescarYMostrar();
        }
        e.target.value = '';
    };
    reader.readAsArrayBuffer(file);
});
