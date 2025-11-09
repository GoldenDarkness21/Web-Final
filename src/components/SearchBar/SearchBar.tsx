import React, { useState } from 'react'
import './SearchBar.css'
import type { SearchBarProps } from '../../types'

const SearchBar: React.FC<SearchBarProps> = ({
    onSearch,
    placeholder = 'Buscar',
    defaultValue = '',
}) => {
    const [searchTerm, setSearchTerm] = useState(defaultValue)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const q = e.target.value
        setSearchTerm(q)
        onSearch(q)
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        onSearch(searchTerm)
    }

    return (
        <div className="search-section">
            <form onSubmit={handleSubmit} className="search-form">
                <img src="/search.png" alt="Buscar" />
                <input
                    type="text"
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={handleChange}
                />
            </form>
        </div>
    )
}

export default SearchBar
