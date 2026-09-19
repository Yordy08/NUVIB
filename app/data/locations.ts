export const locations: Record<string, Record<string, string[]>> = {
  Colombia: {
    Amazonas: ['Leticia'], Antioquia: ['Medellín'], Arauca: ['Arauca'], Atlántico: ['Barranquilla'], Bolívar: ['Cartagena'], Boyacá: ['Tunja'], Caldas: ['Manizales'], Caquetá: ['Florencia'], Casanare: ['Yopal'], Cauca: ['Popayán'], Cesar: ['Valledupar'], Chocó: ['Quibdó'], Córdoba: ['Montería'], Cundinamarca: ['Bogotá', 'Girardot', 'Soacha', 'Zipaquirá'], Guainía: ['Inírida'], Guaviare: ['San José del Guaviare'], Huila: ['Neiva', 'Pitalito'], 'La Guajira': ['Riohacha'], Magdalena: ['Santa Marta'], Meta: ['Villavicencio'], Nariño: ['Pasto', 'Ipiales'], 'Norte de Santander': ['Cúcuta', 'Ocaña'], Putumayo: ['Mocoa'], Quindío: ['Armenia'], Risaralda: ['Pereira', 'Dosquebradas'], 'San Andrés y Providencia': ['San Andrés'], Santander: ['Bucaramanga', 'Barrancabermeja'], Sucre: ['Sincelejo'], Tolima: ['Ibagué'], 'Valle del Cauca': ['Cali', 'Buenaventura', 'Palmira'], Vaupés: ['Mitú'], Vichada: ['Puerto Carreño']
  },
  Venezuela: {
    Amazonas: ['Puerto Ayacucho'], Anzoátegui: ['Barcelona', 'Puerto La Cruz'], Apure: ['San Fernando de Apure'], Aragua: ['Maracay'], Barinas: ['Barinas'], Bolívar: ['Ciudad Bolívar', 'Puerto Ordaz'], Carabobo: ['Valencia', 'Puerto Cabello'], Cojedes: ['San Carlos'], 'Delta Amacuro': ['Tucupita'], Falcón: ['Coro', 'Punto Fijo'], Guárico: ['San Juan de los Morros'], 'La Guaira': ['La Guaira'], Lara: ['Barquisimeto'], Mérida: ['Mérida'], Miranda: ['Los Teques', 'Guarenas', 'Petare'], Monagas: ['Maturín'], 'Nueva Esparta': ['La Asunción', 'Porlamar'], Portuguesa: ['Guanare', 'Acarigua'], Sucre: ['Cumaná'], Táchira: ['San Cristóbal'], Trujillo: ['Trujillo', 'Valera'], Yaracuy: ['San Felipe'], Zulia: ['Maracaibo', 'Cabimas'], 'Distrito Capital': ['Caracas']
  },
  Ecuador: {
    Azuay: ['Cuenca'], Bolívar: ['Guaranda'], Cañar: ['Azogues'], Carchi: ['Tulcán'], Chimborazo: ['Riobamba'], Cotopaxi: ['Latacunga'], 'El Oro': ['Machala'], Esmeraldas: ['Esmeraldas'], Galápagos: ['Puerto Baquerizo Moreno'], Guayas: ['Guayaquil', 'Daule', 'Durán'], Imbabura: ['Ibarra', 'Otavalo'], Loja: ['Loja'], 'Los Ríos': ['Babahoyo', 'Quevedo'], Manabí: ['Portoviejo', 'Manta'], 'Morona Santiago': ['Macas'], Napo: ['Tena'], Orellana: ['Francisco de Orellana'], Pastaza: ['Puyo'], Pichincha: ['Quito', 'Cayambe'], 'Santa Elena': ['Santa Elena', 'La Libertad'], 'Santo Domingo de los Tsáchilas': ['Santo Domingo'], Sucumbíos: ['Nueva Loja'], Tungurahua: ['Ambato'], 'Zamora Chinchipe': ['Zamora']
  },
  Panamá: {
    'Bocas del Toro': ['Bocas del Toro', 'Changuinola'], Chiriquí: ['David', 'Boquete'], Coclé: ['Penonomé'], Colón: ['Colón'], Darién: ['La Palma'], Herrera: ['Chitré'], 'Los Santos': ['Las Tablas'], Panamá: ['Ciudad de Panamá', 'Tocumen'], 'Panamá Oeste': ['La Chorrera', 'Arraiján'], Veraguas: ['Santiago']
  }
}

export const countryNames = Object.keys(locations)
