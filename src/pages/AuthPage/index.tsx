import * as React from 'react';
import { useDispatch } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';
import { GoogleLoginResponse } from 'react-google-login';

import { spacing } from '../../constants/theme';
import { _auth } from '../../redux/actions';
import { GoogleSignInButton } from '../../components';

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
  const dispatch = useDispatch();
  const dispatchGoogleSignIn = React.useCallback((idToken: string) => dispatch(_auth.googleSignIn(idToken)), [
    dispatch,
  ]);

  const onGoogleSignInSuccess = React.useCallback(
    (payload: GoogleLoginResponse) => {
      dispatchGoogleSignIn(payload.tokenId);
    },
    [dispatchGoogleSignIn]
  );

  const onGoogleSignInFailure = React.useCallback((error: Error) => {
    console.error(error);
  }, []);

  return (
    <div className={css(styles.container)}>
      <div className={css(styles.content)}>
        <div className={css(styles.signInContainerBackground)}>
          <div className={css(styles.signInContainer)}>
            <span className={css(styles.title)}>actually colab</span>
            <p className={css(styles.subtitle)}>built by Jeff Taylor-Chang and Bailey Tincher</p>

            <div className={css(styles.signInButton)}>
              <GoogleSignInButton onSuccess={onGoogleSignInSuccess} onFailure={onGoogleSignInFailure} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
