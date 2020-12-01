/* eslint-disable import/prefer-default-export */
import qs from 'querystring';
import moment from 'moment';
import 'moment/locale/zh-cn';

export const formatError = (error) => {
  if (Array.isArray(error.errors)) {
    return error.errors.map((x) => x.message).join('\n');
  }

  if (error.response) {
    return error.response.data;
  }

  return error.message;
};

export const parseQuery = (str) =>
  str
    .replace(/^\?/, '')
    .split('&')
    .map((x) => x.split('='))
    .filter(([key]) => !!key)
    .reduce((memo, x) => {
      const key = x[0];
      const value = decodeURIComponent(x[1]) || true;
      memo[key] = value;
      return memo;
    }, {});

// Append any query string url to api requests, to make passport work
export const appendPassportParams = (url) => {
  const [pathname, query = ''] = url.split('?');
  const oldParams = parseQuery(query);
  const extraParams = parseQuery(window.location.search);

  // eslint-disable-next-line prefer-object-spread
  const params = Object.assign({}, oldParams, extraParams);
  return `${pathname}?${qs.stringify(params)}`;
};

export const domainStatusMap = {
  added: 'primary',
  creating: 'warning',
  generated: 'success',
  renewaling: 'warning',
  error: 'error',
};

export function formatToDatetime(date) {
  if (!date) {
    return '-';
  }

  return moment(date).format('lll');
}
