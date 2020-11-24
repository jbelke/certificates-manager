import React, { useState } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import useTheme from '@material-ui/core/styles/useTheme';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import CodeBlock from '@arcblock/ux/lib/CodeBlock';
import Button from '@arcblock/ux/lib/Button';
import { parseDomain, ParseResultType } from 'parse-domain';

export default function DnsConfigReminder({ domain, onClose, ...props }) {
  const theme = useTheme();
  const { nodeDomain = '' } = window.env;

  const [open, setOpen] = useState(true);
  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  const parseResult = parseDomain(domain);

  let content = '';
  if (parseResult.type !== ParseResultType.Listed) {
    content = 'invlaid domain';
  } else {
    const subDomain = parseResult.subDomains.join('.');
    content = (
      <React.Fragment>
        添加一个指向节点地址 {nodeDomain} 的 {subDomain} 记录:
        <CodeBlock className="dns-configration" style={{ overflow: 'auto', marginTop: theme.spacing(2) }}>
          {`${subDomain} CNAME ${nodeDomain}`}
        </CodeBlock>
      </React.Fragment>
    );
  }

  return (
    <Div {...props}>
      <Dialog fullWidth maxWidth="md" open={open} onClose={handleClose} aria-labelledby="dns-configuration-dialog">
        <DialogTitle id="max-width-dialog-title">DNS Configuration</DialogTitle>
        <DialogContent>
          <DialogContentText>{content}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Div>
  );
}

const Div = styled.div``;

DnsConfigReminder.propTypes = { domain: PropTypes.string.isRequired, onClose: PropTypes.func };

DnsConfigReminder.defaultProps = { onClose: () => {} };
