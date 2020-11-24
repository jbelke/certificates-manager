/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-curly-newline */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable react/jsx-curly-spacing */
/* eslint-disable react/jsx-one-expression-per-line */
import React, { useState } from 'react';

import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';

import Button from '@arcblock/ux/lib/Button';

import ConfirmDialog from './confirm';
import api from '../libs/api';

export default function AddDomain({ onConfirm, ...props }) {
  const [confirmSetting, setConfirmSetting] = useState(null);

  const onCancel = () => {
    setConfirmSetting(null);
  };

  const handleConfirmAdd = async (params) => {
    if (!params.domain) {
      return;
    }

    await api.post('/domains', { ...params });
    console.log('save success');
    setConfirmSetting(null);
    onConfirm();
  };

  const setting = {
    title: 'Add Domain',
    description: (params, setParams) => (
      <Typography component="div">
        <TextField
          id="domain"
          autoComplete="off"
          value={params.domain}
          fullWidth
          onChange={(e) => setParams({ ...params, domain: e.target.value, __disableConfirm: !e.target.value })}
        />
      </Typography>
    ),
    confirm: 'Add Domain',
    cancel: 'Cancel',
    params: {
      __disableConfirm: true,
    },
    onConfirm: handleConfirmAdd,
    onCancel,
  };

  return (
    <React.Fragment>
      <Button
        size="small"
        color="primary"
        variant="contained"
        rounded
        onClick={() => setConfirmSetting(setting)}
        {...props}>
        Add Domain
      </Button>
      {confirmSetting && (
        <ConfirmDialog
          title={confirmSetting.title}
          description={confirmSetting.description}
          confirm={confirmSetting.confirm}
          cancel={confirmSetting.cancel}
          params={confirmSetting.params}
          onConfirm={confirmSetting.onConfirm}
          onCancel={confirmSetting.onCancel}
          focus="confirm"
        />
      )}
    </React.Fragment>
  );
}
