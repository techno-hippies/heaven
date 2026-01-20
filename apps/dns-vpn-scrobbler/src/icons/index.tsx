/**
 * Icon component using phosphor-icons-solid
 * Scrobbler-specific icons only
 */

import type { Component, JSX } from 'solid-js'
import { splitProps } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { cn } from '@/lib/utils'

// Regular weight
import IconMusicNoteRegular from 'phosphor-icons-solid/IconMusicNoteRegular'
import IconPlayRegular from 'phosphor-icons-solid/IconPlayRegular'
import IconPauseRegular from 'phosphor-icons-solid/IconPauseRegular'
import IconCloudArrowUpRegular from 'phosphor-icons-solid/IconCloudArrowUpRegular'
import IconCheckCircleRegular from 'phosphor-icons-solid/IconCheckCircleRegular'
import IconWarningRegular from 'phosphor-icons-solid/IconWarningRegular'
import IconGearRegular from 'phosphor-icons-solid/IconGearRegular'
import IconClockRegular from 'phosphor-icons-solid/IconClockRegular'
import IconArrowsClockwiseRegular from 'phosphor-icons-solid/IconArrowsClockwiseRegular'
import IconUserRegular from 'phosphor-icons-solid/IconUserRegular'
import IconSignOutRegular from 'phosphor-icons-solid/IconSignOutRegular'
import IconShieldCheckRegular from 'phosphor-icons-solid/IconShieldCheckRegular'
import IconWifiHighRegular from 'phosphor-icons-solid/IconWifiHighRegular'
import IconWifiSlashRegular from 'phosphor-icons-solid/IconWifiSlashRegular'
import IconSpotifyLogoRegular from 'phosphor-icons-solid/IconSpotifyLogoRegular'
import IconYoutubeLogoRegular from 'phosphor-icons-solid/IconYoutubeLogoRegular'
import IconVinylRecordRegular from 'phosphor-icons-solid/IconVinylRecordRegular'
import IconListRegular from 'phosphor-icons-solid/IconListRegular'
import IconXCircleRegular from 'phosphor-icons-solid/IconXCircleRegular'
import IconXRegular from 'phosphor-icons-solid/IconXRegular'

// Fill weight
import IconMusicNoteFill from 'phosphor-icons-solid/IconMusicNoteFill'
import IconPlayFill from 'phosphor-icons-solid/IconPlayFill'
import IconPauseFill from 'phosphor-icons-solid/IconPauseFill'
import IconCloudArrowUpFill from 'phosphor-icons-solid/IconCloudArrowUpFill'
import IconCheckCircleFill from 'phosphor-icons-solid/IconCheckCircleFill'
import IconWarningFill from 'phosphor-icons-solid/IconWarningFill'
import IconGearFill from 'phosphor-icons-solid/IconGearFill'
import IconClockFill from 'phosphor-icons-solid/IconClockFill'
import IconArrowsClockwiseFill from 'phosphor-icons-solid/IconArrowsClockwiseFill'
import IconUserFill from 'phosphor-icons-solid/IconUserFill'
import IconSignOutFill from 'phosphor-icons-solid/IconSignOutFill'
import IconShieldCheckFill from 'phosphor-icons-solid/IconShieldCheckFill'
import IconWifiHighFill from 'phosphor-icons-solid/IconWifiHighFill'
import IconWifiSlashFill from 'phosphor-icons-solid/IconWifiSlashFill'
import IconSpotifyLogoFill from 'phosphor-icons-solid/IconSpotifyLogoFill'
import IconYoutubeLogoFill from 'phosphor-icons-solid/IconYoutubeLogoFill'
import IconVinylRecordFill from 'phosphor-icons-solid/IconVinylRecordFill'
import IconListFill from 'phosphor-icons-solid/IconListFill'
import IconXCircleFill from 'phosphor-icons-solid/IconXCircleFill'
import IconXFill from 'phosphor-icons-solid/IconXFill'

