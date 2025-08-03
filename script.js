// Variables globales
let cantidadTickets = 0;
let seleccionados = [];
const precioPorTicket = 5;

// ---------------- CLIENTE ----------------
if (document.getElementById('talonario')) {
  const talonario = document.getElementById('talonario');

  for (let i = 1; i <= 1000; i++) {
    const div = document.createElement('div');
    div.textContent = i;
    div.classList.add('ticket', 'disponible');
    div.dataset.numero = i;
    div.addEventListener('click', seleccionarTicket);
    talonario.appendChild(div);
  }

  function iniciarSeleccion() {
    cantidadTickets = parseInt(document.getElementById('cantidadInput').value);
    if (cantidadTickets < 2) {
      alert('La compra mínima es de 2 tickets.');
      return;
    }
    document.getElementById('mensajeCentral').style.display = 'none';
  }

  function seleccionarTicket(e) {
    const ticket = e.target;
    const numero = parseInt(ticket.dataset.numero);

    if (!ticket.classList.contains('disponible')) return;

    if (ticket.classList.contains('seleccionado')) {
      ticket.classList.remove('seleccionado');
      seleccionados = seleccionados.filter(n => n !== numero);
    } else {
      if (seleccionados.length >= cantidadTickets) {
        alert('Ya seleccionaste todos tus tickets.');
        return;
      }
      ticket.classList.add('seleccionado');
      seleccionados.push(numero);
    }

    if (seleccionados.length === cantidadTickets) {
      // Guardar en localStorage y redirigir a registro.html
      localStorage.setItem('ticketsSeleccionados', JSON.stringify(seleccionados));
      localStorage.setItem('cantidadSeleccionada', cantidadTickets);
      window.location.href = 'registro.html';
    }
  }
}

// ---------------- REGISTRO ----------------
if (document.getElementById('ticketsSeleccionados')) {
  const seleccion = JSON.parse(localStorage.getItem('ticketsSeleccionados') || '[]');
  const cantidad = seleccion.length;
  const total = cantidad * 190;

  document.getElementById('ticketsSeleccionados').textContent =
    `Has seleccionado: ${cantidad} tickets (${seleccion.join(', ')})`;

  document.getElementById('montoTotal').textContent = `Total a pagar: ${total} Bs`;

  window.registrarParticipante = function (event) {
    event.preventDefault();
    const nombre = document.getElementById('nombre').value.trim();
    const whatsapp = document.getElementById('whatsapp').value.trim();

    if (!nombre || !whatsapp) return;

    const nuevoRegistro = {
      nombre,
      whatsapp,
      cantidad,
      numeros: seleccion,
      estado: 'En espera',
      total
    };

    const registros = JSON.parse(localStorage.getItem('registros') || '[]');
    registros.push(nuevoRegistro);
    localStorage.setItem('registros', JSON.stringify(registros));

    // Limpiar selección y redirigir (opcionalmente)
    localStorage.removeItem('ticketsSeleccionados');
    alert('¡Registro exitoso!');
    window.location.href = "consulta.html";
  };
}


// ---------------- ADMIN ----------------
if (document.getElementById('tablaAdmin')) {
  const tabla = document.getElementById('tablaAdmin');
  const registros = JSON.parse(localStorage.getItem('registros') || '[]');

  registros.forEach((reg, index) => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${reg.nombre}</td>
      <td>${reg.whatsapp}</td>
      <td>${reg.cantidad}</td>
      <td>${reg.numeros.join(', ')}</td>
      <td id="estado-${index}">${reg.estado}</td>
      <td>${reg.total} Bs</td>
      <td>
        <button onclick="verificar(${index})">Verificar</button>
        <button onclick="eliminarRegistro(${index})" style="background:red;color:white;">Eliminar</button>
      </td>
    `;
    tabla.appendChild(fila);
  });

  window.verificar = function(index) {
    registros[index].estado = 'Verificado';
    localStorage.setItem('registros', JSON.stringify(registros));
    document.getElementById(`estado-${index}`).textContent = 'Verificado';
  };

  window.eliminarRegistro = function(index) {
    if (confirm('¿Estás seguro de eliminar este registro?')) {
      registros.splice(index, 1);
      localStorage.setItem('registros', JSON.stringify(registros));
      location.reload();
    }
  };
}


// ---------------- CONSULTA ----------------
if (document.getElementById('tablaConsulta')) {
  const tabla = document.getElementById('tablaConsulta');
  const registros = JSON.parse(localStorage.getItem('registros') || '[]');

  registros.forEach(reg => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${reg.nombre}</td>
      <td>${reg.whatsapp}</td>
      <td>${reg.cantidad}</td>
      <td>${reg.numeros.join(', ')}</td>
      <td>${reg.estado}</td>
      <td>${reg.total} Bs</td>
    `;
    tabla.appendChild(fila);
  });
}

// ---------------- TALONARIO ----------------
if (document.getElementById('contenedorTalonario')) {
  const contenedor = document.getElementById('contenedorTalonario');
  const registros = JSON.parse(localStorage.getItem('registros') || '[]');

  // Mapa para saber quién tiene cada número
  const mapaNumeros = {};
  registros.forEach(reg => {
    reg.numeros.forEach(num => {
      mapaNumeros[num] = {
        nombre: reg.nombre,
        whatsapp: reg.whatsapp
      };
    });
  });

  const elementos = []; // Guardar referencia a cada número para buscar

  for (let i = 1; i <= 1000; i++) {
    const div = document.createElement('div');
    div.classList.add('numero');
    div.textContent = i;

    if (mapaNumeros[i]) {
      div.classList.add('ocupado');

      const tooltip = document.createElement('div');
      tooltip.classList.add('tooltip');
      tooltip.textContent = `👤 ${mapaNumeros[i].nombre} - 📱 ${mapaNumeros[i].whatsapp}`;
      div.appendChild(tooltip);
    } else {
      div.classList.add('disponible');
    }

    contenedor.appendChild(div);
    elementos.push({ numero: i, div, info: mapaNumeros[i] || null });
  }

  // ---------------- Búsqueda ----------------
  const inputBuscar = document.getElementById('buscar');
  inputBuscar.addEventListener('input', () => {
    const texto = inputBuscar.value.toLowerCase();

    elementos.forEach(({ div, info }) => {
      div.classList.remove('resaltado');

      if (info) {
        const nombre = info.nombre.toLowerCase();
        const tel = info.whatsapp.toLowerCase();
        if (nombre.includes(texto) || tel.includes(texto)) {
          div.classList.add('resaltado');
        }
      }
    });
  });
}



  const toggleBtn = document.getElementById('menu-toggle');
  const menu = document.getElementById('menu');

  toggleBtn.addEventListener('click', () => {
    menu.classList.toggle('show');
  });


