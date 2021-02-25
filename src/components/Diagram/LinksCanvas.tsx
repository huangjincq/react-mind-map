import React, { useCallback } from 'react'
import { Link } from './Link'
import { ILinkType, INodeType, ICoordinateType } from '../../types'

interface LinkCanvasProps {
  nodes: INodeType[]
  links: ILinkType[]
  onDelete: (link: ILinkType) => void
}

/*
 * link 起点终点 数据类型
 * */
export interface EntityPutType {
  type: 'node' | 'port'
  id: string
  coordinates: ICoordinateType
}

/*
 * 组装 link 起点终点 的 type 类型 和 父级元素的 坐标位置
 * */
const findPortParentNodeInfo = (nodes: INodeType[], entityId: string): EntityPutType | undefined => {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    if (node.id === entityId) {
      return {type: 'node', coordinates: node.coordinates, id: entityId}
    } else {
      for (let j = 0; j < node.inputs.length; j++) {
        const input = node.inputs[j]
        if (input.id === entityId) {
          return {type: 'port', coordinates: node.coordinates, id: entityId}
        }
      }

      for (let k = 0; k < node.outputs.length; k++) {
        const output = node.outputs[k]
        if (output.id === entityId) {
          return {type: 'port', coordinates: node.coordinates, id: entityId}
        }
      }
    }
  }
}

export const LinksCanvas: React.FC<LinkCanvasProps> = React.memo((props) => {
  const {nodes, onDelete, links} = props

  return (
    <svg className="diagram-link-canvas">
      {links && links.map((link) => (
        <Link
          link={link}
          input={findPortParentNodeInfo(nodes, link.input)}
          output={findPortParentNodeInfo(nodes, link.output)}
          onDelete={onDelete}
          key={`${link.input}-${link.output}`}
        />
      ))}
    </svg>
  )
})
LinksCanvas.displayName = 'LinksCanvas'

