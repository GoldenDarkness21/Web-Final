import React, { createContext, useContext, useMemo, useState } from 'react'
import type { AppContextType, PageId } from '../types'


const AppContext = createContext<AppContextType | undefined>(undefined)


export const AppProvider: React.FC<React.PropsWithChildren> = ({
    children,
}) => {
    const [currentPage, setCurrentPage] = useState<PageId>('home')

    const value = useMemo(
        () => ({ currentPage, setCurrentPage }),
        [currentPage]
    )

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}


// eslint-disable-next-line react-refresh/only-export-components
export const useAppContext = (): AppContextType => {
    const ctx = useContext(AppContext)
    if (!ctx) throw new Error('useAppContext must be used within <AppProvider>')
    return ctx
}
