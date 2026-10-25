import { z } from 'astro/zod';

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Usá un color hex de 6 dígitos, por ejemplo #2563eb');

export const NOMBRES_BLOQUES = [
  'Header',
  'Hero',
  'Cinta',
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
        // Lo que va entre *asteriscos* se resalta con el color de acento: "Todo limpio, *sin vueltas.*".
        titulo: z.string().min(1),
        bajada: z.string().min(1),
        // Etiqueta corta arriba del título, por ejemplo la promo del mes.
        promo: z.string().optional(),
        // "esfera": portada oscura con una esfera cromada animada en lugar de la foto.
        efecto: z.enum(['esfera']).optional(),
        ...foto.partial().shape,
      }),
    marca: z
      .object({
        // Logo completo (con el nombre adentro): reemplaza al nombre en el encabezado.
        logo: foto.optional(),
        // Solo el símbolo, sin el nombre: va al lado del nombre y grabado en la esfera de la portada.
        isotipo: foto.optional(),
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
    // Frases cortas que pasan en una cinta animada debajo de la portada.
    cinta: z.array(z.string().min(1)).optional(),
    galeria: z.array(foto).optional(),
    testimonios: z.array(z.object({ nombre: z.string(), texto: z.string() })).optional(),
    faq: z.array(z.object({ pregunta: z.string(), respuesta: z.string() })).optional(),
  })
  .strict();

export type Site = z.infer<typeof siteSchema>;
export type Tokens = z.infer<typeof tokensSchema>;
export type NombreBloque = (typeof NOMBRES_BLOQUES)[number];
