import createClient from "@/utils/supabase/client";

//게시글 목록 전체 불러오기
export const fetchPost = async () => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("Post")
    .select(
      `
      post_id,
      user_id,
      category_id,
      title,
      contents,
      content_image,
      view_count,
      like_count,
      created_at,
      Comments(count)
    `
    )
    .order("created_at", { ascending: false });
  if (error) {
    console.error("게시글 불러오기 실패");
    throw new Error("게시글을 불러오는데 실패했습니다.");
  }
  return (
    data?.map((post) => ({
      ...post,
      comment_count: post.Comments?.[0]?.count ?? 0,
    })) ?? []
  );
};

// 아이디로 게시글 불러오기
export const fetchPostById = async (postId: string) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("Post")
    .select("*")
    .eq("post_id", postId)
    .single();
  if (error) {
    console.error("게시글 불러오기 실패");
    throw new Error("게시글을 불러오는데 실패했습니다.");
  }
  return data;
};

// 게시글 작성자 정보 불러오기(이름,프로필사진)
export const fetchWriter = async (userId: string) => {
  if (!userId) return null;
  const supabase = createClient();
  const { data, error } = await supabase
    .from("User")
    .select("nickname, profile_image")
    .eq("user_id", userId);
  if (error) {
    console.error("작성자 정보 불러오기 실패", error.message);
    throw new Error("작성자 정보를 불러오는데 실패했습니다.");
  }
  return data[0] ?? null;
};

//게시글 좋아요 수 불러오기
export const fetchLike = async (postId: string) => {
  const supabase = createClient();
  const { count, error } = await supabase
    .from("Like")
    .select("*", { count: "exact", head: true })
    .eq("post_id", postId);

  if (error) {
    console.error("좋아요 정보 불러오기 실패", error.message);
    throw new Error("좋아요 정보를 불러오는데 실패했습니다.");
  }
  return count ?? 0;
};

//게시글 좋아요 수 업데이트
export const postLike = async (postId: string, userId: string) => {
  const supabase = createClient();
  if (userId) {
    const { error: likeError } = await supabase
      .from("Like")
      .insert([
        {
          user_id: userId,
          post_id: postId,
          comment_id: null,
          news_id: null,
        },
      ])
      .select();
    if (likeError) {
      console.error("좋아요 업로드 실패:", likeError);
      throw new Error("좋아요 저장 실패");
    }

    //현재 좋아요수 재계산
    const count = await fetchLike(postId);

    //Post의 like_count 업데이트
    const { error: postUpdateError } = await supabase
      .from("Post")
      .update({ like_count: count ?? 0 })
      .eq("post_id", postId);
    if (postUpdateError) {
      console.error("게시글 like_count 업데이트 실패:", postUpdateError);
      throw new Error("게시글 like_count 업데이트 실패");
    }
    return count ?? 0;
  }
};

//좋아요 삭제
export const postUnlike = async (postId: string, userId: string) => {
  const supabase = createClient();
  if (!userId || !postId) {
    console.warn("userId나 postId가 없습니다");
    return;
  }
  const { error: deleteError } = await supabase
    .from("Like")
    .delete()
    .eq("post_id", postId)
    .eq("user_id", userId);
  if (deleteError) {
    console.error("좋아요 삭제 실패", deleteError);
    throw new Error("좋아요 삭제 실패");
  }

  //좋아요수 재계산
  const count = await fetchLike(postId);

  //Post의 like_count 업데이트
  const { error: postUpdateError } = await supabase
    .from("Post")
    .update({ like_count: count ?? 0 })
    .eq("post_id", postId);
  if (postUpdateError) {
    console.error("게시글 like_count 업데이트 실패:", postUpdateError);
    throw new Error("게시글 like_count 업데이트 실패");
  }
  return count ?? 0;
};

