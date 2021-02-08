import React, { useCallback, useMemo, useRef, useState } from 'react'
import { Diagram } from './components/Diagram'
import { useHistory } from './hooks/useHistory'
import { Toolbar } from './components/Toolbar/Toolbar'
import { NodeList } from './components/NodeList/NodeList'
import { IDiagramType, ICoordinateType, IMousePosition, ITransform } from './types'
import { createNode } from './components/NodeTypes/config'
import { throttle } from 'lodash-es'

// const manyNode = new Array(100).fill({}).map()

const defaultValue: IDiagramType = {
  nodes: [
    {
      id: 'node-1',
      coordinates: [100, 150],
      inputs: [],
      outputs: [{ id: 'port-1', isLinked: true }],
      type: 'nodeTypeInput',
      data: {
        inputValue: 'defaultValue',
      },
    },
    {
      id: 'node-2',
      type: 'nodeTypeSelect',
      coordinates: [400, 200],
      inputs: [{ id: 'input-1', isLinked: false }],
      outputs: [
        { id: 'port-5', isLinked: false },
        { id: 'port-6', isLinked: false },
      ],
      data: {
        selectValue: '',
      },
    },
  ],
  links: [{ input: 'port-1', output: 'node-2' }],
}

const SCALE_STEP = 0.1

const DRAG_STATE = {
  DEFAULT: 'DEFAULT',
  START: 'START',
  MOVE: 'MOVE',
  END: 'END',
}

const CURSOR_MAP = {
  [DRAG_STATE.DEFAULT]: 'default',
  [DRAG_STATE.START]: 'grab',
  [DRAG_STATE.MOVE]: 'grabbing',
}

function DiagramPanel() {
  const { state, set, setHistory, undo, redo, clear, canUndo, canRedo } = useHistory(defaultValue)
  const [transform, setTransform] = useState<ITransform>({
    scale: 1,
    translateX: 0,
    translateY: 0,
  })
  const [dragState, setDragState] = useState<string>(DRAG_STATE.DEFAULT)
  const mouseDownStartPosition = useRef<IMousePosition>({ x: 0, y: 0 })
  const scaleRef = useRef<number>(1)
  const panelRef = useRef<HTMLDivElement>(null)

  // const [schema, setSchema] = useState(defaultValue)
  const handleChange = useCallback(
    (value: any) => {
      const newValue = { ...state, ...value }
      set(newValue)
    },
    [set, state]
  )

  const handleAddHistory = (nodes: any) => {
    const newValue = { ...state, nodes }
    setHistory(newValue)
  }

  const handleDrop = useCallback(
    (event: any) => {
      if (event) {
        event = window.event
      }
      const nodeType = event.dataTransfer.getData('nodeType')
      const x = event.clientX
      const y = event.clientY

      const diagramCanvasRect = document.getElementById('diagram-canvas')?.getBoundingClientRect() || { x: 0, y: 0 }

      const coordinates: ICoordinateType = [
        (x - diagramCanvasRect.x) / transform.scale,
        (y - diagramCanvasRect.y) / transform.scale,
      ]
      const newNode = createNode(nodeType, coordinates)
      handleChange({ nodes: [...state.nodes, newNode] })
    },
    [handleChange, transform, state.nodes]
  )

  const handleDrag = useCallback((e: any) => {
    e.preventDefault()
  }, [])

  const handleWheel = useCallback(
    (event: any) => {
      if (!event) event = window.event
      const wheelDelta = event.nativeEvent.wheelDelta

      let { scale, translateX, translateY } = transform
      let newScale = scaleRef.current

      const mouseX = (event.clientX - translateX) / scale
      const mouseY = (event.clientY - translateY) / scale

      if (wheelDelta < 0) {
        newScale = newScale - SCALE_STEP
        translateX = translateX + mouseX * SCALE_STEP
        translateY = translateY + mouseY * SCALE_STEP
      }
      if (wheelDelta > 0) {
        newScale = newScale + SCALE_STEP
        translateX = translateX - mouseX * SCALE_STEP
        translateY = translateY - mouseY * SCALE_STEP
      }

      if (newScale > 1 || newScale < 0.1) return
      scaleRef.current = Number(newScale.toFixed(2))

      setTransform({
        scale: scaleRef.current,
        translateX,
        translateY,
      })
    },
    [transform]
  )

  const handleMouseDown = useCallback(
    (event) => {
      if (
        dragState === DRAG_STATE.START &&
        (event.target === panelRef.current || event.target === panelRef.current?.firstChild)
      ) {
        setDragState(DRAG_STATE.MOVE)
      }
      mouseDownStartPosition.current = {
        x: event.clientX,
        y: event.clientY,
      }
    },
    [dragState]
  )

  const handleMouseMove = useCallback(
    (event) => {
      if (dragState === DRAG_STATE.MOVE) {
        handleThrottleSetTransform(event)
      }
    },
    [dragState]
  )

  const handleMouseUp = useCallback(
    (event) => {
      if (dragState === DRAG_STATE.MOVE) {
        setDragState(DRAG_STATE.START)
      }
    },
    [dragState]
  )

  const handleThrottleSetTransform = useCallback(
    throttle((e) => {
      setTransform({
        ...transform,
        translateX: e.clientX - mouseDownStartPosition.current.x + transform.translateX,
        translateY: e.clientY - mouseDownStartPosition.current.y + transform.translateY,
      })
    }, 20),
    [transform]
  )

  const handleKeyDown = useCallback(
    (event) => {
      if (event.keyCode === 32 && dragState === DRAG_STATE.DEFAULT) {
        setDragState(DRAG_STATE.START)
      }
    },
    [dragState]
  )

  const handleKeyUp = useCallback((event) => {
    if (event.keyCode === 32) {
      setDragState(DRAG_STATE.DEFAULT)
    }
  }, [])

  const cursor = useMemo(() => {
    return CURSOR_MAP[dragState]
  }, [dragState])

  return (
    <div
      ref={panelRef}
      className="diagram-panel"
      onDrop={handleDrop}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      tabIndex={1}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      style={{ cursor }}
    >
      <Diagram value={state} transform={transform} onChange={handleChange} onAddHistory={handleAddHistory} />
      <NodeList />
      <Toolbar undo={undo} redo={redo} canUndo={canUndo} scale={transform.scale} canRedo={canRedo} />
    </div>
  )
}

export default DiagramPanel