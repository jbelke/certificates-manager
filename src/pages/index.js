import React, { useContext } from 'react';
import styled from 'styled-components';
import { LocaleContext } from '@arcblock/ux/lib/Locale/context';

import Layout from '../components/layout';
import DomainList from '../components/domain_list';
import DnsProviderList from '../components/dns_provider_list';
import AddDomain from '../components/add_domain';
import AddDnsProvider from '../components/add_dns_provider';

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
        <p style={{ fontSize: '1.2rem' }}>{t('description')}</p>
        <DomainList className="block" />
        <DnsProviderList className="block" />
        <AddDomain className="block" />
        <AddDnsProvider className="block" />
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

  .block {
    margin-top: ${(props) => props.theme.spacing(6)}px;
  }
`;
