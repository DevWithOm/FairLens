import { createContext, useContext } from 'react'

export const DataContext = createContext(null)

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined || context === null) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}
