import React from 'react';
import { ButtonProps, Icon, IconButton, IconProps, Tooltip, Whisper, WhisperProps } from 'rsuite';

import { timing } from '../constants/theme';

/**
 * Props for the RegularIconButton component
 */
export type RegularIconButtonProps = {
  icon: IconProps['icon'];
  iconStyle?: {
    enabled: React.CSSProperties;
    disabled: React.CSSProperties;
  };
  size?: ButtonProps['size'];
  tooltipText?: string;
  tooltipDirection?: WhisperProps['placement'];
  active?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onClick(): void;
};

/**
 * A component to render an icon button with an optional tooltip
 */
const RegularIconButton: React.FC<RegularIconButtonProps> = ({
  icon,
  iconStyle,
  tooltipText = '',
  tooltipDirection,
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
}) => {
  const ButtonContent = (
    <IconButton
      size={size}
      icon={<Icon icon={icon} style={disabled ? iconStyle?.disabled : iconStyle?.enabled} />}
      disabled={disabled || loading}
      loading={loading}
      onClick={onClick}
    />
  );

  if (tooltipText === '') {
    return ButtonContent;
  }

  return (
    <Whisper
      placement={tooltipDirection}
      trigger="hover"
      delayShow={timing.SHOW_DELAY}
      delayHide={timing.HIDE_DELAY}
      speaker={<Tooltip>{tooltipText}</Tooltip>}
    >
      {ButtonContent}
    </Whisper>
  );
};

export default RegularIconButton;
