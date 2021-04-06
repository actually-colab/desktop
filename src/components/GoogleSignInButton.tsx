import React from 'react';
import GoogleLogin, { GoogleLoginResponse, GoogleLoginResponseOffline } from 'react-google-login';

export const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID ?? '';

if (!GOOGLE_CLIENT_ID) {
  throw new Error('Invalid Google client ID');
}

/**
 * Render a standard Sign in with Google button
 */
const GoogleSignInButton: React.FC<{
  onSuccess(payload: GoogleLoginResponse | GoogleLoginResponseOffline): void;
  onFailure(error: Error): void;
}> = ({ onSuccess, onFailure }) => {
  return (
    <GoogleLogin
      clientId={GOOGLE_CLIENT_ID}
      buttonText="Sign in with Google"
      cookiePolicy="single_host_origin"
      onSuccess={onSuccess}
      onFailure={onFailure}
    />
  );
};

export default GoogleSignInButton;
