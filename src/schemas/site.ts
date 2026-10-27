import { z } from 'astro/zod';

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Usá un color hex de 6 dígitos, por ejemplo #2563eb');

export const NOMBRES_BLOQUES = [
  'Header',
  'Hero',
  'Cinta',
  'Pasos',
  'Categorias',
  'Catalogo',
  'Carrito',
  'Turno',
  'Galeria',
  'Nosotros',
  'Testimonios',
  'Ubicaciones',
  'FAQ',
  'Contacto',
  'Footer',
] as const;

export const FUENTES = ['Inter', 'Bricolage Grotesque', 'Fraunces'] as const;

export const tokensSchema = z
  .object({
    brand: hex,
    brandStrong: hex,
    ink: hex,
    muted: hex,
    surface: hex,
    surfaceAlt: hex,
    accent: hex,
    accentInk: hex,
    // Opcionales: si no están, salen de los de arriba.
    brandInk: hex, // texto sobre brand (botones)
    surfaceRaised: hex, // hover de tarjetas y atajos
    line: hex, // separadores
    controlBorder: hex, // borde de campos y selectores
    focus: hex, // contorno de foco del teclado
    link: hex, // enlaces
    promo: hex, // ahorro y promos
    promoInk: hex,
    error: hex, // mensajes de error
    radiusCard: z.string(),
    radiusButton: z.string(),
  })
  .partial()
  .strict();

const foto = z.object({
  foto: z.string().min(1),
  alt: z.string().min(1, 'Toda foto necesita un texto alternativo (alt)'),
});

export const siteSchema = z
  .object({
    $schema: z.string().optional(),
    nombre: z.string().min(1),
    rubro: z.string().min(1),
    tema: z.enum(['tienda', 'servicios', 'portfolio']),
    descripcion: z.string().min(20, 'La descripción se usa en Google: escribí al menos una frase completa'),
    url: z.url(),
    idioma: z.string().default('es-AR'),
    moneda: z.string().default('ARS'),
    zonaHoraria: z.string().default('America/Argentina/Buenos_Aires'),
    hero: z
      .object({
        // Lo que va entre *asteriscos* se resalta: "Tu trabajo merece *buenos insumos.*".
        titulo: z.string().min(1),
        bajada: z.string().min(1),
        // Etiqueta corta arriba del título, por ejemplo la zona o la promo del mes.
        promo: z.string().optional(),
        // Línea chica debajo de los botones, por ejemplo las zonas de envío.
        apoyo: z.string().optional(),
        // Textos de los botones. Por defecto: "Ver catálogo" y "Escribir por WhatsApp".
        botonPrincipal: z.string().optional(),
        botonWhatsApp: z.string().optional(),
        // "emblema": la foto es un emblema con fondo transparente (un logo en 3D). Se muestra
        // sobre un fondo oscuro con luces suaves y se inclina un poco siguiendo al mouse.
        efecto: z.enum(['emblema']).optional(),
        ...foto.partial().shape,
      }),
    marca: z
      .object({
        // Logo completo (con el nombre adentro): reemplaza al nombre en el encabezado.
        logo: foto.optional(),
        // Solo el símbolo, sin el nombre: va al lado del nombre en el encabezado y como ícono de la pestaña.
        isotipo: foto.optional(),
        // Frase corta de marca, por ejemplo "Insumos para hacer". Va en el pie.
        lema: z.string().optional(),
        // "oscuro": el fondo (surface) es oscuro y el texto (ink) claro. Ajusta los bloques que invierten colores.
        esquema: z.enum(['claro', 'oscuro']).default('claro'),
        tokens: tokensSchema.prefault({}),
        fuentes: z
          .object({
            display: z.enum(FUENTES).default('Inter'),
            texto: z.enum(FUENTES).default('Inter'),
          })
          .prefault({}),
      })
      .prefault({}),
    contacto: z.object({
      whatsapp: z
        .string()
        .regex(/^\d{10,15}$/, 'WhatsApp: solo números con código de país, por ejemplo 5493624000000'),
      telefono: z.string().optional(),
      email: z.email().optional(),
      instagram: z.url().optional(),
      facebook: z.url().optional(),
      tiktok: z.url().optional(),
    }),
    pedidos: z
      .object({
        mediosDePago: z.array(z.string().min(1)).min(1),
        envio: z.boolean().default(true),
        retiro: z.boolean().default(true),
        avisoEnvio: z.string().optional(),
        pagoConEnvio: z.array(z.string()).optional(),
      })
      .refine((p) => p.envio || p.retiro, 'Activá envío, retiro o ambos')
      .optional(),
    bloques: z.array(z.enum(NOMBRES_BLOQUES)).optional(),
    // Franja debajo de la portada: frases cortas separadas por ✦ y, opcional, una nota abajo.
    // Con "animada": true las frases pasan en una cinta en movimiento.
    cinta: z
      .object({
        frases: z.array(z.string().min(1)).min(1),
        nota: z.string().optional(),
        animada: z.boolean().default(false),
      })
      .optional(),
    // Imagen para cuando se comparte el enlace (WhatsApp, redes). Ideal 1200 × 630.
    compartir: foto.optional(),
    // Bloque "Cómo comprar": pasos numerados.
    pasos: z.array(z.object({ titulo: z.string().min(1), texto: z.string().min(1) })).max(5).optional(),
    galeria: z.array(foto).optional(),
    testimonios: z.array(z.object({ nombre: z.string(), texto: z.string() })).optional(),
    faq: z.array(z.object({ pregunta: z.string(), respuesta: z.string() })).optional(),
  })
  .strict();

export type Site = z.infer<typeof siteSchema>;
export type Tokens = z.infer<typeof tokensSchema>;
export type NombreBloque = (typeof NOMBRES_BLOQUES)[number];
