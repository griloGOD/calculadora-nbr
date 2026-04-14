# PRD — Calculadora Estrutural NBR 8800
**Versão:** 1.0  
**Data:** Abril de 2026  
**Produto:** Web App de Dimensionamento de Estruturas de Aço conforme NBR 8800:2008

---

## 1. Visão Geral

### 1.1 Objetivo
Desenvolver um web app responsivo (mobile-first) que implemente de forma completa os critérios de dimensionamento da **NBR 8800:2008 — Projeto de Estruturas de Aço e de Estruturas Mistas de Aço e Concreto de Edifícios**. O app deve calcular as **forças resistentes de cálculo (FRd)** para todos os tipos de elementos estruturais, ligações soldadas e parafusadas.

### 1.2 Público-Alvo
- Engenheiros civis e estruturais
- Projetistas de estruturas metálicas
- Estudantes de engenharia
- Técnicos de escritórios de cálculo

### 1.3 Proposta de Valor
Uma ferramenta de cálculo técnico precisa, rápida e acessível em qualquer dispositivo, substituindo planilhas Excel manuais e reduzindo o risco de erros em dimensionamentos normativos.

---

## 2. Escopo Funcional

### 2.1 Módulos Principais

#### MÓDULO 1 — Perfis Laminados e Soldados (Barras)

**1.1 Tração Axial (Seção 7)**
- Escoamento da seção bruta: `NtRd = Ag · fy / γa1`
- Ruptura da seção líquida: `NtRd = Ae · fu / γa2`
- Coeficiente de redução de área líquida efetiva (Ct)
- Entradas: tipo de perfil, dimensões, furos, material

**1.2 Compressão Axial (Seção 8)**
- Índice de esbeltez reduzido (λo)
- Fator de redução por flambagem local (Q): perfis com elementos compactos, semi-compactos e esbeltos
- Fator χ (curva de flambagem SSRC)
- `NcRd = χ · Q · Ag · fy / γa1`
- Comprimentos de flambagem por eixo (Lx, Ly, Lef)

**1.3 Flexão (Seção 9)**
- Momento resistente plástico: `MRd = Z · fy / γa1`
- Flambagem lateral com torção (FLT): λ, λp, λr
- Fator Cb (momento uniforme equivalente)
- Perfis compactos, semi-compactos e esbeltos
- Suporte a eixo forte e eixo fraco

**1.4 Cisalhamento (Seção 10)**
- Verificação da alma: `VRd = 0,6 · fy · Aw · Cv / γa1`
- Flambagem da alma por cisalhamento
- Reforços transversais (tentadores de alma)

**1.5 Flexo-Compressão e Flexo-Tração (Seção 11)**
- Interação biaxial: equações de interação normalizadas
- Verificação por eixo forte e fraco simultâneos

**1.6 Torção (Seção 12)**
- Torção uniforme (St. Venant)
- Torção não uniforme (empenamento)
- Perfis abertos e fechados

---

#### MÓDULO 2 — Ligações Parafusadas (Seção 6)

**Parâmetros de Entrada**
- Material: ASTM A307, A325, A490, SAE grau 5, grau 8
- Diâmetro do parafuso: M12, M16, M20, M22, M24, M27, M30
- Tipo de ligação: por apoio (bearing) ou por atrito (slip-critical)
- Número de parafusos e disposição (em linha ou grupo)
- Espessura e material das chapas

**Verificações**
- Resistência ao cisalhamento: `FvRd = fv · Ab / γa2`
- Resistência à tração: `FtRd = 0,75 · fu · Ab / γa2`
- Interação cisalhamento + tração
- Resistência ao esmagamento (bearing): `FbRd = 2,4 · fu · d · t / γa2`
- Distâncias mínimas e máximas (e1, e2, p1, p2)
- Verificação do painel de chapa

**Ligações por Atrito (HSFG)**
- Fator de atrito (μ): classes A, B, C
- Pré-targa mínima de instalação
- `FvRdAtrito = μ · Nb · Fp,Cd / γa3`

