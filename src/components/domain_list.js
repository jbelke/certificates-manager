/* eslint-disable jsx-a11y/anchor-is-valid */

import React, { useEffect, useState } from 'react';
import useAsyncRetry from 'react-use/lib/useAsyncRetry';
import styled from 'styled-components';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import WarningIcon from '@material-ui/icons/Warning';
import Link from '@material-ui/core/Link';

import Button from '@arcblock/ux/lib/Button';
import Toast from '@arcblock/ux/lib/Toast';
import Tag from '@arcblock/ux/lib/Tag';

import AddDomain from './add_domain';
import ConfirmDialog from './confirm';
import DnsConfigReminder from './dns_config_reminder';

import api from '../libs/api';
import { formatError, domainStatusMap } from '../libs/util';

export default function DomainList({ ...props }) {
  const state = useAsyncRetry(() => api.get('/domains').then((resp) => resp.data));
  const [confirmSetting, setConfirmSetting] = useState(null);
  const [removeError, setRemoveError] = useState('');
  const [removeSuccess, setRemoveSuccess] = useState('');
  const [domainsDnsStatusMap, setDomainsDnsStatusMap] = useState({});
  const [domainReminder, setDomainReminder] = useState();

  useEffect(async () => {
    if (state.value) {
      const domainsStatus = await api.post('/dns-status', { domains: state.value.map((x) => x.domain) });
      try {
        const domainsMap = (domainsStatus.data || []).reduce((acc, cur) => {
          acc[cur.domain] = cur;
          return acc;
        }, {});

        setDomainsDnsStatusMap(domainsMap);
      } catch (error) {
        console.error('load domain status error:', error);
      }
    }
  }, [state.value]);

  if (state.loading) {
    return <CircularProgress />;
  }

  const onConfirm = async (domain) => {
    try {
      await api.delete(`/domains/${domain}`);
      setRemoveSuccess('Remove domain successfully!');
      state.retry();
    } catch (error) {
      setRemoveError(`Remove domain error: ${formatError(error)}`);
    }

    setConfirmSetting(null);
  };

  const onCancel = () => {
    setConfirmSetting(null);
  };

  const handleRemoveDomain = (domain) => {
    if (!domain) {
      console.error('invalid domain');
      return;
    }

    setConfirmSetting({
      title: 'Remove Domain',
      description: (
        <p>
          Confirm remove the doamin <b>{domain}</b>
        </p>
      ),
      confirm: 'Confirm',
      cancel: 'Cancel',
      onConfirm: () => onConfirm(domain),
      onCancel,
    });
  };

  return (
    <Container {...props}>
      <Typography className="title" variant="h5">
        Domain List
      </Typography>
      <AddDomain onConfirm={state.retry} />
      <div>
        <TableContainer className="table">
          <Table aria-label="domain list">
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>DNS Status</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Operation</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(state.value || []).map((row, index) => (
                <TableRow key={row.domain}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{row.domain}</TableCell>
                  <TableCell>
                    <Tag type={domainStatusMap[row.status]}>{row.status}</Tag>
                  </TableCell>
                  {domainsDnsStatusMap[row.domain] && (
                    <TableCell>
                      <Typography className="dns-status">
                        {domainsDnsStatusMap[row.domain].resolved ? (
                          <Tag type="success">resolved</Tag>
                        ) : (
                          <React.Fragment>
                            <Link component="button" onClick={() => setDomainReminder(row.domain)}>
                              Check DNS
                            </Link>
                            <WarningIcon />
                          </React.Fragment>
                        )}
                      </Typography>
                    </TableCell>
                  )}
                  {!domainsDnsStatusMap[row.domain] && <TableCell />}
                  <TableCell>{row.createdAt}</TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      rounded
                      variant="contained"
                      color="danger"
                      onClick={() => handleRemoveDomain(row.domain)}>
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {confirmSetting && (
          <ConfirmDialog
            title={confirmSetting.title}
            description={confirmSetting.description}
            confirm={confirmSetting.confirm}
            cancel={confirmSetting.cancel}
            onConfirm={confirmSetting.onConfirm}
            onCancel={confirmSetting.onCancel}
            focus="cancel"
          />
        )}
        {!!removeError && <Toast variant="error" message={removeError} onClose={() => setRemoveError('')} />}
        {!!removeSuccess && (
          <Toast variant="success" duration={3000} message={removeSuccess} onClose={() => setRemoveSuccess('')} />
        )}
        {domainReminder && <DnsConfigReminder domain={domainReminder} onClose={() => setDomainReminder('')} />}
      </div>
    </Container>
  );
}

const Container = styled.div`
  .title {
    text-align: center;
    color: #000;
  }

  .table {
    margin-top: ${(props) => props.theme.spacing(3)}px;
  }

  .dns-status {
    display: flex;
    justify-content: center;
    align-items: center;

    & > svg {
      margin-left: 5px;
      font-size: 16px;
      color: rgb(255, 207, 113);
    }
  }
`;

DomainList.propTypes = {};

DomainList.defaultProps = {};
