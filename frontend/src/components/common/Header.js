import React from 'react';
import Styled from 'styled-components';
import { Link } from 'react-router-dom';
import Responsive from './Responsive';
import Button from './Button';

const HeaderBlock = Styled.div`
  position: fixed;
  width: 100%;
  background: white;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.08);
`;
// Responsive 컴포넌트의 속성에 스타일을 추가해서 새로운 컴포넌트 생성
const Wrapper = Styled(Responsive)`
  height: 4rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  .logo {
    font-size: 1.125rem;
    font-weight: 800;
    letter-spacing: 2px;
  }
  .right {
      display: flex;
      align-items: center;
  }
`;
// 헤더를 fixed 설정 했기 때문에 페이지의 콘텐츠가 4rem 아래에 나타나도록 하기 위해
const Spacer = Styled.div`
  height: 4rem;
`;

const UserInfo = Styled.div`
  font-weight: 800;
  margin-right: 1rem;
`;

const Header = ({ user, onLogout }) => {
  return (
    <>
      <HeaderBlock>
        <Wrapper>
          <Link to="/" className="logo">
            Simple Blog
          </Link>
          {user ? (
            <div className="right">
              <UserInfo>{user.username}</UserInfo>
              <Button onClick={onLogout}>logout</Button>
            </div>
          ) : (
            <div className="right">
              <Button to="/login">login</Button>
            </div>
          )}
        </Wrapper>
      </HeaderBlock>
      <Spacer />
    </>
  );
};

export default Header;
