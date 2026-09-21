import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import Layout from '../../components/layout/Layout.jsx'
import HorizontalNav, { ebookLinks } from '../../components/layout/HorizontalNav.jsx'

import EbookDashboardPage from './EbookDashboardPage.jsx'
import AddTypePage from './AddTypePage.jsx'
import AddMaterialPage from './AddMaterialPage.jsx'
import MaterialListPage from './MaterialListPage.jsx'
import MaterialTypePage from './MaterialTypePage.jsx'
import SubCategoryPage from './SubCategoryPage.jsx'
import OrderListPage from './OrderListPage.jsx'

export default function EbookSection() {
  return (
    <Layout title="Ebook" horizontalNav={<HorizontalNav links={ebookLinks} title="Ebook" />}>
      <Routes>
        <Route path="/" element={<EbookDashboardPage />} />
        <Route path="/add-material" element={<AddMaterialPage />} />
        <Route path="/add-type" element={<AddTypePage />} />
        <Route path="/material-type/:materialTypeId" element={<MaterialTypePage />} />
        <Route path="/material-type/:materialTypeId/subcategory/:categoryId" element={<SubCategoryPage />} />
        <Route path="/material-list" element={<MaterialListPage />} />
        <Route path="/order-list" element={<OrderListPage />} />
        <Route path="/*" element={<Navigate to="/ebook" replace />} />
      </Routes>
    </Layout>
  )
}
