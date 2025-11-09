import React from 'react'
import { createBrowserRouter, RouterProvider, Outlet, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar/Navbar'
import HomePage from './pages/HomePage/HomePage'
import MapPage from './pages/MapPage/MapPage'
import CategoriesPage from './pages/CategoriesPage/CategoriesPage'
import ProductDetailPage from './pages/ProductDetailPage/ProductDetailPage'
import { SavedProvider } from './context/SavedContext'
import SavedPage from './pages/SavedPage/SavedPage'
import { LoginPage } from './pages/LoginPage/LoginPage'
import { RegisterPage } from './pages/RegisterPage/RegisterPage'
import { ProfilePage } from './pages/ProfilePage/ProfilePage'
import { useAuth } from './context/useAuthContext'
import './App.css'

const Layout: React.FC = () => (
    <SavedProvider>
        <Navbar />
        <Outlet />
    </SavedProvider>
)

const ProtectedLayout: React.FC = () => {
    const { user, loading } = useAuth()
    if (loading) return <main style={{ padding: 24 }}>Cargando...</main>
    if (!user) return <Navigate to="/login" replace />
    return <Layout />
}

const PublicLogin: React.FC = () => {
    const { user, loading } = useAuth()
    if (loading) return <main style={{ padding: 24 }}>Cargando...</main>
    if (user) return <Navigate to="/" replace />
    return <LoginPage />
}

const router = createBrowserRouter([
    { path: '/login', element: <PublicLogin /> },
    { path: '/register', element: <RegisterPage /> },
    {
        path: '/',
        element: <ProtectedLayout />,
        children: [
            { index: true, element: <HomePage /> },
            { path: 'mapa', element: <MapPage /> },
            { path: 'categorias', element: <CategoriesPage /> },
            { path: 'producto/:id', element: <ProductDetailPage /> },
            { path: 'guardados', element: <SavedPage /> },
            { path: 'profile', element: <ProfilePage /> },
            { path: '*', element: <Navigate to="/" replace /> },
        ],
    },
])

export default function App() {
    return <RouterProvider router={router} />
}