//현재 로그인 유저의 좋아요 여부
export const isLikedByUser = async (postId: string, userId: string) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("Like")
    .select("like_id")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();
  if (error) {
    console.error("좋아요 상태 확인 실패:", error);
    return false;
  }
  return !!data;
};

//post-create
export const postCreate = async (
  userId: string,
  categoryId: string,
  title: string,
  content: string,
  content_image: string | null
) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("Post")
    .insert([
      {
        user_id: userId,
        category_id: categoryId,
        title: title,
        contents: content,
        content_image: content_image,
      },
    ])
    .select();
  if (error) {
    console.error("게시글 업로드 실패:", error);
  }
  return data;
};

// post-update
export const postUpdate = async (
  postId: string,
  userId: string,
  categoryId: string,
  title: string,
  content: string,
  content_image: string | null
) => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("Post")
    .update({
      post_id: postId,
      user_id: userId,
      category_id: categoryId,
      title: title,
      contents: content,
      content_image: content_image,
    })
    .eq("post_id", postId)
    .eq("user_id", userId)
    .select();

  if (error) {
    console.error("게시글 수정 실패:", error);
    throw error;
  }

  return data;
};

// post-delete
export const postDelete = async (postId: string, userId: string) => {
  const supabase = createClient();

  const { error } = await supabase
    .from("Post")
    .delete()
    .eq("id", postId)
    .eq("user_id", userId);

  if (error) {
    console.error("게시글 삭제 실패:", error);
    throw error;
  }

  return true;
};

//댓글 불러오기
export const fetchComment = async (postId: string) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("Comments")
    .select("*")
    .eq("post_id", postId);
  if (error) {
    console.error("댓글 정보 불러오기 실패:", error);
  } else {
    return data;
  }
};
//댓글 추가
export const postComment = async (
  comment: string,
  userId: string,
  postId: string
) => {
  const supabase = createClient();
  if (!userId || !postId || !comment) {
    console.warn("userId,postId 또는 comment가 없습니다");
    return;
  }
  const { data, error } = await supabase
    .from("Comments")
    .insert([
      {
        user_id: userId,
        post_id: postId,
        content: comment,
      },
    ])
    .select();

  if (error) {
    console.error("댓글 업로드 실패:", error);
    throw new Error("댓글 저장 실패");
  }
  return data;
};
//댓글 수정
export const updateComment = async (commentId: string, comment: string) => {
  const supabase = createClient();
  if (!commentId || !comment) {
    console.warn("userId,postId 또는 comment가 없습니다");
    return;
  }
  const { data, error } = await supabase
    .from("Comments")
    .update([
      {
        content: comment,
      },
    ])
    .eq("comment_id", commentId);

  if (error) {
    console.error("댓글 수정 실패:", error);
  }
  return data;
};

//댓글 삭제
export const deleteComment = async (commentId: string) => {
  const supabase = createClient();
  if (!commentId) {
    console.warn("댓글 id가 없습니다");
    return;
  }
  const { error: deleteError } = await supabase
    .from("Comments")
    .delete()
    .eq("comment_id", commentId);
  if (deleteError) {
    console.error("댓글 삭제 실패", deleteError);
  }
};

//조회수 업데이트
export const postView = async (postId: string, viewcnt: number) => {
  const supabase = createClient();
  if (postId) {
    const { data, error } = await supabase
      .from("Post")
      .update({
        view_count: viewcnt,
      })
      .eq("post_id", postId);

    if (error) {
      console.error("조회수 업로드 실패:", error);
      throw new Error("조회수 저장 실패");
    }
    return data;
  }
};

//관심사 불러오기
export const fetchInterests = async (userId: string) => {
  const supabase = createClient();
  if (!userId) {
    console.error("userid가 존재하지 않습니다");
    return;
  }
  const { data, error } = await supabase
    .from("User_Interests")
    .select("category_id")
    .eq("user_id", userId);
  if (error) {
    console.error("관심사 불러오기 실패", error);
  }
  return data ?? [];
};
