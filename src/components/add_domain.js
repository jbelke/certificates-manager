import React, { useState } from 'react';
import styled from 'styled-components';
import Button from '@arcblock/ux/lib/Button';
import Toast from '@arcblock/ux/lib/Toast';
import TextField from '@material-ui/core/TextField';
import InputLabel from '@material-ui/core/InputLabel';

import DnsConfigReminder from './dns_config_reminder';

import api from '../libs/api';

export default function AddDomain({ ...props }) {
  const [domain, setDomain] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDnsConfigReminder, setOpenDnsConfigReminder] = useState(false);

  const onSubmit = () => {
    if (!domain) {
      return;
    }

    api
      .post('/domains', { domain })
      .then(() => {
        console.log('save success');
        setSuccess('Add domain successfully!');
        setOpenDnsConfigReminder(true);
      })
      .catch((err) => {
        console.error('save failed', err);
        setError(`Add domain failed: ${err.message}`);
      });
  };

  return (
    <Div {...props}>
      <div className="title">Add Domain</div>
      <form className="form" autoComplete="off">
        <InputLabel>Domain</InputLabel>
        <TextField id="domain" value={domain} onChange={(event) => setDomain(event.target.value)} />
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onSubmit();
          }}
          className="submit"
          color="primary"
          variant="contained"
          rounded
          size="small">
          Submit
        </Button>
      </form>
      {!!error && <Toast variant="error" message={error} onClose={() => setError('')} />}
      {!!success && <Toast variant="success" duration={3000} message={success} onClose={() => setSuccess('')} />}
      {openDnsConfigReminder && <DnsConfigReminder domain={domain} onClose={() => setOpenDnsConfigReminder(false)} />}
    </Div>
  );
}

const Div = styled.div`
  width: 80%;
  border: 1px solid #000;
  padding: ${(props) => props.theme.spacing(5)}px;

  .title {
    text-align: center;
    color: #000;
    font-size: 1.2rem;
  }

  .form {
    display: flex;
    flex-direction: column;
    margin-top: ${(props) => props.theme.spacing(3)}px;

    & > label:not(:first-child) {
      margin-top: ${(props) => props.theme.spacing(5)}px;
    }

    .submit {
      margin-top: ${(props) => props.theme.spacing(5)}px;
    }
  }
`;

AddDomain.propTypes = {};

AddDomain.defaultProps = {};
