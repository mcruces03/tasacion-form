export interface ValoracionForm {
  // Datos básicos
  fechaVisita: string;
  asesor: string;
  direccion: string;
  propietarios: string;
  oficina: string;
  zona: string;
  telefonos: string;
  razonVenta: string;
  necesitaComprar: string;
  caracteristicasProximaCompra: string;

  // Edificio
  anoConstruccion: string;
  tipo: string;
  plantas: string;
  fachada: string;
  calefaccion: string;
  ascensor: string;
  porteria: string;
  interfono: string;
  piscina: string;
  jardinComunitario: string;

  // Descripción del inmueble
  planta: string;
  dormitorios: string;
  banos: string;
  estado: 'libre' | 'ocupado' | 'vacio' | 'amueblado' | '';
  gastosComunes: string;
  terrazaBalcon: string;
  jardinPatio: string;
  garaje: string;
  exterior: boolean;
  interior: boolean;
  notas: string;

  // Titulación y cargas
  expectativaCliente: string;
  fechaAdquisicion: string;
  hipoteca: string;
  banco: string;
  compra: boolean;
  herencia: boolean;
  divorcio: boolean;
  valoracion: string;

  // Medidas
  recibidor: string;
  dormMedidas: string[];
  banoMedidas: string[];
  comedor: string;
  cocina: string;
  aseo: string;
  terrazaAbierta: string;
  terrazaCerrada: string;
  patio: string;
  pasilloDist: string;
  galeria: string;
  totalesUtiles: string;
  totalesConst: string;
}

export const defaultFormValues: ValoracionForm = {
  fechaVisita: '',
  asesor: '',
  direccion: '',
  propietarios: '',
  oficina: '',
  zona: '',
  telefonos: '',
  razonVenta: '',
  necesitaComprar: '',
  caracteristicasProximaCompra: '',

  anoConstruccion: '',
  tipo: '',
  plantas: '',
  fachada: '',
  calefaccion: '',
  ascensor: '',
  porteria: '',
  interfono: '',
  piscina: '',
  jardinComunitario: '',

  planta: '',
  dormitorios: '',
  banos: '',
  estado: '',
  gastosComunes: '',
  terrazaBalcon: '',
  jardinPatio: '',
  garaje: '',
  exterior: false,
  interior: false,
  notas: '',

  expectativaCliente: '',
  fechaAdquisicion: '',
  hipoteca: '',
  banco: '',
  compra: false,
  herencia: false,
  divorcio: false,
  valoracion: '',

  recibidor: '',
  dormMedidas: [],
  banoMedidas: [],
  comedor: '',
  cocina: '',
  aseo: '',
  terrazaAbierta: '',
  terrazaCerrada: '',
  patio: '',
  pasilloDist: '',
  galeria: '',
  totalesUtiles: '',
  totalesConst: '',
};
