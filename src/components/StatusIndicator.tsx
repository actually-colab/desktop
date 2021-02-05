import React from 'react';
import { Badge, Tooltip, Whisper, WhisperProps } from 'rsuite';

const StatusIndicator: React.FC<{
  color?: string;
  content?: string;
  textPlacement?: 'left' | 'right';
  tooltipOptions?: {
    placement: WhisperProps['placement'];
    text: string;
  };
}> = ({ color, content, textPlacement, tooltipOptions }) => {
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
    <Whisper placement={tooltipOptions.placement} speaker={<Tooltip>{tooltipOptions.text}</Tooltip>}>
      {StatusBadge}
    </Whisper>
  );
};

export default StatusIndicator;
