import type { NombreBloque } from '../schemas/site';

// Cada tema define qué bloques usa y en qué orden. Un cliente puede pisarlo con "bloques" en site.json.
export const TEMAS: Record<'tienda' | 'servicios' | 'portfolio', NombreBloque[]> = {
  tienda: ['Header', 'Hero', 'Cinta', 'Categorias', 'Catalogo', 'Nosotros', 'Ubicaciones', 'FAQ', 'Contacto', 'Footer', 'Carrito'],
  servicios: ['Header', 'Hero', 'Catalogo', 'Turno', 'Testimonios', 'Ubicaciones', 'FAQ', 'Contacto', 'Footer'],
  portfolio: ['Header', 'Hero', 'Galeria', 'Nosotros', 'Testimonios', 'Contacto', 'Footer'],
};

export const bloquesDe = (site: { tema: keyof typeof TEMAS; bloques?: NombreBloque[] }) =>
  site.bloques ?? TEMAS[site.tema];
