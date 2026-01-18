/**
 * Icon component using phosphor-icons-solid
 * Tree-shakeable SVG icon components (~1-2KB per icon)
 */

import type { Component, JSX } from 'solid-js'
import { splitProps } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { cn } from '@/lib/utils'

// Regular weight
import IconHouseRegular from 'phosphor-icons-solid/IconHouseRegular'
import IconChatCircleRegular from 'phosphor-icons-solid/IconChatCircleRegular'
import IconUserRegular from 'phosphor-icons-solid/IconUserRegular'
import IconHeartRegular from 'phosphor-icons-solid/IconHeartRegular'
import IconXRegular from 'phosphor-icons-solid/IconXRegular'
import IconCheckRegular from 'phosphor-icons-solid/IconCheckRegular'
import IconGearRegular from 'phosphor-icons-solid/IconGearRegular'
import IconCaretLeftRegular from 'phosphor-icons-solid/IconCaretLeftRegular'
import IconCaretRightRegular from 'phosphor-icons-solid/IconCaretRightRegular'
import IconPaperPlaneRightRegular from 'phosphor-icons-solid/IconPaperPlaneRightRegular'
import IconMagnifyingGlassRegular from 'phosphor-icons-solid/IconMagnifyingGlassRegular'
import IconBellRegular from 'phosphor-icons-solid/IconBellRegular'
import IconCameraRegular from 'phosphor-icons-solid/IconCameraRegular'
import IconImageRegular from 'phosphor-icons-solid/IconImageRegular'
import IconSparkleRegular from 'phosphor-icons-solid/IconSparkleRegular'
import IconShieldCheckRegular from 'phosphor-icons-solid/IconShieldCheckRegular'
import IconGlobeRegular from 'phosphor-icons-solid/IconGlobeRegular'
import IconLinkRegular from 'phosphor-icons-solid/IconLinkRegular'
import IconMusicNoteRegular from 'phosphor-icons-solid/IconMusicNoteRegular'
import IconMapPinRegular from 'phosphor-icons-solid/IconMapPinRegular'
import IconStarRegular from 'phosphor-icons-solid/IconStarRegular'
import IconWarningRegular from 'phosphor-icons-solid/IconWarningRegular'
import IconInfoRegular from 'phosphor-icons-solid/IconInfoRegular'
import IconSignOutRegular from 'phosphor-icons-solid/IconSignOutRegular'
import IconPlusRegular from 'phosphor-icons-solid/IconPlusRegular'
import IconDotsThreeRegular from 'phosphor-icons-solid/IconDotsThreeRegular'
import IconCopyRegular from 'phosphor-icons-solid/IconCopyRegular'
import IconPencilRegular from 'phosphor-icons-solid/IconPencilRegular'
import IconTrashRegular from 'phosphor-icons-solid/IconTrashRegular'
import IconEyeRegular from 'phosphor-icons-solid/IconEyeRegular'
import IconEyeSlashRegular from 'phosphor-icons-solid/IconEyeSlashRegular'
import IconCircleNotchRegular from 'phosphor-icons-solid/IconCircleNotchRegular'
import IconCheckCircleRegular from 'phosphor-icons-solid/IconCheckCircleRegular'
import IconXCircleRegular from 'phosphor-icons-solid/IconXCircleRegular'
import IconWifiHighRegular from 'phosphor-icons-solid/IconWifiHighRegular'
import IconWifiSlashRegular from 'phosphor-icons-solid/IconWifiSlashRegular'
import IconLockSimpleRegular from 'phosphor-icons-solid/IconLockSimpleRegular'
import IconUserCircleRegular from 'phosphor-icons-solid/IconUserCircleRegular'
import IconUsersRegular from 'phosphor-icons-solid/IconUsersRegular'
import IconSealCheckRegular from 'phosphor-icons-solid/IconSealCheckRegular'
import IconTimerRegular from 'phosphor-icons-solid/IconTimerRegular'
import IconCaretDownRegular from 'phosphor-icons-solid/IconCaretDownRegular'
import IconFingerprintRegular from 'phosphor-icons-solid/IconFingerprintRegular'
import IconPhoneRegular from 'phosphor-icons-solid/IconPhoneRegular'
import IconMicrophoneRegular from 'phosphor-icons-solid/IconMicrophoneRegular'
import IconMicrophoneSlashRegular from 'phosphor-icons-solid/IconMicrophoneSlashRegular'
import IconPhoneDisconnectRegular from 'phosphor-icons-solid/IconPhoneDisconnectRegular'
import IconSpeakerHighRegular from 'phosphor-icons-solid/IconSpeakerHighRegular'
import IconFunnelRegular from 'phosphor-icons-solid/IconFunnelRegular'
import IconWalletRegular from 'phosphor-icons-solid/IconWalletRegular'
import IconArrowLeftRegular from 'phosphor-icons-solid/IconArrowLeftRegular'
import IconStorefrontRegular from 'phosphor-icons-solid/IconStorefrontRegular'
import IconWineRegular from 'phosphor-icons-solid/IconWineRegular'
import IconFireRegular from 'phosphor-icons-solid/IconFireRegular'
import IconBriefcaseRegular from 'phosphor-icons-solid/IconBriefcaseRegular'
import IconPersonRegular from 'phosphor-icons-solid/IconPersonRegular'

