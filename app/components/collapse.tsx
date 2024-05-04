import { createContext, useContext, useEffect, useRef, useState } from "react"

type UseCollapseArgs = Partial<{
  defaultCollapsed: boolean,
}>

function useCollapse(args?: UseCollapseArgs) {
  const [isCollapsed, setCollapsed] = useState(args?.defaultCollapsed ?? false)
  return {
    isCollapsed,
    toggleCollapsed: () => setCollapsed(!isCollapsed),
  }
}

type CollapseProps = {
  children: (toggleCollapsed: () => void, isCollapsed: boolean) => React.ReactElement,
  defaultCollapsed?: boolean,
  transition?: string,
  collapseDirection?: 'up' | 'down'
}

export function Collapse({
  children,
  defaultCollapsed,
  transition,
  collapseDirection
} : CollapseProps) {
  const { toggleCollapsed, isCollapsed } = useCollapse({
    defaultCollapsed: defaultCollapsed ?? false
  })
  return (
    <CollapsableContext.Provider value={{
      toggleCollapsed,
      isCollapsed,
      transition: transition || '0.3s ease',
      collapseDirection: collapseDirection || 'down'
    }}>
      {children(toggleCollapsed, isCollapsed)}
    </CollapsableContext.Provider>
  )
}

const CollapsableContext = createContext({
  isCollapsed: false,
  toggleCollapsed: () => {},
  transition: '0.3s ease',
  collapseDirection: 'down'
})

export function Collapsable({
  children
}: {
  children: React.ReactElement | React.ReactElement[]
}) {
  const { isCollapsed, transition, collapseDirection } = useContext(CollapsableContext)
  const ref = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    if (ref.current) {
      setContentHeight(ref.current.clientHeight);
    }
  }, [children]);

  return (
    <div style={{
      height: isCollapsed ? collapseDirection === 'up' ? 500 : 0 : contentHeight,
      transition,
      opacity: isCollapsed ? 0 : 1,
    }}>
      <div ref={ref}>
        {children}
      </div>
    </div>
  )
}