---

#### MÓDULO 3 — Ligações Soldadas (Seção 6)

**Parâmetros de Entrada**
- Material da solda: E60, E70, E80 (eletrodo AWS)
- Processo: SMAW, GMAW, FCAW, SAW
- Tipo de solda: filete, penetração parcial (PJP), penetração total (CJP)
- Posição de soldagem
- Comprimento e espessura de garganta (a)
- Geometria do cordão

**Verificações**
- Solda de filete: `FwRd = 0,6 · fu,w · Aw / γa2`
- Resistência do metal base adjacente
- Tensão normal + cisalhamento no plano da garganta
- Fator de redução para soldas de filete longas
- Grupo de soldas excêntrico (método vetorial e método elástico)

---

#### MÓDULO 4 — Elementos de Chapa e Seções Compostas

- Chapas em tração, compressão e flexão
- Relações largura/espessura para classificação dos elementos
- Perfis compostos (caixão, I soldado, I laminado com reforço)
- Seções mistas (aço + concreto — simplificado)

---

#### MÓDULO 5 — Verificações Complementares

- Estado Limite de Serviço (ELS): flechas, vibrações
- Coeficientes de ponderação das ações (γf) conforme ABNT NBR 6118/6120
- Coeficientes de resistência (γa1 = 1,10 / γa2 = 1,35 / γa3 = 1,25)

---

## 3. Catálogo de Perfis

### 3.1 Perfis Suportados
| Família | Tipos |
|---|---|
| I Laminado | W, HP, S, M (tabelas GERDAU/USIMINAS) |
| I Soldado | Paramétrico (H): altura, mesa, alma definidos pelo usuário |
| U (Canal) | UNP, UPE |
| Tubo Retangular | RHS — Rectangular Hollow Section |
| Tubo Circular | CHS — Circular Hollow Section |
| Cantoneira | L simples e dupla (igual e desigual) |
| T | WT, MT, ST |
| Chapa plana | Paramétrico (b × t) |
| Barra maciça | Circular e retangular |

### 3.2 Propriedades Geométricas (calculadas automaticamente)
- Área bruta (Ag), Área líquida (An), Área efetiva (Ae)
- Momentos de inércia (Ix, Iy), Raios de giração (rx, ry)
- Módulos de resistência elástico (Sx, Sy) e plástico (Zx, Zy)
- Constante de torção (J), Constante de empenamento (Cw)

---

## 4. Catálogo de Materiais

### 4.1 Aços Estruturais
| Norma | Grau | fy (MPa) | fu (MPa) |
|---|---|---|---|
| ASTM A36 | — | 250 | 400 |
| ASTM A572 | Gr. 50 | 345 | 450 |
| ABNT NBR 7007 | MR250 | 250 | 400 |
| ABNT NBR 7007 | AR350 | 350 | 450 |
| ABNT NBR 7007 | AR415 | 415 | 550 |
| ASTM A992 | — | 345 | 450 |

### 4.2 Parafusos
| Norma | Grau | fyb (MPa) | fub (MPa) |
|---|---|---|---|
| ASTM A307 | — | 240 | 415 |
| ASTM A325 | — | 635 | 825 |
| ASTM A490 | — | 900 | 1035 |
| ISO 898 | Cl. 8.8 | 640 | 800 |
| ISO 898 | Cl. 10.9 | 900 | 1000 |

### 4.3 Eletrodos de Solda
| Classificação AWS | fuE (MPa) |
|---|---|
| E60XX | 415 |
| E70XX | 485 |
| E80XX | 550 |
| E90XX | 620 |

---

## 5. Interface do Usuário

