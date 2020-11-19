import React from 'react';
import styled from 'styled-components';
import TextField from '@material-ui/core/TextField';
import InputLabel from '@material-ui/core/InputLabel';

export default function AddEmail() {
  return (
    <Div>
      <form className="form" autoComplete="off">
        <InputLabel component="legend">Email</InputLabel>
        <TextField id="email" type="email" />
      </form>
    </Div>
  );
}

const Div = styled.div`
  .form {
    width: 500px;

    & > legend {
      margin-top: ${(props) => props.theme.spacing(5)}px;
    }
    display: flex;
    flex-direction: column;
  }
`;

AddEmail.propTypes = {};

AddEmail.defaultProps = {};
