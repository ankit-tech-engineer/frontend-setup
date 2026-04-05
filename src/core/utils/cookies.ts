import Cookies from 'js-cookie';

export const setAuthCookies = (accessToken: string, refreshToken: string) => {
  Cookies.set('accessToken', accessToken, { expires: 1, secure: true, sameSite: 'strict' });
  Cookies.set('refreshToken', refreshToken, { expires: 7, secure: true, sameSite: 'strict' });
};

export const clearAuthCookies = () => {
  Cookies.remove('accessToken');
  Cookies.remove('refreshToken');
};

export const getAccessToken = () => Cookies.get('accessToken');
export const getRefreshToken = () => Cookies.get('refreshToken');
