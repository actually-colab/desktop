import React from 'react';
import { StyleSheet, css } from 'aphrodite';
import { Divider, Icon, Nav, NavItemProps, Sidenav, Tooltip, Whisper } from 'rsuite';
import { palette } from '../../constants/theme';

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
  },
});

const SidebarButton: React.FC<{ eventKey: string; tooltipText: string; icon: NavItemProps['icon'] }> = ({
  eventKey,
  tooltipText,
  icon,
}) => {
  return (
    <Whisper placement="left" trigger="hover" speaker={<Tooltip>{tooltipText}</Tooltip>}>
      <Nav.Item eventKey={eventKey} icon={icon} />
    </Whisper>
  );
};

const RightSidebar: React.FC = () => {
  const [visibleMenu, setVisibleMenu] = React.useState<string>('');

  return (
    <div className={css(styles.container)}>
      <Sidenav
        expanded={false}
        activeKey=""
        appearance="subtle"
        style={{ flexGrow: 1 }}
        onSelect={(eventKey) => setVisibleMenu(eventKey)}
      >
        <Sidenav.Body>
          <Nav>
            <SidebarButton
              eventKey="run-cell"
              tooltipText="Run Cell"
              icon={<Icon icon="play" style={{ color: palette.SUCCESS }} />}
            />
            <SidebarButton
              eventKey="stop-cell"
              tooltipText="Stop Cell"
              icon={<Icon icon="stop" style={{ color: palette.ERROR }} />}
            />

            <Divider style={{ marginTop: 0, marginBottom: 0 }} />

            <SidebarButton eventKey="collaborators" tooltipText="Collaborators" icon={<Icon icon="group" />} />
            <SidebarButton eventKey="kernel-logs" tooltipText="Kernel Logs" icon={<Icon icon="tasks" />} />
            <SidebarButton eventKey="downloads" tooltipText="Downloads" icon={<Icon icon="download" />} />
            <SidebarButton eventKey="settings" tooltipText="Settings" icon={<Icon icon="gear-circle" />} />
          </Nav>
        </Sidenav.Body>
      </Sidenav>
    </div>
  );
};

export default RightSidebar;
