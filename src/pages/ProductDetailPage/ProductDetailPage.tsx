import React from 'react'
import { useParams } from 'react-router-dom'

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()

  return (
    <main style={{ padding: 24 }}>
      <h1>Detalles del Producto {id}</h1>
      <p>Esta página mostrará todos los detalles del producto.</p>
      <p>Por ahora es un placeholder.</p>
    </main>
  )
}

export default ProductDetailPage