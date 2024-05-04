import { Checkbox } from "@nextui-org/react"
import { useEffect, useState } from "react"

export function Selectable({
  children,
  isSelecting,
  defaultSelected,
  onClick
}: {
  children: JSX.Element | JSX.Element[],
  isSelecting?: boolean,
  onClick: (isSelected: boolean) => void
  defaultSelected?: boolean
}) {

  const [isSelected, setSelected] = useState(defaultSelected ?? false)

  useEffect(() => {
    setSelected(defaultSelected ?? false);
  }, [defaultSelected]);
  
  const action = () => {
    const newValue = !isSelected
    setSelected(newValue)
    onClick(newValue)
  }

  return (
    <div className="flex flex-row gap-4">
      {isSelecting && <Checkbox isSelected={isSelected} onClick={action}/>}
      <div className={isSelecting ? 'transition hover:brightness-95' : ''} onClick={() => isSelecting && action()} onKeyDown={(e) => isSelecting && e.code === 'Space' && action()} role="button" tabIndex={0}>
        <div style={{ pointerEvents: isSelecting ? 'none' : 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  )
}