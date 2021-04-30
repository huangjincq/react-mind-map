import { throttle } from 'lodash-es'
import { useRef, useCallback, useEffect } from 'react'
import { ICoordinateType } from '../types'

const DISABLED_DRAG_TAGS = ['INPUT', 'TEXTAREA']

interface DefaultOptions {
  ref: React.RefObject<any> | null
  throttleBy: number
}

interface InfoType {
  isDragging: boolean
  start: ICoordinateType
  end: ICoordinateType
  offset: ICoordinateType
}

const defaultOptions: DefaultOptions = {
  ref: null,
  throttleBy: 0,
}

const getEventCoordinates = (event: MouseEvent): ICoordinateType => [event.clientX, event.clientY]

/**
 * 创建一个持久回调引用
 * @param ref
 * @returns {Function}
 */
const CreateCallbackRef = (ref: any) =>
  useCallback(
    (callback) => {
      if (!ref.current || callback !== ref.current) {
        ref.current = callback
      }
    },
    [ref]
  )

const useDrag = (options = defaultOptions) => {
  const targetRef = options.ref
  const dragStartHandlerRef = useRef<any>()
  const dragHandlerRef = useRef<any>()
  const dragEndHandlerRef = useRef<any>()
  const preXRef = useRef(0)
  const { current: info } = useRef<InfoType>({ isDragging: false, start: [0, 0], end: [0, 0], offset: [0, 0] })

  const onDragStart = useCallback(
    (event) => {
      const targetTagName = event.target.tagName
      if (
        !info.isDragging &&
        targetRef?.current.contains(event.target) &&
        !DISABLED_DRAG_TAGS.includes(targetTagName)
      ) {
        info.isDragging = true
        info.end = [0, 0]
        info.offset = [0, 0]
        info.start = getEventCoordinates(event)

        if (dragStartHandlerRef.current) {
          dragStartHandlerRef.current(event, { ...info })
        }
      }
    },
    [targetRef, info, dragStartHandlerRef]
  )

  // eslint-disable-next-line
  const onDrag = useCallback(
    throttle((event) => {
      if (info.isDragging) {
        let direction = ''
        if (event.clientX > preXRef.current) {
          direction = 'right'
        }
        if (event.clientX < preXRef.current) {
          direction = 'left'
        }
        info.offset = [event.clientX - info.start[0], event.clientY - info.start[1]]

        if (dragHandlerRef.current) {
          dragHandlerRef.current(event, { ...info, direction })
        }
        preXRef.current = event.clientX
      }
    }, options.throttleBy),
    [targetRef, info, dragHandlerRef]
  )

  const onDragEnd = useCallback(
    (event) => {
      if (info.isDragging) {
        info.isDragging = false
        info.end = getEventCoordinates(event)

        if (dragEndHandlerRef.current) {
          dragEndHandlerRef.current(event, { ...info })
        }
      }
    },
    [info, dragEndHandlerRef]
  )

  useEffect(() => {
    const _onDragStart = (e: any) => onDragStart(e)
    const _onDrag = (e: any) => onDrag(e)
    const _onDragEnd = (e: any) => onDragEnd(e)

    if (targetRef?.current) {
      targetRef.current.addEventListener('mousedown', _onDragStart)
      document.addEventListener('mousemove', _onDrag)
      document.addEventListener('mouseup', _onDragEnd)
    }

    return () => {
      if (targetRef?.current) {
        // eslint-disable-next-line
        targetRef.current.removeEventListener('mousedown', _onDragStart)
        document.removeEventListener('mousemove', _onDrag)
        document.removeEventListener('mouseup', _onDragEnd)
      }
    }
  }, [targetRef, onDragStart, onDrag, onDragEnd])

  return {
    ref: targetRef,
    onDragStart: CreateCallbackRef(dragStartHandlerRef),
    onDrag: CreateCallbackRef(dragHandlerRef),
    onDragEnd: CreateCallbackRef(dragEndHandlerRef),
  }
}

export default useDrag
