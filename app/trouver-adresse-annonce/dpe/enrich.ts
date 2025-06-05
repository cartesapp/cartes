export const etageKey = 'numero_etage_appartement'
export default function enrich(dpes) {
  return dpes.map((dpe) => {
    const étageEstimé = guessÉtage(dpe)
    if (étageEstimé == null) return dpe
    const enriched = { étageEstimé }

    return { ...dpe, ...enriched }
  })
}

const guessÉtage = (dpe) => {
  const étage = dpe[etageKey]

  if (+étage > 0) return étage

  const typeBâtiment = dpe['type_batiment']
  if (typeBâtiment === 'maison') return 0

  const complément = dpe['complement_adresse_logement']
  if (!complément) return null
  const etageMatch = complément.match(/([é|e]ta?ge?) (\d+)/i)
  console.log({ etageMatch })
  if (etageMatch) return +etageMatch[2]
  const rdcMatch = complément.match(/RDC/i)
  if (rdcMatch) return 0

  const inversedÉtage = complément.match(
    /(\d+)\s?(er|ème|eme)?\s(étage|etage|etg)/i,
  )
  if (inversedÉtage) return +inversedÉtage[1]

  const machineStyle = complément.match(/(etage|étage|Etg)\s?:\s?(\d+)/i)
  if (machineStyle) return +machineStyle[2]
}