### 5.1 Estrutura de Navegação
```
Home / Dashboard
├── Módulo 1: Barras
│   ├── Tração
│   ├── Compressão
│   ├── Flexão
│   ├── Cisalhamento
│   ├── Flexo-compressão
│   └── Torção
├── Módulo 2: Parafusos
│   ├── Ligação por Apoio
│   └── Ligação por Atrito
├── Módulo 3: Soldas
│   ├── Solda de Filete
│   └── Solda de Penetração
├── Módulo 4: Chapas e Compostos
└── Relatório / Memória de Cálculo
```

### 5.2 Fluxo de Entrada de Dados
1. **Seleção do Módulo** — card visual com ícone e descrição
2. **Material** — dropdown com tabela de propriedades automática
3. **Tipo de Perfil** — seletor gráfico com silhueta do perfil
4. **Dimensões** — campos numéricos com unidades e hints normativos
5. **Parâmetros de Cálculo** — comprimento, condições de contorno, cargas
6. **Resultados** — painel em tempo real com FRd, taxa de utilização e status (OK/NOK)

### 5.3 Painel de Resultados
- Força resistente de cálculo (FRd) em kN ou kN·m
- Taxa de utilização (η = Fd / FRd × 100%)
- Barra de progresso colorida: verde (η ≤ 80%), amarelo (80–100%), vermelho (> 100%)
- Exibição do estado limite governante
- Equações intermediárias expandíveis (modo "mostrar desenvolvimento")

### 5.4 Memória de Cálculo
- Geração de relatório PDF com todas as equações, valores intermediários e referências normativas
- Identificação do projeto (nome, responsável, data)
- Memorial descritivo por módulo

---

## 6. Design e Frontend (Frontend Design Skill)

### 6.1 Direção Estética — "Industrial Precision"
O visual deve remeter a **plantas técnicas e desenhos de engenharia**: precisão, confiança, rigor — mas modernizado com uma interface atual e elegante. Não pode parecer uma planilha ou uma ferramenta genérica.

**Referências visuais:** Blueprint estilizado, desenho técnico vetorial, dashboards industriais de alta precisão.

### 6.2 Paleta de Cores
```
--color-bg:          #0D1117   /* fundo principal: quase preto azulado */
--color-surface:     #161B22   /* superfície de cards */
--color-border:      #30363D   /* bordas finas */
--color-accent:      #F78166   /* laranja-ferrugem: cor de destaque principal */
--color-accent-alt:  #3FB950   /* verde para status OK */
--color-warn:        #D29922   /* amarelo para atenção */
--color-danger:      #F85149   /* vermelho para NOK */
--color-text:        #E6EDF3   /* texto principal */
--color-muted:       #8B949E   /* texto secundário */
--color-blueprint:   #1C2A3A   /* fundo de seções técnicas (azul escuro) */
```

### 6.3 Tipografia
- **Display/Headings:** `"Syne"` — geométrica, técnica, impactante
- **Body/UI:** `"IBM Plex Sans"` — legível, técnico, não genérico
- **Monospace/Equações:** `"IBM Plex Mono"` — para fórmulas e valores numéricos
- Fonte via Google Fonts

### 6.4 Componentes de UI

**Cards de Seleção de Módulo**
- Ícone SVG técnico (seção transversal do perfil)
- Borda inferior colorida no hover
- Animação sutil de elevação (box-shadow)

**Formulários de Entrada**
- Labels flutuantes (floating labels)
- Unidades como sufixo fixo visível dentro do input
- Hint normativo em tooltip ao focar o campo
- Validação inline com feedback imediato

**Painel de Resultados**
- Animação de contagem numérica ao calcular
- Equações em fonte monospace com variáveis destacadas
- Seção expansível "Ver desenvolvimento completo"
- Badge de estado limite governante

**Perfil 3D / Silhueta SVG**
- Desenho SVG paramétrico que atualiza em tempo real conforme o usuário digita as dimensões
- Cotas desenhadas no SVG estilo blueprint

**Barra de Utilização**
- Gradiente animado de verde → amarelo → vermelho
- Marcadores em 80% e 100%

