import React from 'react';
import useAsync from 'react-use/lib/useAsync';
import styled from 'styled-components';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import CircularProgress from '@material-ui/core/CircularProgress';

import api from '../libs/api';

export default function DnsProviderList({ ...props }) {
  const state = useAsync(() => api.get('/dns_providers').then((resp) => resp.data));

  if (state.loading) {
    return <CircularProgress />;
  }

  return (
    <Div {...props}>
      <div className="title">DNS Provider List</div>
      <TableContainer className="table">
        <Table aria-label="domain list">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Operation</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(state.value || []).map((row) => (
              <TableRow key={row.name}>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.createdAt}</TableCell>
                <TableCell>Edit Delete</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
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

  .table {
    margin-top: ${(props) => props.theme.spacing(3)}px;
  }
`;

DnsProviderList.propTypes = {};

DnsProviderList.defaultProps = {};
