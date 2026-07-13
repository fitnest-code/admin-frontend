import { useState, useRef, useEffect, useCallback } from 'react'

export function useResizableColumns(initialWidths: number[], minWidths: number[]) {
  const [colWidths, setColWidths] = useState<number[]>(initialWidths)
  const startXRef = useRef<number>(0)
  const startWidthsRef = useRef<number[]>([])
  const activeColIndexRef = useRef<number>(-1)
  const tableRef = useRef<HTMLTableElement>(null)

  const mouseMoveRef = useRef<(e: MouseEvent) => void>(null)
  const mouseUpRef = useRef<() => void>(null)

  mouseMoveRef.current = (e: MouseEvent) => {
    if (activeColIndexRef.current === -1) return
    const deltaX = e.clientX - startXRef.current
    const currentIndex = activeColIndexRef.current
    const minW = minWidths[currentIndex] || 100

    setColWidths((prev) => {
      const copy = [...prev]
      let newCurrentWidth = startWidthsRef.current[currentIndex] + deltaX
      if (newCurrentWidth < minW) {
        newCurrentWidth = minW
      }
      copy[currentIndex] = newCurrentWidth
      return copy
    })
  }

  mouseUpRef.current = () => {
    activeColIndexRef.current = -1
    if (mouseMoveRef.current) document.removeEventListener("mousemove", mouseMoveRef.current)
    if (mouseUpRef.current) document.removeEventListener("mouseup", mouseUpRef.current)
  }

  const handleMouseDown = useCallback((index: number, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    activeColIndexRef.current = index
    startXRef.current = e.clientX
    startWidthsRef.current = [...colWidths]

    if (mouseMoveRef.current) document.addEventListener("mousemove", mouseMoveRef.current)
    if (mouseUpRef.current) document.addEventListener("mouseup", mouseUpRef.current)
  }, [colWidths])

  useEffect(() => {
    return () => {
      if (mouseMoveRef.current) document.removeEventListener("mousemove", mouseMoveRef.current)
      if (mouseUpRef.current) document.removeEventListener("mouseup", mouseUpRef.current)
    }
  }, [])

  return {
    colWidths,
    setColWidths,
    tableRef,
    handleMouseDown
  }
}
