import React, { useContext } from 'react';
import styled from 'styled-components';
import { useTheme } from '@material-ui/core/styles';

import { LocaleContext } from '@arcblock/ux/lib/Locale/context';

import Layout from '../components/layout';
import AddDomain from '../components/add_domain';
import DomainList from '../components/doamin_list';

export default function IndexPage() {
  const { changeLocale, t } = useContext(LocaleContext);
  const appName = window.env ? window.env.appName : 'Certificates Manager';
  const theme = useTheme();

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('__blang__') != null) {
    changeLocale(urlParams.get('__blang__'));
  }

  return (
    <Layout title="Home">
      <Main>
        <h1>{appName}</h1>
        <p style={{ fontSize: '1.2rem' }}>{t('description')}</p>
        <DomainList />
        <AddDomain style={{ marginTop: theme.spacing(6) }} />
      </Main>
    </Layout>
  );
}

const Main = styled.main`
  display: flex;
  flex-direction: column;
  align-items: center;
  with: 768px;
  margin-top: ${(props) => `${props.theme.spacing(5)}px`};
`;
