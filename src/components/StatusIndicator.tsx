import React from 'react';
import { Badge, Tooltip, Whisper, WhisperProps } from 'rsuite';

import { timing } from '../constants/theme';

/**
 * Props for the StatusIndicator component
 */
export type StatusIndicatorProps = {
  color?: string;
  content?: string;
  textPlacement?: 'left' | 'right';
  tooltipOptions?: {
    placement: WhisperProps['placement'];
    text: string;
  };
};

/**
 * A component to render a status indicator with a given color and text with an optional tooltip
 */
const StatusIndicator: React.FC<StatusIndicatorProps> = ({ color, content, textPlacement, tooltipOptions }) => {
  const StatusBadge = (
    <div>
      <Badge
        style={{
          background: color,
          marginRight: textPlacement === 'right' ? 8 : 0,
          marginLeft: textPlacement === 'left' ? 8 : 0,
        }}
        content={content}
      />
    </div>
  );

  if (tooltipOptions === undefined) {
    return StatusBadge;
  }

  return (
    <Whisper
      placement={tooltipOptions.placement}
      delayShow={timing.SHOW_DELAY}
      delayHide={timing.HIDE_DELAY}
      speaker={<Tooltip>{tooltipOptions.text}</Tooltip>}
    >
      {StatusBadge}
    </Whisper>
  );
};

export default StatusIndicator;
