import React from 'react';
import { Button, ButtonProps, Icon, IconProps, Tooltip, Whisper, WhisperProps } from 'rsuite';

const IconTextButton: React.FC<{
  icon: IconProps['icon'];
  text: string;
  size?: ButtonProps['size'];
  bgColor?: string;
  color?: string;
  tooltipText?: string;
  tooltipDirection?: WhisperProps['placement'];
  loading?: boolean;
  disabled?: boolean;
  onClick(): void;
}> = ({
  icon,
  text,
  size = 'xs',
  bgColor,
  color,
  tooltipText = '',
  tooltipDirection,
  loading = false,
  disabled = false,
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
      placement={tooltipDirection}
      trigger="hover"
      delayShow={1000}
      delayHide={400}
      speaker={<Tooltip>{tooltipText}</Tooltip>}
    >
      {ButtonContent}
    </Whisper>
  );
};

export default IconTextButton;