// Fill weight
import IconHouseFill from 'phosphor-icons-solid/IconHouseFill'
import IconChatCircleFill from 'phosphor-icons-solid/IconChatCircleFill'
import IconUserFill from 'phosphor-icons-solid/IconUserFill'
import IconHeartFill from 'phosphor-icons-solid/IconHeartFill'
import IconXFill from 'phosphor-icons-solid/IconXFill'
import IconCheckFill from 'phosphor-icons-solid/IconCheckFill'
import IconGearFill from 'phosphor-icons-solid/IconGearFill'
import IconCaretLeftFill from 'phosphor-icons-solid/IconCaretLeftFill'
import IconCaretRightFill from 'phosphor-icons-solid/IconCaretRightFill'
import IconPaperPlaneRightFill from 'phosphor-icons-solid/IconPaperPlaneRightFill'
import IconMagnifyingGlassFill from 'phosphor-icons-solid/IconMagnifyingGlassFill'
import IconBellFill from 'phosphor-icons-solid/IconBellFill'
import IconCameraFill from 'phosphor-icons-solid/IconCameraFill'
import IconImageFill from 'phosphor-icons-solid/IconImageFill'
import IconSparkleFill from 'phosphor-icons-solid/IconSparkleFill'
import IconShieldCheckFill from 'phosphor-icons-solid/IconShieldCheckFill'
import IconGlobeFill from 'phosphor-icons-solid/IconGlobeFill'
import IconLinkFill from 'phosphor-icons-solid/IconLinkFill'
import IconMusicNoteFill from 'phosphor-icons-solid/IconMusicNoteFill'
import IconMapPinFill from 'phosphor-icons-solid/IconMapPinFill'
import IconStarFill from 'phosphor-icons-solid/IconStarFill'
import IconWarningFill from 'phosphor-icons-solid/IconWarningFill'
import IconInfoFill from 'phosphor-icons-solid/IconInfoFill'
import IconSignOutFill from 'phosphor-icons-solid/IconSignOutFill'
import IconPlusFill from 'phosphor-icons-solid/IconPlusFill'
import IconDotsThreeFill from 'phosphor-icons-solid/IconDotsThreeFill'
import IconCopyFill from 'phosphor-icons-solid/IconCopyFill'
import IconPencilFill from 'phosphor-icons-solid/IconPencilFill'
import IconTrashFill from 'phosphor-icons-solid/IconTrashFill'
import IconEyeFill from 'phosphor-icons-solid/IconEyeFill'
import IconEyeSlashFill from 'phosphor-icons-solid/IconEyeSlashFill'
import IconCircleNotchFill from 'phosphor-icons-solid/IconCircleNotchFill'
import IconCheckCircleFill from 'phosphor-icons-solid/IconCheckCircleFill'
import IconXCircleFill from 'phosphor-icons-solid/IconXCircleFill'
import IconWifiHighFill from 'phosphor-icons-solid/IconWifiHighFill'
import IconWifiSlashFill from 'phosphor-icons-solid/IconWifiSlashFill'
import IconLockSimpleFill from 'phosphor-icons-solid/IconLockSimpleFill'
import IconUserCircleFill from 'phosphor-icons-solid/IconUserCircleFill'
import IconUsersFill from 'phosphor-icons-solid/IconUsersFill'
import IconSealCheckFill from 'phosphor-icons-solid/IconSealCheckFill'
import IconTimerFill from 'phosphor-icons-solid/IconTimerFill'
import IconCaretDownFill from 'phosphor-icons-solid/IconCaretDownFill'
import IconFingerprintFill from 'phosphor-icons-solid/IconFingerprintFill'
import IconPhoneFill from 'phosphor-icons-solid/IconPhoneFill'
import IconMicrophoneFill from 'phosphor-icons-solid/IconMicrophoneFill'
import IconMicrophoneSlashFill from 'phosphor-icons-solid/IconMicrophoneSlashFill'
import IconPhoneDisconnectFill from 'phosphor-icons-solid/IconPhoneDisconnectFill'
import IconSpeakerHighFill from 'phosphor-icons-solid/IconSpeakerHighFill'
import IconFunnelFill from 'phosphor-icons-solid/IconFunnelFill'
import IconWalletFill from 'phosphor-icons-solid/IconWalletFill'
import IconArrowLeftFill from 'phosphor-icons-solid/IconArrowLeftFill'
import IconStorefrontFill from 'phosphor-icons-solid/IconStorefrontFill'
import IconWineFill from 'phosphor-icons-solid/IconWineFill'
import IconFireFill from 'phosphor-icons-solid/IconFireFill'
import IconBriefcaseFill from 'phosphor-icons-solid/IconBriefcaseFill'
import IconPersonFill from 'phosphor-icons-solid/IconPersonFill'

