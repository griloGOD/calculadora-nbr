import { Route, Routes } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import HomePage from './pages/HomePage'
import TracaoPage from './pages/TracaoPage'
import CompressaoPage from './pages/CompressaoPage'
import FlexaoPage from './pages/FlexaoPage'
import CisalhamentoPage from './pages/CisalhamentoPage'
import FlexoCompressaoPage from './pages/FlexoCompressaoPage'
import ParafusosPage from './pages/ParafusosPage'
import SoldasPage from './pages/SoldasPage'
import RelatorioPage from './pages/RelatorioPage'
import ComingSoonPage from './pages/ComingSoonPage'

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/barras/tracao" element={<TracaoPage />} />
        <Route path="/barras/compressao" element={<CompressaoPage />} />
        <Route path="/barras/flexao" element={<FlexaoPage />} />
        <Route path="/barras/cisalhamento" element={<CisalhamentoPage />} />
        <Route path="/barras/flexo-compressao" element={<FlexoCompressaoPage />} />
        <Route path="/barras/torcao" element={<ComingSoonPage title="Torção" />} />
        <Route path="/parafusos" element={<ParafusosPage />} />
        <Route path="/soldas" element={<SoldasPage />} />
        <Route path="/chapas" element={<ComingSoonPage title="Chapas e Compostos" />} />
        <Route path="/relatorio" element={<RelatorioPage />} />
      </Routes>
    </AppShell>
  )
}
