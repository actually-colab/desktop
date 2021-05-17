import * as React from 'react';
import { ButtonProps, Icon, IconButton, IconProps, Tooltip, Whisper, WhisperProps } from 'rsuite';

import { palette, timing } from '../constants/theme';

/**
 * Props for the ColoredIconButton component
 */
export type ColoredIconButtonProps = {
  icon: IconProps['icon'];
  style?: React.CSSProperties;
  size?: ButtonProps['size'];
  color?: string;
  tooltipText?: string;
  tooltipDirection?: WhisperProps['placement'];
  active?: boolean;
  disabled?: boolean;
  loading?: boolean;
  container?: WhisperProps['container'];
  onClick(): void;
};

/**
 * A component to render a colored icon button with an optional tooltip
 */
const ColoredIconButton: React.FC<ColoredIconButtonProps> = ({
  icon,
  style,
  tooltipText = '',
  tooltipDirection,
  size = 'lg',
  color,
  active = false,
  disabled = false,
  loading = false,
  container,
  onClick,
}) => {
  const ButtonContent = (
    <IconButton
      appearance="subtle"
      size={size}
      style={style}
      icon={
        <Icon
          icon={icon}
          style={
            !loading
              ? active
                ? {
                    color: palette.CHARCOAL,
                    backgroundColor: palette.BASE_FADED,
                  }
                : color
                ? {
                    color: disabled ? `${color}60` : color,
                  }
                : undefined
              : undefined
          }
        />
      }
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

export default ColoredIconButton;