### 6.5 Responsividade
- **Mobile:** layout em coluna única, formulário e resultado empilhados, navegação inferior em tabs
- **Tablet:** layout 60/40 com formulário à esquerda e resultado à direita
- **Desktop:** sidebar de navegação fixa + área principal em duas colunas + painel de resultados lateral

### 6.6 Animações e Microinterações
- Transição suave entre módulos (fade + slide)
- Spinner de precisão (estilo relógio técnico) durante cálculos
- Highlight das equações que mudaram no recálculo
- Efeito de "typing" nos valores calculados

---

## 7. Arquitetura Técnica

### 7.1 Stack Recomendada
| Camada | Tecnologia |
|---|---|
| Frontend Framework | React 18 + Vite |
| Styling | Tailwind CSS + CSS Variables customizadas |
| Animações | Framer Motion |
| Geração de PDF | React-PDF / jsPDF |
| Gráficos SVG | D3.js ou SVG manual |
| Estado global | Zustand |
| Deploy | Vercel / Netlify |

### 7.2 Estrutura de Arquivos
```
src/
├── modules/
│   ├── tracao/
│   ├── compressao/
│   ├── flexao/
│   ├── cisalhamento/
│   ├── parafusos/
│   └── soldas/
├── catalogo/
│   ├── perfis.json
│   ├── materiais.json
│   └── parafusos.json
├── calculos/
│   ├── nbr8800/         ← funções puras de cálculo
│   └── utils/
├── components/
│   ├── ProfileSVG/
│   ├── ResultPanel/
│   ├── FormulaDisplay/
│   └── UtilizationBar/
└── pages/
```

### 7.3 Motor de Cálculo
- Funções puras TypeScript para cada verificação normativa
- Entradas e saídas tipadas com interfaces
- Testes unitários com valores de referência (exemplos do livro do Pfeil & Pfeil)
- Cada função retorna: `{ FRd, estadoLimite, parametrosIntermediarios, equacoesPasso }`

---

## 8. Referências Normativas

| Norma | Descrição |
|---|---|
| ABNT NBR 8800:2008 | Projeto de estruturas de aço e mistas de aço e concreto |
| ABNT NBR 6120:2019 | Ações para o cálculo de estruturas de edificações |
| ABNT NBR 6118:2023 | Projeto de estruturas de concreto (para seções mistas) |
| ABNT NBR 7007:2011 | Aços de uso geral para construção civil |
| ASTM A325 / A490 | Parafusos de alta resistência |
| AWS D1.1 | Structural Welding Code |

---

## 9. Critérios de Aceite (MVP)

### Sprint 1 — Base
- [ ] Seleção de material e perfil laminado W
- [ ] Cálculo de tração axial (escoamento + ruptura)
- [ ] Cálculo de compressão axial (flambagem global, Q=1)
- [ ] Layout base com dark theme e navegação funcional

### Sprint 2 — Barras Completo
- [ ] Flexão (FLT + seções compactas/semi-compactas/esbeltas)
- [ ] Cisalhamento
- [ ] Flexo-compressão (interação)
- [ ] SVG paramétrico do perfil

### Sprint 3 — Ligações
- [ ] Parafusos (apoio + atrito)
- [ ] Soldas de filete
- [ ] Memória de cálculo em PDF

### Sprint 4 — Polimento e Expansão
- [ ] Todos os tipos de perfil
- [ ] Solda de penetração
- [ ] Verificações de ELS
- [ ] Catálogo completo de perfis brasileiros

---

## 10. Considerações Finais

O app deve ser desenvolvido como uma **Single Page Application** com todas as equações transparentes e auditáveis pelo engenheiro. Nenhum cálculo deve ser "caixa preta" — o usuário deve sempre poder verificar passo a passo o que foi calculado e qual referência normativa foi utilizada.

O design técnico-industrial não é apenas estético: reforça a credibilidade da ferramenta perante profissionais de engenharia, que associam precisão visual à precisão de cálculo.
