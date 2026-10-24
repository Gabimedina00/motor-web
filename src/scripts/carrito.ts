import { linkWhatsApp, mensajePedido, totalPedido, type ItemPedido } from '../lib/whatsapp';
import { formatoPrecio } from '../lib/precio';

interface Config {
  comercio: string;
  whatsapp: string;
  moneda: string;
  idioma: string;
  clave: string;
  avisoEnvio?: string;
  pagoConEnvio?: string[];
}

export function iniciarCarrito() {
  const dialogo = document.querySelector<HTMLDialogElement>('[data-carrito]');
  if (!dialogo) return;
  const config: Config = JSON.parse(dialogo.dataset.config!);
  const $ = (n: number) => formatoPrecio(n, config.moneda, config.idioma);
  const q = <T extends Element>(sel: string) => dialogo.querySelector<T>(sel)!;
  const form = q<HTMLFormElement>('[data-form-pedido]');
  const pago = q<HTMLSelectElement>('[data-pago]');
  const mediosTodos = [...pago.options].map((o) => o.value);

  let items: ItemPedido[] = [];
  try {
    items = JSON.parse(localStorage.getItem(config.clave) ?? '[]');
  } catch {
    items = [];
  }
  const guardar = () => {
    try {
      localStorage.setItem(config.clave, JSON.stringify(items));
    } catch {
      /* sin almacenamiento: el pedido vive solo en esta pestaña */
    }
  };

  function agregar(item: Omit<ItemPedido, 'cantidad'>) {
    const existente = items.find((i) => i.nombre === item.nombre && i.variante === item.variante);
    if (existente) existente.cantidad++;
    else items.push({ ...item, cantidad: 1 });
    guardar();
    pintar();
  }

  function cambiar(indice: number, delta: number) {
    items[indice].cantidad += delta;
    if (items[indice].cantidad <= 0) items.splice(indice, 1);
    guardar();
    pintar();
  }

  function pintar() {
    const cantidad = items.reduce((t, i) => t + i.cantidad, 0);
    const total = totalPedido(items);
    const lista = q<HTMLUListElement>('[data-items]');
    lista.replaceChildren(
      ...items.map((i, n) => {
        const li = document.createElement('li');
        li.className = 'item';
        li.innerHTML = `
          <div><div class="item__nombre"></div><div class="item__variante"></div></div>
          <div class="item__subtotal"></div>
          <div class="item__cantidad">
            <button type="button" data-menos aria-label="Quitar uno">−</button>
            <span aria-live="polite"></span>
            <button type="button" data-mas aria-label="Agregar uno">+</button>
          </div>`;
        li.querySelector('.item__nombre')!.textContent = i.nombre;
        li.querySelector('.item__variante')!.textContent = i.variante ?? '';
        li.querySelector('.item__subtotal')!.textContent = $(i.precio * i.cantidad);
        li.querySelector('.item__cantidad span')!.textContent = String(i.cantidad);
        li.querySelector('[data-menos]')!.addEventListener('click', () => cambiar(n, -1));
        li.querySelector('[data-mas]')!.addEventListener('click', () => cambiar(n, 1));
        return li;
      }),
    );
    q('[data-vacio]').toggleAttribute('hidden', cantidad > 0);
    q('[data-total-fila]').toggleAttribute('hidden', cantidad === 0);
    q('[data-datos]').toggleAttribute('hidden', cantidad === 0);
    q('[data-total]').textContent = $(total);

    const barra = document.querySelector<HTMLElement>('[data-barra]');
    barra?.toggleAttribute('hidden', cantidad === 0 || dialogo!.open);
    const resumen = document.querySelector('[data-resumen]');
    if (resumen) resumen.textContent = `${cantidad} ${cantidad === 1 ? 'producto' : 'productos'}, ${$(total)}`;
    document.querySelectorAll('[data-contador]').forEach((c) => (c.textContent = String(cantidad)));
    document
      .querySelectorAll('.header__carrito')
      .forEach((b) => b.setAttribute('aria-label', `Ver tu pedido, ${cantidad} productos`));
  }

  function actualizarEntrega() {
    const entrega = new FormData(form).get('entrega');
    const esEnvio = entrega === 'envio';
    dialogo!.querySelector('[data-campo-direccion]')?.toggleAttribute('hidden', !esEnvio);
    dialogo!.querySelector('[data-aviso-envio]')?.toggleAttribute('hidden', !esEnvio);
    const permitidos = esEnvio && config.pagoConEnvio?.length ? config.pagoConEnvio : mediosTodos;
    [...pago.options].forEach((o) => (o.disabled = !permitidos.includes(o.value)));
    if (pago.selectedOptions[0]?.disabled) pago.value = permitidos[0];
  }

  document.addEventListener('click', (e) => {
    const destino = e.target as HTMLElement;
    const boton = destino.closest<HTMLButtonElement>('[data-agregar]');
    if (boton) {
      const variantes: { nombre: string; precio: number }[] = JSON.parse(boton.dataset.variantes!);
      const selector = boton.closest('[data-producto]')?.querySelector<HTMLSelectElement>('[data-variante]');
      const v = variantes[selector ? Number(selector.value) : 0];
      agregar({ nombre: boton.dataset.nombre!, variante: variantes.length > 1 || v.nombre !== 'Unidad' ? v.nombre : undefined, precio: v.precio });
      boton.textContent = 'Agregado';
      setTimeout(() => (boton.innerHTML = `Agregar<span class="solo-lectores"> ${boton.dataset.nombre}</span>`), 1200);
    }
    if (destino.closest('[data-abrir-carrito]')) {
      dialogo.showModal();
      pintar();
    }
    if (destino.closest('[data-cerrar-carrito]') || destino === dialogo) dialogo.close();
  });
  dialogo.addEventListener('close', pintar);
  form.addEventListener('change', actualizarEntrega);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const datos = new FormData(form);
    const entrega = datos.get('entrega') as 'envio' | 'retiro';
    const nombre = String(datos.get('nombre') ?? '').trim();
    const direccion = String(datos.get('direccion') ?? '').trim();
    const error = q('[data-error]');
    if (!nombre) return void (error.textContent = 'Escribí tu nombre para que sepan a quién entregar.');
    if (entrega === 'envio' && !direccion) return void (error.textContent = 'Escribí la dirección de entrega.');
    error.textContent = '';
    const mensaje = mensajePedido({
      comercio: config.comercio,
      items,
      entrega,
      avisoEnvio: config.avisoEnvio,
      pago: String(datos.get('pago')),
      nombre,
      direccion,
      nota: String(datos.get('nota') ?? '').trim() || undefined,
      moneda: config.moneda,
    });
    window.open(linkWhatsApp(config.whatsapp, mensaje), '_blank', 'noopener');
  });

  actualizarEntrega();
  pintar();
}
