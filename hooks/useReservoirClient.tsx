import { ReservoirClientContext } from 'context/ReservoirClientProvider'
import { useContext } from 'react'

export default function useReservoirClient() {
  return useContext(ReservoirClientContext)
}
