import {
  claveItem,
  detalleItem,
  linkWhatsApp,
  mensajePedido,
  presentacionItem,
  totalPedido,
  type ItemPedido,
} from '../lib/whatsapp';
import { formatoPrecio } from '../lib/precio';
import { leerEleccion, varianteElegida } from './ficha';

interface Config {
  comercio: string;
  whatsapp: string;
  moneda: string;
  idioma: string;
  clave: string;
  avisoEnvio?: string;
  pagoConEnvio?: string[];
  nombreRetiro?: string;
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

  // Avisa a los lectores de pantalla lo que pasó (región aria-live fuera del diálogo).
  const anunciar = (texto: string) => {
    const region = document.querySelector('[data-anuncio]');
    if (!region) return;
    region.textContent = '';
    requestAnimationFrame(() => (region.textContent = texto));
  };

  // El mismo producto con otra presentación u otro color/talle va en otra línea.
  function agregar(item: Omit<ItemPedido, 'cantidad'>) {
    const existente = items.find((i) => claveItem(i) === claveItem(item));
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
          <div class="item__texto"><div class="item__nombre"></div><div class="item__variante"></div><div class="item__detalle"></div></div>
          <div class="item__subtotal"></div>
          <div class="item__cantidad">
            <button type="button" data-menos>−</button>
            <span aria-live="polite"></span>
            <button type="button" data-mas>+</button>
          </div>`;
        const presentacion = presentacionItem(i);
        const detalle = detalleItem(i);
        const quien = [i.nombre, i.unidades ? undefined : i.variante, detalle].filter(Boolean).join(', ');
        li.querySelector('.item__nombre')!.textContent = i.nombre;
        li.querySelector('.item__variante')!.textContent = presentacion ?? '';
        li.querySelector('.item__detalle')!.textContent = detalle ?? '';
        li.querySelector('.item__subtotal')!.textContent = $(i.precio * i.cantidad);
        li.querySelector('.item__cantidad span')!.textContent = String(i.cantidad);
        const menos = li.querySelector<HTMLButtonElement>('[data-menos]')!;
        const mas = li.querySelector<HTMLButtonElement>('[data-mas]')!;
        menos.setAttribute('aria-label', `Quitar una unidad de ${quien}`);
        mas.setAttribute('aria-label', `Sumar una unidad de ${quien}`);
        menos.addEventListener('click', () => cambiar(n, -1));
        mas.addEventListener('click', () => cambiar(n, 1));
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

  // Con envío: localidad y dirección a la vista, y solo los medios de pago permitidos (los otros
  // no quedan como opciones grises). Con retiro: vuelven todos y se esconden los datos de envío.
  function actualizarEntrega() {
    const esEnvio = new FormData(form).get('entrega') === 'envio';
    dialogo!.querySelectorAll('[data-solo-envio]').forEach((el) => el.toggleAttribute('hidden', !esEnvio));
    const restringe = esEnvio && Boolean(config.pagoConEnvio?.length);
    const permitidos = restringe ? config.pagoConEnvio! : mediosTodos;
    const antes = pago.value;
    pago.replaceChildren(...permitidos.map((m) => new Option(m, m)));
    pago.value = permitidos.includes(antes) ? antes : permitidos[0];
    dialogo!.querySelector('[data-ayuda-pago]')?.toggleAttribute('hidden', !restringe);
    const localidad = dialogo!.querySelector<HTMLSelectElement>('[data-localidad]');
    dialogo!.querySelector('[data-aviso-otra]')?.toggleAttribute('hidden', !esEnvio || localidad?.value !== 'otra');
  }

  document.addEventListener('click', (e) => {
    const destino = e.target as HTMLElement;
    const boton = destino.closest<HTMLButtonElement>('[data-agregar]');
    const card = boton?.closest<HTMLElement>('[data-producto]');
    if (boton && card) {
      const elegido = leerEleccion(card);
      if (!elegido) return;
      const v = varianteElegida(card);
      const variantes = JSON.parse(boton.dataset.variantes!);
      const unidad = card.querySelector<HTMLElement>('[data-opciones]')?.dataset.opciones;
      agregar({
        id: boton.dataset.id,
        nombre: boton.dataset.nombre!,
        variante: variantes.length > 1 || v.nombre !== 'Unidad' ? v.nombre : undefined,
        precio: v.precio,
        eleccion: elegido.eleccion,
        unidades: v.unidades,
        unidad: v.unidades && unidad ? JSON.parse(unidad).unidad : undefined,
      });
      boton.setAttribute('data-listo', '');
      setTimeout(() => boton.removeAttribute('data-listo'), 1400);
      anunciar(`Agregaste ${boton.dataset.nombre} al pedido.`);
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
    const esEnvio = entrega === 'envio';
    const texto = (campo: string) => String(datos.get(campo) ?? '').trim();
    const nombre = texto('nombre');
    const localidad = texto('localidad');
    const direccion = texto('direccion');
    const error = q('[data-error]');
    const campoLocalidad = dialogo.querySelector<HTMLSelectElement>('[data-localidad]');

    form.querySelectorAll('[aria-invalid]').forEach((c) => {
      c.removeAttribute('aria-invalid');
      if (c.getAttribute('aria-describedby') === error.id) c.removeAttribute('aria-describedby');
    });
    // El mensaje va justo debajo del campo que falta, que además se marca con borde de error.
    const fallar = (mensaje: string, nombreCampo: string) => {
      const campo = form.querySelector<HTMLElement>(`[name="${nombreCampo}"]`);
      campo?.closest('.campo')?.append(error);
      error.textContent = mensaje;
      campo?.setAttribute('aria-invalid', 'true');
      campo?.setAttribute('aria-describedby', error.id);
      campo?.focus();
    };
    if (esEnvio && campoLocalidad && !localidad) return fallar('Elegí tu localidad para el envío.', 'localidad');
    if (esEnvio && !direccion) return fallar('Escribí la dirección de entrega.', 'direccion');
    if (!nombre) return fallar('Escribí tu nombre para que sepan a quién entregar.', 'nombre');
    error.textContent = '';

    const mensaje = mensajePedido({
      comercio: config.comercio,
      items,
      entrega,
      avisoEnvio: config.avisoEnvio,
      nombreRetiro: config.nombreRetiro,
      localidad: localidad === 'otra' ? 'otra zona (a consultar)' : localidad || undefined,
      pago: String(datos.get('pago')),
      nombre,
      direccion,
      nota: texto('nota') || undefined,
      moneda: config.moneda,
    });
    window.open(linkWhatsApp(config.whatsapp, mensaje), '_blank', 'noopener');
  });

  actualizarEntrega();
  pintar();
}
