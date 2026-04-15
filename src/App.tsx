import { Route, Routes } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import HomePage from './pages/HomePage'
import TracaoPage from './pages/TracaoPage'
import CompressaoPage from './pages/CompressaoPage'
import ComingSoonPage from './pages/ComingSoonPage'

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/barras/tracao" element={<TracaoPage />} />
        <Route path="/barras/compressao" element={<CompressaoPage />} />
        <Route path="/barras/flexao" element={<ComingSoonPage title="Flexão" />} />
        <Route path="/barras/cisalhamento" element={<ComingSoonPage title="Cisalhamento" />} />
        <Route path="/barras/flexo-compressao" element={<ComingSoonPage title="Flexo-Compressão" />} />
        <Route path="/barras/torcao" element={<ComingSoonPage title="Torção" />} />
        <Route path="/parafusos" element={<ComingSoonPage title="Parafusos" />} />
        <Route path="/soldas" element={<ComingSoonPage title="Soldas" />} />
        <Route path="/chapas" element={<ComingSoonPage title="Chapas e Compostos" />} />
        <Route path="/relatorio" element={<ComingSoonPage title="Memória de Cálculo" />} />
      </Routes>
    </AppShell>
  )
}
