import { NavLink } from 'react-router-dom';
import styled from "styled-components";

export const PageContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
`

export const LinkExample = styled(NavLink)`
  text-decoration: none;
  color: ${(props) => props.theme.colors.gray[100]};

  &:hover {
    color: ${(props) => props.theme.colors.red[500]};
  }
`

export const AreaChart = styled.div`
  background-color: ${(props) => props.theme.colors.gray[400]};
  width: 100%;
  height: 100%;
`