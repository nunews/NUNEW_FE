interface Post {
  post_id: string;
  user_id: string;
  category_id: string;
  title: string;
  contents: string;
  content_image: string;
  created_at: string;
  view_count: number;
  like_count: number;
  comment_count?: number;
}

interface Comment {
  comment_id: string;
  user_id: string;
  post_id: string;
  content: string;
  created_at: string;
}

interface Like {
  like_id: number;
  user_id: number;
  post_id: number;
  comment_id: number;
  news_id?: number;
  created_at: string;
}

interface User {
  user_id: string;
  email: string;
  name: string;
  nickname: string;
  profile_image: string;
  age_range: string;
  gender: string;
  created_at?: string;
}
