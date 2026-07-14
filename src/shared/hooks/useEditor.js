import { useState } from 'react'

export const useEditor = (initialObjects) => {
  const [objects, setObjects] = useState(initialObjects)
  const [selectedId, setSelectedId] = useState(initialObjects[0]?.id || null)
  const [activeTool, setActiveTool] = useState(null)

  const selectedObject = objects.find((obj) => obj.id === selectedId)

  const updateObject = (id, updates) => {
    setObjects((current) =>
      current.map((obj) => (obj.id === id ? { ...obj, ...updates } : obj)),
    )
  }

  const addObject = (type, defaults = {}) => {
    const newId = Date.now()
    const newObject = {
      id: newId,
      type,
      x: 200,
      y: 200,
      width: 140,
      height: 100,
      rotate: 0,
      ...defaults,
    }

    setObjects((current) => [...current, newObject])
    setSelectedId(newId)
    return newObject
  }

  const deleteObject = (id) => {
    const remaining = objects.filter((obj) => obj.id !== id)
    setObjects(remaining)
    if (selectedId === id) {
      setSelectedId(remaining[0]?.id || null)
    }
  }

  const deleteSelected = () => {
    if (selectedObject) {
      deleteObject(selectedId)
    }
  }

  return {
    objects,
    selectedId,
    setSelectedId,
    selectedObject,
    activeTool,
    setActiveTool,
    updateObject,
    addObject,
    deleteObject,
    deleteSelected,
  }
}