// Bold weight
import IconHouseBold from 'phosphor-icons-solid/IconHouseBold'
import IconChatCircleBold from 'phosphor-icons-solid/IconChatCircleBold'
import IconUserBold from 'phosphor-icons-solid/IconUserBold'
import IconHeartBold from 'phosphor-icons-solid/IconHeartBold'
import IconXBold from 'phosphor-icons-solid/IconXBold'
import IconCheckBold from 'phosphor-icons-solid/IconCheckBold'
import IconGearBold from 'phosphor-icons-solid/IconGearBold'
import IconCaretLeftBold from 'phosphor-icons-solid/IconCaretLeftBold'
import IconCaretRightBold from 'phosphor-icons-solid/IconCaretRightBold'
import IconPaperPlaneRightBold from 'phosphor-icons-solid/IconPaperPlaneRightBold'
import IconMagnifyingGlassBold from 'phosphor-icons-solid/IconMagnifyingGlassBold'
import IconBellBold from 'phosphor-icons-solid/IconBellBold'
import IconCameraBold from 'phosphor-icons-solid/IconCameraBold'
import IconImageBold from 'phosphor-icons-solid/IconImageBold'
import IconSparkleBold from 'phosphor-icons-solid/IconSparkleBold'
import IconShieldCheckBold from 'phosphor-icons-solid/IconShieldCheckBold'
import IconGlobeBold from 'phosphor-icons-solid/IconGlobeBold'
import IconLinkBold from 'phosphor-icons-solid/IconLinkBold'
import IconMusicNoteBold from 'phosphor-icons-solid/IconMusicNoteBold'
import IconMapPinBold from 'phosphor-icons-solid/IconMapPinBold'
import IconStarBold from 'phosphor-icons-solid/IconStarBold'
import IconWarningBold from 'phosphor-icons-solid/IconWarningBold'
import IconInfoBold from 'phosphor-icons-solid/IconInfoBold'
import IconSignOutBold from 'phosphor-icons-solid/IconSignOutBold'
import IconPlusBold from 'phosphor-icons-solid/IconPlusBold'
import IconDotsThreeBold from 'phosphor-icons-solid/IconDotsThreeBold'
import IconCopyBold from 'phosphor-icons-solid/IconCopyBold'
import IconPencilBold from 'phosphor-icons-solid/IconPencilBold'
import IconTrashBold from 'phosphor-icons-solid/IconTrashBold'
import IconEyeBold from 'phosphor-icons-solid/IconEyeBold'
import IconEyeSlashBold from 'phosphor-icons-solid/IconEyeSlashBold'
import IconCircleNotchBold from 'phosphor-icons-solid/IconCircleNotchBold'
import IconCheckCircleBold from 'phosphor-icons-solid/IconCheckCircleBold'
import IconXCircleBold from 'phosphor-icons-solid/IconXCircleBold'
import IconWifiHighBold from 'phosphor-icons-solid/IconWifiHighBold'
import IconWifiSlashBold from 'phosphor-icons-solid/IconWifiSlashBold'
import IconLockSimpleBold from 'phosphor-icons-solid/IconLockSimpleBold'
import IconUserCircleBold from 'phosphor-icons-solid/IconUserCircleBold'
import IconUsersBold from 'phosphor-icons-solid/IconUsersBold'
import IconSealCheckBold from 'phosphor-icons-solid/IconSealCheckBold'
import IconTimerBold from 'phosphor-icons-solid/IconTimerBold'
import IconCaretDownBold from 'phosphor-icons-solid/IconCaretDownBold'
import IconFingerprintBold from 'phosphor-icons-solid/IconFingerprintBold'
import IconPhoneBold from 'phosphor-icons-solid/IconPhoneBold'
import IconMicrophoneBold from 'phosphor-icons-solid/IconMicrophoneBold'
import IconMicrophoneSlashBold from 'phosphor-icons-solid/IconMicrophoneSlashBold'
import IconPhoneDisconnectBold from 'phosphor-icons-solid/IconPhoneDisconnectBold'
import IconSpeakerHighBold from 'phosphor-icons-solid/IconSpeakerHighBold'
import IconFunnelBold from 'phosphor-icons-solid/IconFunnelBold'
import IconWalletBold from 'phosphor-icons-solid/IconWalletBold'
import IconArrowLeftBold from 'phosphor-icons-solid/IconArrowLeftBold'
import IconStorefrontBold from 'phosphor-icons-solid/IconStorefrontBold'
import IconWineBold from 'phosphor-icons-solid/IconWineBold'
import IconFireBold from 'phosphor-icons-solid/IconFireBold'
import IconBriefcaseBold from 'phosphor-icons-solid/IconBriefcaseBold'
import IconPersonBold from 'phosphor-icons-solid/IconPersonBold'

