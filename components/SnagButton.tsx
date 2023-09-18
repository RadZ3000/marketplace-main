import { FC, ReactNode, useState, MouseEventHandler } from 'react'
import { Organization } from 'context/config'
import * as Dialog from '@radix-ui/react-dialog'
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"

type Props = {
  classType: "Dialog" | "DropdownMenu" | "Link",
  backgroundColorOverride?: string,
  className?: string,
  isPrimary?: boolean
  disabled?: boolean
  externalLink?: boolean
  href?: string
  organization: Organization
  children: ReactNode
  onClick?: MouseEventHandler<HTMLButtonElement> | undefined
}

const SnagButton: FC<Props> = ({
  classType,
  className = "",
  organization,
  children,
  isPrimary = false,
  disabled = false,
  externalLink = false,
  backgroundColorOverride,
  href,
  onClick,
}) => {
  const [hover, setHover] = useState<boolean>(false)

  const includeBoxShadow = Boolean(organization.primaryButtonBoxShadow)
  const borderColor = (hover && includeBoxShadow && !disabled) ? (organization.primaryOutlineColorHex || "#959DA6") : (isPrimary ? "transparent" : (organization.secondaryOutlineColorHex || "#CFD8DC"))
  const style = {
    backgroundColor: backgroundColorOverride || (isPrimary ? (hover && !disabled && organization.primaryColorHoverHex) || organization.primaryColorHex : (hover && !disabled ? (organization.secondaryButtonHoverColorHex || "#F8F9FA") : organization.secondaryButtonColorHex || "#FFFFFF")),
    borderColor,
    opacity: disabled ? 0.5 : ((isPrimary && hover) ? 0.8 : 1),
    boxShadow: hover && includeBoxShadow && !disabled ? `${organization.primaryButtonBoxShadow}px ${organization.primaryButtonBoxShadow}px 0px 0px ${borderColor}` : "",
    transform: hover && includeBoxShadow && !disabled ? `translateY(-${organization.primaryButtonBoxShadow}px) translateX(-${organization.primaryButtonBoxShadow}px)` : "",
    color: isPrimary ? "#FFFFFF" : (organization.primaryFontColorHex || "#000000"),
    cursor: disabled ? 'default' : 'pointer',
    pointerEvents: disabled ? 'none' : '',
  }
  const classNameTotal = `outline-none cursor-pointer disabled:cursor-default border rounded-full font-semibold transition whitespace-nowrap disabled:opacity-50 ${className} `
  
  let TriggerClass: any = "a"
  switch(classType) {
    case "Dialog":
      TriggerClass = Dialog.Trigger
      break;
    case "DropdownMenu":
      TriggerClass = DropdownMenu.Trigger
      break;
    case "Link":
      TriggerClass = "a"
      break;
  }

  return (
    <TriggerClass
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => {
        setHover(true)
      }}
      onMouseLeave={() => {
        setHover(false)
      }}
      style={style}
      className={classNameTotal}
      target={externalLink ? "_blank" : ""}
      rel={ externalLink ? "noreferrer" : ""}
      href={href}
    >
      {children}
    </TriggerClass>
  );
}

export default SnagButton
