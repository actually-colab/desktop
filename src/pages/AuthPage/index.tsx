import React from 'react';
import { useDispatch } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';
import { Button } from 'rsuite';

import { spacing } from '../../constants/theme';
import { _auth } from '../../redux/actions';
import { Header } from '../../components';

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
});

const AuthPage: React.FC = () => {
  const dispatch = useDispatch();

  const dispatchOpenAuthRedirect = React.useCallback(() => dispatch(_auth.openAuthRedirect()), [dispatch]);

  return (
    <div className={css(styles.container)}>
      <Header />

      <div className={css(styles.content)}>
        <div className={css(styles.signInContainerBackground)}>
          <div className={css(styles.signInContainer)}>
            <span className={css(styles.title)}>actually colab</span>
            <p className={css(styles.subtitle)}>built by jeff taylor-chang and bailey tincher</p>

            <div className={css(styles.signInButton)}>
              <Button appearance="primary" onClick={dispatchOpenAuthRedirect}>
                Sign in with your browser
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
