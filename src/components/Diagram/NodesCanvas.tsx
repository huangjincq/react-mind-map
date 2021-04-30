import React from 'react'
import { DiagramNode } from './DiagramNode'
import { ICoordinateType, INodeType } from '../../types'

interface NodesCanvasProps {
  nodes: INodeType[]
  onNodeMount: (id: string, dom: HTMLDivElement) => void
  onPortMount: (id: string, dom: HTMLElement) => void
  onDragNewSegment: (id: string, from: ICoordinateType, to: ICoordinateType) => void
  onSegmentFail: (id: string, type: string) => void
  onSegmentConnect: (id: string, targetPort: string) => void
  onShowSelectModel: (event: MouseEvent, input: string) => void
  activeNodeIds: string[]
  onNodePositionChange: (id: string, nextCoords: ICoordinateType, info: any) => void
  onNodeValueChange: (id: string, nextNodeValue: any) => void
  onAddHistory: (id: string, nextCoords: ICoordinateType) => void
  onNodeDelete: (nodeId: string) => void
  onNodeCopy: (nodeId: string) => void
  onToggleActiveNodeId: (nodeId: string) => void
}

export const NodesCanvas: React.FC<NodesCanvasProps> = React.memo((props) => {
  const { nodes, activeNodeIds, ...others } = props

  return (
    <>
      {nodes.map((node) => (
        <DiagramNode isActive={activeNodeIds.includes(node.id)} nodeInfo={node} key={node.id} {...others} />
      ))}
    </>
  )
})

NodesCanvas.displayName = 'NodesCanvas'
