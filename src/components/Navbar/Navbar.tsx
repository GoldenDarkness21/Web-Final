import React from 'react'
import { NavLink } from 'react-router-dom'
import './Navbar.css'
import type { NavIcon } from '../../types'
import navIconsData from '../../assets/navIcons.json'

const navIcons: NavIcon[] = navIconsData

const Navbar: React.FC = () => {
    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <img
                    src="/imgDandi.png"
                    alt="Dandi logo"
                    className="navbar-logo"
                />
            </div>

            <ul className="navbar-nav">
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

            <div className="navbar-icons">
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
        </nav>
    )
}

export default Navbar
