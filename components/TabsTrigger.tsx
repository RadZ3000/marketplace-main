import { NextRouter } from 'next/router'
import { useState, FC } from 'react'
import { Organization } from 'context/config'
import * as Tabs from '@radix-ui/react-tabs'
import { toggleOnItem } from 'lib/router'
import { IconType } from 'react-icons';


type TabsTriggerProps = {
  id: string
  router: NextRouter,
  Icon: IconType
  name: string
  organization: Organization
}

const TabsTrigger: FC<TabsTriggerProps> = ({ id, router, Icon, name, organization }) => {
  const [hover, setHover] = useState(false)

  return (
    <Tabs.Trigger
      key={id}
      id={id}
      value={id}
      onMouseEnter={() => {
        setHover(true)
      }}
      onMouseLeave={() => {
        setHover(false)
      }}
      style={{
        borderColor: organization.primaryColorHex,
        backgroundColor: hover ? organization.secondaryButtonHoverColorHex || "#F8F9FA" : "",
        color: organization.primaryFontColorHex || "#000000",
      }}
      className={
        'flex justify-center group relative w-52 min-w-0 whitespace-nowrap opacity-40 hover:opacity-100 radix-state-active:opacity-100 radix-state-active:border-b-2 border-transparent py-3 rounded-t-lg'
      }
      onClick={() => toggleOnItem(router, 'tab', id)}
    >
      <div className="flex items-center gap-x-2">
        <Icon
          style={{
            color: organization.primaryFontColorHex || "#000000",
          }}
          size={16}
        />
        <span className="text-lg text-center">{name}</span>
      </div>
    </Tabs.Trigger>
  )
}

export default TabsTrigger
