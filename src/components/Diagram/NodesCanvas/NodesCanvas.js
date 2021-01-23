import React from 'react'
import PropTypes from 'prop-types'
import { NodeType } from '../../shared/Types'
import { DiagramNode } from '../DiagramNode/DiagramNode'
import updateNodeCoordinates from './updateNodeCoordinates'

/**
 * Handles the nodes' events and business logic
 */
const NodesCanvas = (props) => {
  const {
    nodes,
    onPortRegister,
    onNodeRegister,
    onNodeRemove,
    onDragNewSegment,
    onSegmentFail,
    onSegmentConnect,
    onChange,
    scale,
    onAddHistory
  } = props

  // when a node item update its position updates it within the nodes array
  const onNodePositionChange = (nodeId, newCoordinates) => {
    if (onChange) {
      const nextNodes = updateNodeCoordinates(nodeId, newCoordinates, nodes)
      onChange(nextNodes)
    }
  }

  const handleAddHistory = (nodeId, newCoordinates) => {
    if (onAddHistory) {
      const nextNodes = updateNodeCoordinates(nodeId, newCoordinates, nodes)
      onAddHistory(nextNodes)
    }
  }


  return nodes && nodes.length > 0 && nodes.map((node) => (
    <DiagramNode
      nodeInfo={node}
      scale={scale}
      onPositionChange={onNodePositionChange}
      onPortRegister={onPortRegister}
      onNodeRemove={onNodeRemove}
      onDragNewSegment={onDragNewSegment}
      onSegmentFail={onSegmentFail}
      onSegmentConnect={onSegmentConnect}
      onMount={onNodeRegister}
      onAddHistory={handleAddHistory}
      key={node.id}
    />
  ))
}

NodesCanvas.propTypes = {
  nodes: PropTypes.arrayOf(NodeType),
  onChange: PropTypes.func,
  onNodeRegister: PropTypes.func,
  onPortRegister: PropTypes.func,
  onNodeRemove: PropTypes.func,
  onDragNewSegment: PropTypes.func,
  onSegmentFail: PropTypes.func,
  onSegmentConnect: PropTypes.func
}

NodesCanvas.defaultProps = {
  nodes: [],
  onChange: undefined,
  onNodeRegister: undefined,
  onPortRegister: undefined,
  onNodeRemove: undefined,
  onDragNewSegment: undefined,
  onSegmentFail: undefined,
  onSegmentConnect: undefined
}

export default React.memo(NodesCanvas)
