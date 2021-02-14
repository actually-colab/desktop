import { ipcRenderer, IpcRendererEvent } from 'electron';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';
import { Button, Icon } from 'rsuite';

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

const AuthPage: React.FC = () => {
  const isSigningIn = useSelector((state: ReduxState) => state.auth.isSigningIn);

  const dispatch = useDispatch();
  const dispatchOpenAuthRedirect = React.useCallback(() => dispatch(_auth.openAuthRedirect()), [dispatch]);
  const dispatchAuthRedirectSignIn = React.useCallback(
    (payload: LoginRedirectResponse) => dispatch(_auth.authRedirectSignIn(payload)),
    [dispatch]
  );
  const dispatchAuthRedirectFailure = React.useCallback(
    (errorMessage: string) => dispatch(_auth.authRedirectFailure(errorMessage)),
    [dispatch]
  );

  React.useEffect(() => {
    const listener = (_: IpcRendererEvent, data?: { url: string }) => {
      const loginResponse = data?.url ? extractLoginData(data.url) : null;

      console.log('Redirect response', loginResponse);

      if (loginResponse) {
        dispatchAuthRedirectSignIn(loginResponse);
      } else {
        dispatchAuthRedirectFailure('Could not sign in!');
      }
    };

    ipcRenderer.on('login-success', listener);

    return () => {
      ipcRenderer.removeListener('login-success', listener);
    };
  }, [dispatchAuthRedirectFailure, dispatchAuthRedirectSignIn]);

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
