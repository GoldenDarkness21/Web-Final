// Navegación
export type PageId = 'home' | 'mapa' | 'categorias'
export type NavItem = { id: PageId; label: string; href: string }

// Sugeridos
export type SuggestedItem = {
    id: number | string
    name: string
    image: string
}

// Botón reusable
export type ButtonVariant = 'primary' | 'secondary' | 'ghost'

export type ButtonAsLinkProps = {
    to: string
    className?: string
    children?: React.ReactNode
} & React.AnchorHTMLAttributes<HTMLAnchorElement>

export type ButtonAsButtonProps = {
    to?: undefined
    className?: string
    children?: React.ReactNode
} & React.ButtonHTMLAttributes<HTMLButtonElement>

export type ButtonProps = ButtonAsLinkProps | ButtonAsButtonProps

// Ítems que pintan una card
export type CardItem = {
    id: number | string
    name: string
    image: string
    subtitle?: string
}

//Navbar
export type NavIcon = {
    id: number | string
    src: string
    alt: string
}

export type SearchBarProps = {
    onSearch: (query: string) => void
    placeholder?: string
    defaultValue?: string
}

// página de Mapa
export type DandiPoint = {
    id: number
    name: string
    distance: string
    newPosts: number
    activeUsers: number
    type: 'nearby' | 'regular'
    logo: string
    pin?: string
}

export type Category = {
    id: number
    name: string
    image: string
}

//  CardItem
export type CardData = Pick<CardItem, 'name' | 'image'>
export type CardUIProps = {
    onClick?: () => void
    className?: string
    showName?: boolean
}
export type SuggestedCardProps = CardData & CardUIProps

// Context Types - AGREGAR ESTO
export type AppContextType = {
  currentPage: PageId
  setCurrentPage: (page: PageId) => void
}
// Product Card Types
export interface ProductCard {
  id: number
  title: string
  category: string
  condition: string
  location: string
  image?: string
}
