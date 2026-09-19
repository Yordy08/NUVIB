import { departamentos } from 'colombia-territorial'

export const locations: Record<string, Record<string, string[]>> = {
  Colombia: Object.fromEntries(
    departamentos.map((department: { nombre: string; municipios: { nombre: string }[] }) => [
      department.nombre,
      department.municipios.map(municipality => municipality.nombre)
    ])
  )
}

export const countryNames = ['Colombia']
