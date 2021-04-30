import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import useDrag from '../../hooks/useDrag'
import { INodeType, ICoordinateType } from '../../types'
import { nodesConfig } from '../NodeTypes/config'
import { isEqual } from 'lodash-es'
import { useScale } from '../Context/DiagramManager'
import { DiagramNodePorts } from './DiagramNodePorts'
import classnames from 'classnames'
import { DiagramNodeActionButtons } from './DiagramNodeActionButtons'
import eventBus, { EVENT_NODE_MOVE_END, EVENT_NODE_MOVING } from '../../utils/eventBus'

interface DiagramNodeProps {
  nodeInfo: INodeType
  onNodePositionChange: (id: string, nextCoords: ICoordinateType, info: any) => void
  onNodeValueChange: (id: string, nextNodeValue: any) => void
  onAddHistory: (id: string, nextCoords: ICoordinateType) => void
  onNodeMount: (id: string, dom: HTMLDivElement) => void
  onPortMount: (id: string, dom: HTMLElement) => void
  onDragNewSegment: (id: string, from: ICoordinateType, to: ICoordinateType) => void
  onSegmentFail: (id: string, type: string) => void
  onSegmentConnect: (id: string, targetPort: string) => void
  onShowSelectModel: (event: MouseEvent, input: string) => void
  onNodeDelete: (nodeId: string) => void
  onNodeCopy: (nodeId: string) => void
  onToggleActiveNodeId: (nodeId: string) => void
  isActive: boolean
}

export const DiagramNode: React.FC<DiagramNodeProps> = React.memo((props) => {
  const {
    nodeInfo,
    onNodeValueChange,
    onNodePositionChange,
    onPortMount,
    onDragNewSegment,
    onNodeMount,
    onSegmentFail,
    onSegmentConnect,
    onShowSelectModel,
    onAddHistory,
    onToggleActiveNodeId,
    isActive,
    onNodeDelete,
    onNodeCopy,
  } = props

  const { id, coordinates, type, inputs, data, outputs } = nodeInfo

  const scale = useScale()

  // nodeType
  const component = nodesConfig[type]?.component

  const handleNodeDataChange = (nextNodeData: any) => {
    onNodeValueChange(id, nextNodeData)
  }

  // 传给子组件点 Props
  const nodeItemProps = {
    value: data,
    onChange: handleNodeDataChange,
  }

  const ref: any = useRef(null)

  const { onDragStart, onDrag, onDragEnd } = useDrag({ throttleBy: 14, ref }) // get the drag n drop methods
  const dragStartPoint = useRef(coordinates) // keeps the drag start point in a persistent reference

  // when drag starts, save the starting coordinates into the `dragStartPoint` ref
  onDragStart(() => {
    dragStartPoint.current = coordinates
  })

  // whilst dragging calculates the next coordinates and perform the `onNodePositionChange` callback
  onDrag((event: MouseEvent, info: any) => {
    event.stopImmediatePropagation()
    event.stopPropagation()
    const nextCoords: ICoordinateType = [
      dragStartPoint.current[0] + info.offset[0] / scale,
      dragStartPoint.current[1] + info.offset[1] / scale,
    ]

    onNodePositionChange(id, nextCoords, info)
    eventBus.emit(EVENT_NODE_MOVING, id, nextCoords)
  })

  onDragEnd((event: MouseEvent) => {
    if (!isEqual(dragStartPoint.current, coordinates)) {
      onAddHistory(id, dragStartPoint.current)
    }
    eventBus.emit(EVENT_NODE_MOVE_END)
  })

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (event.shiftKey) {
        onToggleActiveNodeId(id)
      }
    },
    [id, onToggleActiveNodeId]
  )

  const options = { nodeId: id, onPortMount, onDragNewSegment, onSegmentFail, onSegmentConnect, onShowSelectModel }

  useEffect(() => {
    onNodeMount(id, ref.current)
  }, [id, onNodeMount])

  const className = useMemo(() => {
    return classnames('diagram-node', {
      active: isActive,
    })
  }, [isActive])

  return (
    <div
      id={id}
      className={className}
      ref={ref}
      style={{ left: Math.floor(coordinates[0]), top: Math.floor(coordinates[1]) }}
      onClick={handleClick}
    >
      {component && React.createElement(component, nodeItemProps)}
      <DiagramNodePorts inputs={inputs} {...options} type="input" />
      <DiagramNodePorts inputs={outputs} {...options} type="output" />
      <DiagramNodeActionButtons id={id} onNodeDelete={onNodeDelete} onNodeCopy={onNodeCopy} />
    </div>
  )
})

DiagramNode.displayName = 'DiagramNode'
