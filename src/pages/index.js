import React, { useContext } from 'react';
import styled from 'styled-components';
import moment from 'moment';
import { LocaleContext } from '@arcblock/ux/lib/Locale/context';
import Button from '@arcblock/ux/lib/Button';

import Layout from '../components/layout';
import DomainList from '../components/domain_list';
import { SessionContext } from '../contexts/session';

export default function IndexPage() {
  const { changeLocale, t, locale } = useContext(LocaleContext);
  const { session } = useContext(SessionContext);
  const appName = window.env ? window.env.appName : 'Certificates Manager';
  moment.locale(locale === 'zh' ? 'zh-cn' : locale);

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('__blang__') != null) {
    changeLocale(urlParams.get('__blang__'));
  }

  let prefix = '/';
  if (window.blocklet && window.blocklet.prefix) {
    prefix = window.blocklet.prefix;
  } else if (window.env && window.env.apiPrefix) {
    prefix = window.env.apiPrefix;
  }

  let apiPrefix = prefix.replace(/^\/+/, '').replace(/\/+$/, '');
  if (apiPrefix) {
    apiPrefix = `/${apiPrefix}`;
  }

  const onLogout = () => {
    session.logout();
    window.location.href = apiPrefix;
  };

  return (
    <Layout title="Home">
      <Main>
        <h1>
          {appName}
          <Button
            size="small"
            style={{ marginLeft: '20px' }}
            rounded
            color="danger"
            variant="outlined"
            onClick={onLogout}>
            {t('logout')}
          </Button>
        </h1>
        <p style={{ fontSize: '1.2rem' }}>{t('description')}</p>
        <DomainList className="block" />
      </Main>
    </Layout>
  );
}

const Main = styled.main`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: ${(props) => `${props.theme.spacing(5)}px`};

  .block {
    margin-top: ${(props) => props.theme.spacing(6)}px;
  }
`;
