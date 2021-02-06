import React from 'react';
import Styled, { css } from 'styled-components';
import palette from '../../lib/styles/palette';

const StyledButton = Styled.button`
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: bold;
  padding: 0.25rem 1rem;
  color: white;
  outline: none;
  cursor: pointer;

  background: ${palette.gray[8]};
  &:hover {
      background: ${palette.gray[6]};
  }

  ${(props) =>
    props.fullWidth &&
    css`
      padding-top: 0.75rem;
      padding-bottom: 0.75rem;
      width: 100%;
      font-size: 1.125rem;
    `}
  
  ${(props) =>
    props.yellow &&
    css`
      background: ${palette.yellow[5]};
      &:hover {
        background: ${palette.yellow[4]};
      }
    `}
`;

const Button = (props) => <StyledButton {...props} />;

export default Button;
