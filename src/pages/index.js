import React, { useContext } from 'react';
import styled from 'styled-components';

import { LocaleContext } from '@arcblock/ux/lib/Locale/context';

import Layout from '../components/layout';

export default function IndexPage() {
  const { changeLocale, t } = useContext(LocaleContext);
  const appName = window.env ? window.env.appName : 'Certificates Manager';

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('__blang__') != null) {
    changeLocale(urlParams.get('__blang__'));
  }

  return (
    <Layout title="Home">
      <Main>
        <h1>{appName}</h1>
        <h2>{t('description')}</h2>
      </Main>
    </Layout>
  );
}

const Main = styled.main`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: ${(props) => `${props.theme.spacing(5)}px`};
`;