export type IconWeight = 'regular' | 'fill' | 'bold'

export type IconName =
  | 'house'
  | 'chat-circle'
  | 'user'
  | 'heart'
  | 'x'
  | 'check'
  | 'gear'
  | 'caret-left'
  | 'caret-right'
  | 'paper-plane-right'
  | 'magnifying-glass'
  | 'bell'
  | 'camera'
  | 'image'
  | 'sparkle'
  | 'shield-check'
  | 'globe'
  | 'link'
  | 'music-note'
  | 'map-pin'
  | 'star'
  | 'warning'
  | 'info'
  | 'sign-out'
  | 'plus'
  | 'dots-three'
  | 'copy'
  | 'pencil'
  | 'trash'
  | 'eye'
  | 'eye-slash'
  | 'circle-notch'
  | 'check-circle'
  | 'x-circle'
  | 'wifi-high'
  | 'wifi-slash'
  | 'lock-simple'
  | 'user-circle'
  | 'users'
  | 'seal-check'
  | 'timer'
  | 'caret-down'
  | 'fingerprint'
  | 'phone'
  | 'microphone'
  | 'microphone-slash'
  | 'phone-disconnect'
  | 'speaker-high'
  | 'funnel'
  | 'wallet'
  | 'arrow-left'
  | 'storefront'
  | 'wine'
  | 'fire'
  | 'briefcase'
  | 'person'

