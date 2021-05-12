import React from 'react';
import { Button, ButtonProps, Icon, IconProps, Tooltip, Whisper, WhisperProps } from 'rsuite';

import { timing } from '../constants/theme';

/**
 * Props for the IconTextButton component
 */
export type IconTextButtonProps = {
  icon: IconProps['icon'];
  text: string;
  size?: ButtonProps['size'];
  bgColor?: string;
  color?: string;
  tooltipText?: string;
  tooltipDirection?: WhisperProps['placement'];
  loading?: boolean;
  disabled?: boolean;
  container?: WhisperProps['container'];
  onClick(): void;
};

/**
 * A component to render a button with an icon to the left
 */
const IconTextButton: React.FC<IconTextButtonProps> = ({
  icon,
  text,
  size = 'xs',
  bgColor,
  color,
  tooltipText = '',
  tooltipDirection,
  loading = false,
  disabled = false,
  container,
  onClick,
}) => {
  const ButtonContent = (
    <Button
      style={bgColor !== undefined ? { backgroundColor: bgColor } : undefined}
      size={size}
      appearance="subtle"
      loading={loading}
      disabled={disabled}
      onClick={onClick}
    >
      <Icon icon={icon} style={!loading && !disabled ? { color } : undefined} />
      <span style={!loading && !disabled ? { marginLeft: 4, color } : { marginLeft: 4 }}>{text}</span>
    </Button>
  );

  if (tooltipText === '') {
    return ButtonContent;
  }

  return (
    <Whisper
      container={container}
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

export default IconTextButton;
