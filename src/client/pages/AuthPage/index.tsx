import { ipcRenderer, IpcRendererEvent } from 'electron';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';
import { Button, Icon } from 'rsuite';

import { IpcLoginPayload, IPC_LOGIN_CHANNEL } from '../../../shared/types/ipc';

import { spacing } from '../../constants/theme';
import { _auth } from '../../redux/actions';
import { extractLoginData, LoginRedirectResponse } from '../../utils/redirect';
import { Header } from '../../components';
import { ReduxState } from '../../redux';

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    overflow: 'hidden',
  },
  content: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInContainerBackground: {
    width: 512,
    background: '-webkit-linear-gradient(top left, #f55673, #E2CC52)',
    borderRadius: 20,
  },
  signInContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
    padding: 40,
    borderRadius: 16,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 64,
    fontWeight: 'bold',
    background: '-webkit-linear-gradient(top left, #f55673, #E2CC52)',
    '-webkit-background-clip': 'text',
    '-webkit-text-fill-color': 'transparent',
    '-webkit-user-select': 'none',
  },
  subtitle: {
    fontSize: 18,
  },
  signInButton: {
    marginTop: spacing.DEFAULT,
  },
  signInText: {
    marginRight: spacing.DEFAULT / 2,
  },
});

/**
 * The auth page
 */
const AuthPage: React.FC = () => {
  const isSigningIn = useSelector((state: ReduxState) => state.auth.isSigningIn);

  const dispatch = useDispatch();
  const dispatchOpenAuthRedirect = React.useCallback(() => dispatch(_auth.openAuthRedirect()), [dispatch]);

  /**
   * Login IPC listener
   */
  const ipcLoginListener = React.useCallback(
    (_: IpcRendererEvent, data: IpcLoginPayload) => {
      let loginResponse: LoginRedirectResponse | null = null;

      if (data.type === 'success') {
        loginResponse = extractLoginData(data.url);
      }

      console.log('Redirect response', loginResponse);

      if (loginResponse) {
        dispatch(_auth.authRedirectSignIn(loginResponse));
      } else {
        dispatch(_auth.authRedirectFailure('Could not find a valid 3rd party sign in!'));
      }
    },
    [dispatch]
  );

  /**
   * Manage the login IPC listener
   */
  React.useEffect(() => {
    ipcRenderer.on(IPC_LOGIN_CHANNEL, ipcLoginListener);

    return () => {
      ipcRenderer.removeListener(IPC_LOGIN_CHANNEL, ipcLoginListener);
    };
  }, [ipcLoginListener]);

  return (
    <div className={css(styles.container)}>
      <Header />

      <div className={css(styles.content)}>
        <div className={css(styles.signInContainerBackground)}>
          <div className={css(styles.signInContainer)}>
            <span className={css(styles.title)}>actually colab</span>
            <p className={css(styles.subtitle)}>built by jeff taylor-chang and bailey tincher</p>

            <div className={css(styles.signInButton)}>
              <Button
                appearance="primary"
                onClick={dispatchOpenAuthRedirect}
                loading={isSigningIn}
                disabled={isSigningIn}
              >
                <span className={css(styles.signInText)}>Sign in with your browser</span>
                <Icon icon="external-link" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