// Bold weight
import IconMusicNoteBold from 'phosphor-icons-solid/IconMusicNoteBold'
import IconPlayBold from 'phosphor-icons-solid/IconPlayBold'
import IconPauseBold from 'phosphor-icons-solid/IconPauseBold'
import IconCloudArrowUpBold from 'phosphor-icons-solid/IconCloudArrowUpBold'
import IconCheckCircleBold from 'phosphor-icons-solid/IconCheckCircleBold'
import IconWarningBold from 'phosphor-icons-solid/IconWarningBold'
import IconGearBold from 'phosphor-icons-solid/IconGearBold'
import IconClockBold from 'phosphor-icons-solid/IconClockBold'
import IconArrowsClockwiseBold from 'phosphor-icons-solid/IconArrowsClockwiseBold'
import IconUserBold from 'phosphor-icons-solid/IconUserBold'
import IconSignOutBold from 'phosphor-icons-solid/IconSignOutBold'
import IconShieldCheckBold from 'phosphor-icons-solid/IconShieldCheckBold'
import IconWifiHighBold from 'phosphor-icons-solid/IconWifiHighBold'
import IconWifiSlashBold from 'phosphor-icons-solid/IconWifiSlashBold'
import IconSpotifyLogoBold from 'phosphor-icons-solid/IconSpotifyLogoBold'
import IconYoutubeLogoBold from 'phosphor-icons-solid/IconYoutubeLogoBold'
import IconVinylRecordBold from 'phosphor-icons-solid/IconVinylRecordBold'
import IconListBold from 'phosphor-icons-solid/IconListBold'
import IconXCircleBold from 'phosphor-icons-solid/IconXCircleBold'
import IconXBold from 'phosphor-icons-solid/IconXBold'

export type IconWeight = 'regular' | 'fill' | 'bold'

export type IconName =
  | 'music-note'
  | 'play'
  | 'pause'
  | 'cloud-arrow-up'
  | 'check-circle'
  | 'warning'
  | 'gear'
  | 'clock'
  | 'arrows-clockwise'
  | 'user'
  | 'sign-out'
  | 'shield-check'
  | 'wifi-high'
  | 'wifi-slash'
  | 'spotify-logo'
  | 'youtube-logo'
  | 'vinyl-record'
  | 'list'
  | 'x-circle'
  | 'x'

const iconMap: Record<IconName, Record<IconWeight, Component<{ class?: string }>>> = {
  'music-note': { regular: IconMusicNoteRegular, fill: IconMusicNoteFill, bold: IconMusicNoteBold },
  'play': { regular: IconPlayRegular, fill: IconPlayFill, bold: IconPlayBold },
  'pause': { regular: IconPauseRegular, fill: IconPauseFill, bold: IconPauseBold },
  'cloud-arrow-up': { regular: IconCloudArrowUpRegular, fill: IconCloudArrowUpFill, bold: IconCloudArrowUpBold },
  'check-circle': { regular: IconCheckCircleRegular, fill: IconCheckCircleFill, bold: IconCheckCircleBold },
  'warning': { regular: IconWarningRegular, fill: IconWarningFill, bold: IconWarningBold },
  'gear': { regular: IconGearRegular, fill: IconGearFill, bold: IconGearBold },
  'clock': { regular: IconClockRegular, fill: IconClockFill, bold: IconClockBold },
  'arrows-clockwise': { regular: IconArrowsClockwiseRegular, fill: IconArrowsClockwiseFill, bold: IconArrowsClockwiseBold },
  'user': { regular: IconUserRegular, fill: IconUserFill, bold: IconUserBold },
  'sign-out': { regular: IconSignOutRegular, fill: IconSignOutFill, bold: IconSignOutBold },
  'shield-check': { regular: IconShieldCheckRegular, fill: IconShieldCheckFill, bold: IconShieldCheckBold },
  'wifi-high': { regular: IconWifiHighRegular, fill: IconWifiHighFill, bold: IconWifiHighBold },
  'wifi-slash': { regular: IconWifiSlashRegular, fill: IconWifiSlashFill, bold: IconWifiSlashBold },
  'spotify-logo': { regular: IconSpotifyLogoRegular, fill: IconSpotifyLogoFill, bold: IconSpotifyLogoBold },
  'youtube-logo': { regular: IconYoutubeLogoRegular, fill: IconYoutubeLogoFill, bold: IconYoutubeLogoBold },
  'vinyl-record': { regular: IconVinylRecordRegular, fill: IconVinylRecordFill, bold: IconVinylRecordBold },
  'list': { regular: IconListRegular, fill: IconListFill, bold: IconListBold },
  'x-circle': { regular: IconXCircleRegular, fill: IconXCircleFill, bold: IconXCircleBold },
  'x': { regular: IconXRegular, fill: IconXFill, bold: IconXBold },
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
