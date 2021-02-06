import Post from '../../models/post';
import mongoose from 'mongoose';
import Joi from '@hapi/joi'; // 요청 내용 검증을 위한 라이브러리

const { ObjectId } = mongoose.Types;

// (post)id 값으로 post 조회
// 해당 post를 상태값(state)에 담음
export const getPostById = async (ctx, next) => {
  const { id } = ctx.params;
  if (!ObjectId.isValid(id)) {
    ctx.status = 400; // bad request (클라이언트의 요청이 잘못 됨)
    return;
  }
  try {
    const post = await Post.findById(id);
    // 포스트가 존재하지 않다면 에러
    if (!post) {
      ctx.status = 404; // Not Found
      return;
    }
    ctx.state.post = post;
    return next();
  } catch (e) {
    ctx.throw(500, e);
  }
};

// (post)id로 찾은 포스트가 로그인 중인 사용자가 작성한 것인지 확인
// 작성자만 수정, 삭제할 수 있도록 하기 위함
export const checkOwnPost = (ctx, next) => {
  const { user, post } = ctx.state;
  if (post.user._id.toString() !== user._id) {
    ctx.status = 403;
    return;
  }
  return next();
};

export const write = async (ctx) => {
  const schema = Joi.object().keys({
    // 객체가 아래 필드를 가지고 있는지 검증
    title: Joi.string().required(), // required(): 필수 항목이라는 뜻
    body: Joi.string().required(),
    tags: Joi.array().items(Joi.string()).required(),
  });

  // 검증하고 나서 실패인 경우 에러 처리
  const result = schema.validate(ctx.request.body);
  if (result.error) {
    ctx.status = 400; // bad request
    ctx.body = result.error;
    return;
  }

  const { title, body, tags } = ctx.request.body;
  const post = new Post({
    title,
    body,
    tags,
    user: ctx.state.user,
  });
  try {
    await post.save(); // save(): 데이터베이스에 정보 저장
    ctx.body = post;
  } catch (e) {
    ctx.throw(500, e);
  }
};

export const list = async (ctx) => {
  // query로 page number를 받아온다. 문자열이기 때문에 숫자로 변환해야 함
  // 값이 없으면 1을 기본값으로 한다.
  const page = parseInt(ctx.query.page || '1', 10);

  if (page < 1) {
    ctx.status = 400;
    return;
  }

  const { tag, username } = ctx.query;
  // tag, username 값이 유효하면 객체 안에 넣고, 그렇지 않으면 넣지 않음
  const query = {
    ...(username ? { 'user.username': username } : {}),
    ...(tag ? { tags: tag } : {}),
  };

  try {
    const posts = await Post.find(query)
      .sort({ _id: -1 }) // 가장 최근 게시물이 위에 있도록 하기 위해 id를 기준으로 내림차순 정렬
      .limit(10) // 한 페이지에 보이는 게시물의 개수를 제한
      .skip((page - 1) * 10) // page가 달라질 때마다 다음 데이터 불러옴
      .lean() // toJson() 대신 사용
      .exec(); // exec를 붙여줘야 서버에 쿼리를 요청함

    // 마지막 페이지 조회 (커스텀 헤더 설정)
    const postCount = await Post.countDocuments().exec();
    ctx.set('Last-Page', Math.ceil(postCount / 10));
    ctx.body = posts.map((post) => ({
      ...post,
      body:
        post.body.length < 200 ? post.body : `${post.body.slice(0, 200)}...`,
    }));
  } catch (e) {
    ctx.throw(500, e);
  }
};

export const read = async (ctx) => {
  ctx.body = ctx.state.post;
};

export const remove = async (ctx) => {
  const { id } = ctx.params;
  try {
    await Post.findByIdAndRemove(id).exec();
    ctx.status = 204; // no content (성공 했으나, 응답할 데이터 없음)
  } catch (e) {
    ctx.throw(500, e);
  }
};

export const update = async (ctx) => {
  const { id } = ctx.params;
  const schema = Joi.object().keys({
    title: Joi.string(),
    body: Joi.string(),
    tags: Joi.array().items(Joi.string()),
  });

  // 검증하고 나서 실패인 경우 에러 처리
  const result = schema.validate(ctx.request.body);
  if (result.error) {
    ctx.status = 400;
    ctx.body = result.error;
    return;
  }

  try {
    const post = await Post.findByIdAndUpdate(id, ctx.request.body, {
      new: true, // 업데이트된 데이터를 반환
      // false로 설정할 경우, 업데이트가 되기 전의 데이터를 반환
    }).exec();
    if (!post) {
      ctx.status = 404;
      return;
    }
    ctx.body = post;
  } catch (e) {
    ctx.throw(500, e);
  }
};
