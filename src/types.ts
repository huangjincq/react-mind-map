export interface IPointType {
  id: string,
  disabled: boolean
}

export type ICoordinateType = [number, number]


export interface INodeType {
  id: string,
  type: 'node-type-1' | 'node-type-2',
  inputs: IPointType[],
  outputs: IPointType[],
  coordinates: ICoordinateType,
  data: any
}

export interface ILinkType {
  input: string,
  output: string
}

export interface IDiagramType {
  nodes: INodeType[],
  links: ILinkType[]
}