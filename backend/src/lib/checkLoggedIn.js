// 로그인을 해야 글쓰기, 수정, 삭제 가능하도록

const checkLoggedIn = (ctx, next) => {
  if (!ctx.state.user) {
    ctx.status = 401;
    return;
  }
  return next();
};

export default checkLoggedIn;
