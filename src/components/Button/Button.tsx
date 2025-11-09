import React from 'react'
import { Link } from 'react-router-dom'
import './Button.css'
import type { ButtonProps } from '../../types'

const Button: React.FC<ButtonProps> = (props) => {
    const base = `btn btn-primary ${'className' in props && props.className ? props.className : ''}`

    if ('to' in props && props.to) {
        const { to, children, ...rest } = props
        return (
            <Link to={to} className={base} {...rest}>
                {children}
            </Link>
        )
    }

    const { children, ...rest2 } =
        props as React.ButtonHTMLAttributes<HTMLButtonElement>
    return (
        <button className={base} {...rest2}>
            {children}
        </button>
    )
}

export default Button
