import * as React from 'react';
import { StyleSheet, css } from 'aphrodite';
import { Button, ButtonProps, Dropdown, Icon, Popover, Whisper, WhisperProps } from 'rsuite';
import { WhisperInstance } from 'rsuite/lib/Whisper';

import { spacing } from '../constants/theme';

const styles = StyleSheet.create({
  buttonContentContainer: {
    display: 'inline-block',
    width: '100%',
  },
  buttonContent: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownIcon: {
    marginLeft: spacing.DEFAULT / 2,
  },
});

/**
 * Props for the PopoverDropdown component
 */
export type PopoverDropdownProps = {
  placement: WhisperProps['placement'];
  appearance?: ButtonProps['appearance'];
  size?: ButtonProps['size'];
  activeKey?: string;
  buttonContent: React.ReactNode;
  buttonProps?: ButtonProps;
  menuStyle?: React.CSSProperties;
  onSelect?(eventKey: string): void;
};

/**
 * A dropdown that uses a popover instead of the default dropdown. Expects a fragment containing Dropdown.Item's as the children
 */
const PopoverDropdown: React.FC<PopoverDropdownProps> = ({
  placement = 'bottomEnd',
  appearance,
  size = 'sm',
  activeKey,
  buttonContent,
  buttonProps = {},
  menuStyle,
  onSelect,
  children,
}) => {
  const whisperRef = React.createRef<WhisperInstance>();

  const handleSelect = React.useCallback(
    (eventKey: string) => {
      onSelect?.(eventKey);
      whisperRef.current?.close();
    },
    [onSelect, whisperRef]
  );

  return (
    <div>
      <Whisper
        ref={whisperRef}
        trigger="click"
        placement={placement}
        speaker={
          <Popover full style={{ border: '1px solid #ddd' }}>
            <Dropdown.Menu activeKey={activeKey} onSelect={handleSelect} style={menuStyle}>
              {children}
            </Dropdown.Menu>
          </Popover>
        }
      >
        <Button
          {...{
            appearance,
            size,
            style: {
              alignSelf: 'flex-start',
            },
            ...buttonProps,
          }}
        >
          <div className={css(styles.buttonContentContainer)}>
            <div className={css(styles.buttonContent)}>
              {buttonContent}

              <div className={css(styles.dropdownIcon)}>
                <Icon icon="arrow-down-line" />
              </div>
            </div>
          </div>
        </Button>
      </Whisper>
    </div>
  );
};

export default PopoverDropdown;
