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
    static mostrarProductos() {
        Datos.cargarProductosPorDefecto();
        Datos.cargarAccesoriosYComplementos();
        let productos = Datos.traerProductos();

        // Ordenar por stock descendente
        productos.sort((a, b) => b.stock - a.stock);

        const lista = document.querySelector('#producto-list');
        lista.innerHTML = '';
        productos.forEach((producto) => UI.agregarProductoALista(producto));
    }

    static agregarProductoALista(producto) {
        const lista = document.querySelector('#producto-list');
        const fila = document.createElement('tr');
        fila.innerHTML = `
        <td>${producto.codigo}</td>
        <td>${producto.producto}</td>
        <td>${producto.linea}</td>
        <td>${producto.valorPuntos}</td>
        <td>
            <button class="btn btn-sm btn-outline-secondary decrease-stock" data-id="${producto.id}">-</button>
            <span class="mx-2 stock-value">${producto.stock}</span>
            <button class="btn btn-sm btn-outline-secondary increase-stock" data-id="${producto.id}">+</button>
        </td>
        <td>
            <button class="btn btn-info btn-sm edit" data-id="${producto.id}" style="margin-right: 5px;">✏️</button>
            <button class="btn btn-delete btn-sm delete" data-id="${producto.id}">X</button>
        </td>
        `;
        lista.appendChild(fila);
    }

    static eliminarProducto(el) {
        if (el.classList.contains('delete')) {
            el.parentElement.parentElement.remove();
        }
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
        const productos = Datos.traerProductos();
        const producto = productos.find(p => p.id === id);

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
    }

    static filtrarProductos(texto) {
        const lista = document.querySelector('#producto-list');
        lista.innerHTML = '';
        const productos = Datos.traerProductos();

        let filtrados = productos.filter(p =>
            p.codigo.toLowerCase().includes(texto.toLowerCase()) ||
            p.producto.toLowerCase().includes(texto.toLowerCase()) ||
            p.linea.toLowerCase().includes(texto.toLowerCase())
        );

        // Mantener el orden descendente por stock en los resultados filtrados
        filtrados.sort((a, b) => b.stock - a.stock);

        filtrados.forEach(p => UI.agregarProductoALista(p));
    }
}

class Datos {
    static traerProductos() {
        let productos;
        if (localStorage.getItem('productos') === null) {
            productos = [];
        } else {
            productos = JSON.parse(localStorage.getItem('productos'));
        }
        return productos;
    }

    static agregarProducto(producto) {
        const productos = Datos.traerProductos();
        productos.push(producto);
        localStorage.setItem('productos', JSON.stringify(productos));
    }

    static removerProducto(id) {
        const productos = Datos.traerProductos();
        const actualizados = productos.filter(p => p.id !== id);
        localStorage.setItem('productos', JSON.stringify(actualizados));
    }

    static actualizarProducto(productoActualizado) {
        let productos = Datos.traerProductos();
        const index = productos.findIndex(p => p.id === productoActualizado.id);
        if (index !== -1) {
            productos[index] = productoActualizado;
            localStorage.setItem('productos', JSON.stringify(productos));
        }
    }

    static cargarProductosPorDefecto() {
        const cargados = localStorage.getItem('productosCargados');
        if (!cargados) {
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
                { codigo: "4024", producto: "Sartén 4024", linea: "LINEA CHERRY", valorPuntos: 0, stock: 2 }
            ];

            let productosActuales = Datos.traerProductos();
            iniciales.forEach(p => {
                const nuevo = new ProductoEssen(p.codigo, p.producto, p.linea, p.valorPuntos, p.stock);
                productosActuales.push(nuevo);
            });
            localStorage.setItem('productos', JSON.stringify(productosActuales));
            localStorage.setItem('productosCargados', 'true');
        }
    }

    static cargarAccesoriosYComplementos() {
        const cargados = localStorage.getItem('accesoriosCargados');
        if (!cargados) {
            const nuevos = [
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

            let productosActuales = Datos.traerProductos();
            nuevos.forEach(p => {
                const nuevo = new ProductoEssen(p.codigo, p.producto, p.linea, p.valorPuntos, p.stock);
                productosActuales.push(nuevo);
            });
            localStorage.setItem('productos', JSON.stringify(productosActuales));
            localStorage.setItem('accesoriosCargados', 'true');
        }
    }
}

document.addEventListener('DOMContentLoaded', UI.mostrarProductos);

document.querySelector('#producto-form').addEventListener('submit', (e) => {
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
        if (editId) {
            const productoActualizado = new ProductoEssen(codigo, productoText, linea, valorPuntos, stock);
            productoActualizado.id = editId;
            Datos.actualizarProducto(productoActualizado);
            UI.mostrarAlerta('Producto actualizado exitosamente', 'success');
        } else {
            const producto = new ProductoEssen(codigo, productoText, linea, valorPuntos, stock);
            Datos.agregarProducto(producto);
            UI.mostrarAlerta('Producto agregado exitosamente', 'success');
        }

        document.querySelector('#edit-id').value = '';
        document.querySelector('#submit-btn').value = 'Agregar Producto';
        UI.limpiarCampos();
        UI.mostrarProductos();
    }
});

document.querySelector('#producto-list').addEventListener('click', (e) => {
    const boton = e.target.closest('button, .btn, .delete');
    if (!boton) return;

    if (boton.classList.contains('delete')) {
        const id = boton.dataset.id;
        UI.eliminarProducto(boton);
        Datos.removerProducto(id);
        UI.mostrarAlerta('Producto Eliminado', 'success');
    } else if (boton.classList.contains('edit')) {
        const id = boton.dataset.id;
        UI.cargarProductoEnFormulario(id);
    } else if (boton.classList.contains('increase-stock')) {
        const id = boton.dataset.id;
        let p = Datos.traerProductos().find(prod => prod.id === id);
        p.stock = parseInt(p.stock) + 1;
        Datos.actualizarProducto(p);
        UI.mostrarProductos();
    } else if (boton.classList.contains('decrease-stock')) {
        const id = boton.dataset.id;
        let p = Datos.traerProductos().find(prod => prod.id === id);
        if (parseInt(p.stock) > 0) {
            p.stock = parseInt(p.stock) - 1;
            Datos.actualizarProducto(p);
            UI.mostrarProductos();
        }
    }
});

document.querySelector('#search').addEventListener('input', (e) => {
    UI.filtrarProductos(e.target.value);
});
