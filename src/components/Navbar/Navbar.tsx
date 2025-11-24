import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { FaBars, FaTimes, FaHome, FaMap, FaTh, FaUser } from 'react-icons/fa'
import './Navbar.css'
import type { NavIcon } from '../../types'
import navIconsData from '../../assets/navIcons.json'

const navIcons: NavIcon[] = navIconsData

const Navbar: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen)
    }

    const closeMenu = () => {
        setIsMenuOpen(false)
    }

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <img
                    src="/imgDandi.png"
                    alt="Dandi logo"
                    className="navbar-logo"
                    loading="eager"
                    width="120"
                    height="40"
                />
            </div>

            {/* Desktop Navigation */}
            <ul className="navbar-nav navbar-nav-desktop">
                <li>
                    <NavLink
                        to="/"
                        end
                        className={({ isActive }) =>
                            isActive ? 'active' : undefined
                        }
                    >
                        Home
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/mapa"
                        className={({ isActive }) =>
                            isActive ? 'active' : undefined
                        }
                    >
                        Mapa
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/categorias"
                        className={({ isActive }) =>
                            isActive ? 'active' : undefined
                        }
                    >
                        Categorías
                    </NavLink>
                </li>
            </ul>

            {/* Desktop Icons */}
            <div className="navbar-icons navbar-icons-desktop">
                {navIcons.map(({ id, src, alt }) => (
                    alt === 'User' ? (
                        <NavLink key={id} to="/profile">
                            <img src={src} alt={alt} />
                        </NavLink>
                    ) : (
                        <img key={id} src={src} alt={alt} />
                    )
                ))}
            </div>

            {/* Mobile Menu Button */}
            <button 
                className="navbar-toggle" 
                onClick={toggleMenu}
                aria-label="Toggle menu"
            >
                {isMenuOpen ? <FaTimes size={28} /> : <FaBars size={28} />}
            </button>

            {/* Mobile Navigation */}
            <div className={`navbar-mobile ${isMenuOpen ? 'active' : ''}`}>
                <ul className="navbar-mobile-nav">
                    <li>
                        <NavLink
                            to="/"
                            end
                            className={({ isActive }) =>
                                isActive ? 'active' : undefined
                            }
                            onClick={closeMenu}
                        >
                            <FaHome size={22} />
                            <span>Home</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/mapa"
                            className={({ isActive }) =>
                                isActive ? 'active' : undefined
                            }
                            onClick={closeMenu}
                        >
                            <FaMap size={22} />
                            <span>Mapa</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/categorias"
                            className={({ isActive }) =>
                                isActive ? 'active' : undefined
                            }
                            onClick={closeMenu}
                        >
                            <FaTh size={22} />
                            <span>Categorías</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/profile"
                            className={({ isActive }) =>
                                isActive ? 'active' : undefined
                            }
                            onClick={closeMenu}
                        >
                            <FaUser size={22} />
                            <span>Perfil</span>
                        </NavLink>
                    </li>
                </ul>
            </div>

            {/* Overlay para cerrar menú */}
            {isMenuOpen && (
                <div 
                    className="navbar-overlay" 
                    onClick={closeMenu}
                    aria-hidden="true"
                />
            )}
        </nav>
    )
}

export default Navbar
