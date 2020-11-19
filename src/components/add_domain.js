import React, { useState } from 'react';
import styled from 'styled-components';
import TextField from '@material-ui/core/TextField';
import RadioGroup from '@material-ui/core/RadioGroup';
import InputLabel from '@material-ui/core/InputLabel';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import Button from '@arcblock/ux/lib/Button';

import api from '../libs/api';

export default function AddDomain({ ...props }) {
  const [dnsService, setDnsService] = useState('alibaba_cloud');
  const [domain, setDomain] = useState('');
  const [accessKey, setAccessKey] = useState('');
  const [accessSecret, setAccessSecret] = useState('');

  const onSubmit = () => {
    if (!domain || !dnsService || !accessKey || !accessSecret) {
      return;
    }

    api
      .post('/domains', { domain, dnsService, accessKey, accessSecret })
      .then(() => {
        console.log('save success');
      })
      .catch((error) => {
        console.error('save failed', error);
      });
  };

  return (
    <Div {...props}>
      <div className="title">Add Domain</div>
      <form className="form" autoComplete="off">
        <InputLabel>Domain</InputLabel>
        <TextField id="domain" value={domain} onChange={(event) => setDomain(event.target.value)} />
        <InputLabel>DNS Resolver</InputLabel>
        <RadioGroup
          aria-label="dns resolver"
          name="dns_resolver"
          value={dnsService}
          onChange={(event) => {
            setDnsService(event.target.value);
          }}>
          <FormControlLabel value="alibaba_cloud" control={<Radio />} label="Alibaba Could" />
          <FormControlLabel value="google_cloud" control={<Radio />} label="Google Cloud" />
        </RadioGroup>
        <InputLabel>Access Token</InputLabel>
        <TextField id="accessToken" value={accessKey} onChange={(event) => setAccessKey(event.target.value)} />
        <InputLabel>Access Secret</InputLabel>
        <TextField id="accessSecret" value={accessSecret} onChange={(event) => setAccessSecret(event.target.value)} />
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
    </Div>
  );
}

const Div = styled.div`
  width: 60%;
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
