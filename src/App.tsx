import React, { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider, Outlet, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar/Navbar'
import { useAuthRedux } from './store/hooks/useAuthRedux'
import './App.css'

// Lazy load de páginas
const HomePage = lazy(() => import('./pages/HomePage/HomePage'))
const MapPage = lazy(() => import('./pages/MapPage/MapPage'))
const CategoriesPage = lazy(() => import('./pages/CategoriesPage/CategoriesPage'))
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage/ProductDetailPage'))
const SavedPage = lazy(() => import('./pages/SavedPage/SavedPage'))
const LoginPage = lazy(() => import('./pages/LoginPage/LoginPage').then(module => ({ default: module.LoginPage })))
const RegisterPage = lazy(() => import('./pages/RegisterPage/RegisterPage').then(module => ({ default: module.RegisterPage })))
const ProfilePage = lazy(() => import('./pages/ProfilePage/ProfilePage').then(module => ({ default: module.ProfilePage })))

// Loading component
const PageLoader = () => (
    <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh',
        color: '#2c371c',
        fontSize: '1.2rem'
    }}>
        Cargando...
    </div>
)

const Layout: React.FC = () => (
    <>
        <Navbar />
        <Outlet />
    </>
)

const ProtectedLayout: React.FC = () => {
    const { user, loading } = useAuthRedux()
    if (loading) return <PageLoader />
    if (!user) return <Navigate to="/login" replace />
    return (
        <Suspense fallback={<PageLoader />}>
            <Layout />
        </Suspense>
    )
}

const PublicLogin: React.FC = () => {
    const { user, loading } = useAuthRedux()
    if (loading) return <PageLoader />
    if (user) return <Navigate to="/" replace />
    return (
        <Suspense fallback={<PageLoader />}>
            <LoginPage />
        </Suspense>
    )
}

const router = createBrowserRouter([
    { 
        path: '/login', 
        element: <PublicLogin /> 
    },
    { 
        path: '/register', 
        element: (
            <Suspense fallback={<PageLoader />}>
                <RegisterPage />
            </Suspense>
        )
    },
    {
        path: '/',
        element: <ProtectedLayout />,
        children: [
            { 
                index: true, 
                element: (
                    <Suspense fallback={<PageLoader />}>
                        <HomePage />
                    </Suspense>
                )
            },
            { 
                path: 'mapa', 
                element: (
                    <Suspense fallback={<PageLoader />}>
                        <MapPage />
                    </Suspense>
                )
            },
            { 
                path: 'categorias', 
                element: (
                    <Suspense fallback={<PageLoader />}>
                        <CategoriesPage />
                    </Suspense>
                )
            },
            { 
                path: 'producto/:id', 
                element: (
                    <Suspense fallback={<PageLoader />}>
                        <ProductDetailPage />
                    </Suspense>
                )
            },
            { 
                path: 'guardados', 
                element: (
                    <Suspense fallback={<PageLoader />}>
                        <SavedPage />
                    </Suspense>
                )
            },
            { 
                path: 'profile', 
                element: (
                    <Suspense fallback={<PageLoader />}>
                        <ProfilePage />
                    </Suspense>
                )
            },
            { path: '*', element: <Navigate to="/" replace /> },
        ],
    },
])

export default function App() {
    return <RouterProvider router={router} />
}