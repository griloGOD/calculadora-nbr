export interface AcoEstrutural {
  id: string
  norma: string
  grau: string
  fy: number // MPa
  fu: number // MPa
  E: number // módulo de elasticidade MPa
  G: number // módulo de cisalhamento MPa
  descricao?: string
}

export const MODULO_ELASTICIDADE_ACO = 200000 // MPa (NBR 8800 §4.9)
export const MODULO_CISALHAMENTO_ACO = 77000 // MPa

export const ACOS: AcoEstrutural[] = [
  {
    id: 'a36',
    norma: 'ASTM A36',
    grau: '—',
    fy: 250,
    fu: 400,
    E: MODULO_ELASTICIDADE_ACO,
    G: MODULO_CISALHAMENTO_ACO,
    descricao: 'Aço carbono de uso geral',
  },
  {
    id: 'a572-50',
    norma: 'ASTM A572',
    grau: 'Gr. 50',
    fy: 345,
    fu: 450,
    E: MODULO_ELASTICIDADE_ACO,
    G: MODULO_CISALHAMENTO_ACO,
    descricao: 'Aço de alta resistência e baixa liga',
  },
  {
    id: 'a992',
    norma: 'ASTM A992',
    grau: '—',
    fy: 345,
    fu: 450,
    E: MODULO_ELASTICIDADE_ACO,
    G: MODULO_CISALHAMENTO_ACO,
    descricao: 'Aço específico para perfis laminados W',
  },
  {
    id: 'mr250',
    norma: 'NBR 7007',
    grau: 'MR 250',
    fy: 250,
    fu: 400,
    E: MODULO_ELASTICIDADE_ACO,
    G: MODULO_CISALHAMENTO_ACO,
    descricao: 'Aço estrutural de média resistência',
  },
  {
    id: 'ar350',
    norma: 'NBR 7007',
    grau: 'AR 350',
    fy: 350,
    fu: 450,
    E: MODULO_ELASTICIDADE_ACO,
    G: MODULO_CISALHAMENTO_ACO,
    descricao: 'Aço estrutural de alta resistência',
  },
  {
    id: 'ar415',
    norma: 'NBR 7007',
    grau: 'AR 415',
    fy: 415,
    fu: 550,
    E: MODULO_ELASTICIDADE_ACO,
    G: MODULO_CISALHAMENTO_ACO,
    descricao: 'Aço estrutural de alta resistência',
  },
]

export function getAco(id: string): AcoEstrutural | undefined {
  return ACOS.find((a) => a.id === id)
}

// Coeficientes de ponderação de resistência — NBR 8800 Tabela 3
export const GAMMA_A1 = 1.1 // Escoamento, flambagem
export const GAMMA_A2 = 1.35 // Ruptura
export const GAMMA_A3 = 1.35 // Atrito em ligações