const iconMap: Record<IconName, Record<IconWeight, Component<{ class?: string }>>> = {
  'house': { regular: IconHouseRegular, fill: IconHouseFill, bold: IconHouseBold },
  'chat-circle': { regular: IconChatCircleRegular, fill: IconChatCircleFill, bold: IconChatCircleBold },
  'user': { regular: IconUserRegular, fill: IconUserFill, bold: IconUserBold },
  'heart': { regular: IconHeartRegular, fill: IconHeartFill, bold: IconHeartBold },
  'x': { regular: IconXRegular, fill: IconXFill, bold: IconXBold },
  'check': { regular: IconCheckRegular, fill: IconCheckFill, bold: IconCheckBold },
  'gear': { regular: IconGearRegular, fill: IconGearFill, bold: IconGearBold },
  'caret-left': { regular: IconCaretLeftRegular, fill: IconCaretLeftFill, bold: IconCaretLeftBold },
  'caret-right': { regular: IconCaretRightRegular, fill: IconCaretRightFill, bold: IconCaretRightBold },
  'paper-plane-right': { regular: IconPaperPlaneRightRegular, fill: IconPaperPlaneRightFill, bold: IconPaperPlaneRightBold },
  'magnifying-glass': { regular: IconMagnifyingGlassRegular, fill: IconMagnifyingGlassFill, bold: IconMagnifyingGlassBold },
  'bell': { regular: IconBellRegular, fill: IconBellFill, bold: IconBellBold },
  'camera': { regular: IconCameraRegular, fill: IconCameraFill, bold: IconCameraBold },
  'image': { regular: IconImageRegular, fill: IconImageFill, bold: IconImageBold },
  'sparkle': { regular: IconSparkleRegular, fill: IconSparkleFill, bold: IconSparkleBold },
  'shield-check': { regular: IconShieldCheckRegular, fill: IconShieldCheckFill, bold: IconShieldCheckBold },
  'globe': { regular: IconGlobeRegular, fill: IconGlobeFill, bold: IconGlobeBold },
  'link': { regular: IconLinkRegular, fill: IconLinkFill, bold: IconLinkBold },
  'music-note': { regular: IconMusicNoteRegular, fill: IconMusicNoteFill, bold: IconMusicNoteBold },
  'map-pin': { regular: IconMapPinRegular, fill: IconMapPinFill, bold: IconMapPinBold },
  'star': { regular: IconStarRegular, fill: IconStarFill, bold: IconStarBold },
  'warning': { regular: IconWarningRegular, fill: IconWarningFill, bold: IconWarningBold },
  'info': { regular: IconInfoRegular, fill: IconInfoFill, bold: IconInfoBold },
  'sign-out': { regular: IconSignOutRegular, fill: IconSignOutFill, bold: IconSignOutBold },
  'plus': { regular: IconPlusRegular, fill: IconPlusFill, bold: IconPlusBold },
  'dots-three': { regular: IconDotsThreeRegular, fill: IconDotsThreeFill, bold: IconDotsThreeBold },
  'copy': { regular: IconCopyRegular, fill: IconCopyFill, bold: IconCopyBold },
  'pencil': { regular: IconPencilRegular, fill: IconPencilFill, bold: IconPencilBold },
  'trash': { regular: IconTrashRegular, fill: IconTrashFill, bold: IconTrashBold },
  'eye': { regular: IconEyeRegular, fill: IconEyeFill, bold: IconEyeBold },
  'eye-slash': { regular: IconEyeSlashRegular, fill: IconEyeSlashFill, bold: IconEyeSlashBold },
  'circle-notch': { regular: IconCircleNotchRegular, fill: IconCircleNotchFill, bold: IconCircleNotchBold },
  'check-circle': { regular: IconCheckCircleRegular, fill: IconCheckCircleFill, bold: IconCheckCircleBold },
  'x-circle': { regular: IconXCircleRegular, fill: IconXCircleFill, bold: IconXCircleBold },
  'wifi-high': { regular: IconWifiHighRegular, fill: IconWifiHighFill, bold: IconWifiHighBold },
  'wifi-slash': { regular: IconWifiSlashRegular, fill: IconWifiSlashFill, bold: IconWifiSlashBold },
  'lock-simple': { regular: IconLockSimpleRegular, fill: IconLockSimpleFill, bold: IconLockSimpleBold },
  'user-circle': { regular: IconUserCircleRegular, fill: IconUserCircleFill, bold: IconUserCircleBold },
  'users': { regular: IconUsersRegular, fill: IconUsersFill, bold: IconUsersBold },
  'seal-check': { regular: IconSealCheckRegular, fill: IconSealCheckFill, bold: IconSealCheckBold },
  'timer': { regular: IconTimerRegular, fill: IconTimerFill, bold: IconTimerBold },
  'caret-down': { regular: IconCaretDownRegular, fill: IconCaretDownFill, bold: IconCaretDownBold },
  'fingerprint': { regular: IconFingerprintRegular, fill: IconFingerprintFill, bold: IconFingerprintBold },
  'phone': { regular: IconPhoneRegular, fill: IconPhoneFill, bold: IconPhoneBold },
  'microphone': { regular: IconMicrophoneRegular, fill: IconMicrophoneFill, bold: IconMicrophoneBold },
  'microphone-slash': { regular: IconMicrophoneSlashRegular, fill: IconMicrophoneSlashFill, bold: IconMicrophoneSlashBold },
  'phone-disconnect': { regular: IconPhoneDisconnectRegular, fill: IconPhoneDisconnectFill, bold: IconPhoneDisconnectBold },
  'speaker-high': { regular: IconSpeakerHighRegular, fill: IconSpeakerHighFill, bold: IconSpeakerHighBold },
  'funnel': { regular: IconFunnelRegular, fill: IconFunnelFill, bold: IconFunnelBold },
  'wallet': { regular: IconWalletRegular, fill: IconWalletFill, bold: IconWalletBold },
  'arrow-left': { regular: IconArrowLeftRegular, fill: IconArrowLeftFill, bold: IconArrowLeftBold },
  'storefront': { regular: IconStorefrontRegular, fill: IconStorefrontFill, bold: IconStorefrontBold },
  'wine': { regular: IconWineRegular, fill: IconWineFill, bold: IconWineBold },
  'fire': { regular: IconFireRegular, fill: IconFireFill, bold: IconFireBold },
  'briefcase': { regular: IconBriefcaseRegular, fill: IconBriefcaseFill, bold: IconBriefcaseBold },
  'person': { regular: IconPersonRegular, fill: IconPersonFill, bold: IconPersonBold },
}

export interface IconProps extends JSX.HTMLAttributes<SVGSVGElement> {
  name: IconName
  weight?: IconWeight
}

export const Icon: Component<IconProps> = (props) => {
  const [local, others] = splitProps(props, ['name', 'weight', 'class'])

  const IconComponent = () => iconMap[local.name]?.[local.weight ?? 'regular']

  return (
    <Dynamic
      component={IconComponent()}
      class={cn(local.class)}
      {...others}
    />
  )
}
