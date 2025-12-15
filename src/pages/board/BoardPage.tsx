import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import DefaultButton from "@/components/button/DefaultButton";

type PostCategory = "notice" | "free";

interface Comment {
  id: number;
  author: string;
  content: string;
  createdAt: string;
}

interface Post {
  id: number;
  category: PostCategory;
  title: string;
  content: string;
  author: string;
  authorInfo?: string;
  createdAt: string;
  views: number;
  likes: number;
  comments: Comment[];
  isLiked?: boolean;
  isBookmarked?: boolean;
}

const BoardPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<PostCategory>("notice");
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1,
      category: "notice",
      title: "TECHVIEW 서비스 오픈 안내",
      content: "TECHVIEW 서비스가 정식 오픈되었습니다. 많은 이용 부탁드립니다.",
      author: "관리자",
      authorInfo: "TECHVIEW 운영팀",
      createdAt: new Date().toISOString(),
      views: 156,
      likes: 12,
      comments: [],
      isLiked: false,
      isBookmarked: false,
    },
  ]);
  const [isWriting, setIsWriting] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    category: "notice" as PostCategory,
    thumbnail: null as File | null,
    hashtags: [] as string[],
  });
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [newComment, setNewComment] = useState("");
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  const availableHashtags = [
    "신입",
    "취업",
    "이직",
    "잡담",
    "면접",
    "자소서",
    "커리어",
    "퇴사",
    "채용",
    "경력",
    "회사생활",
  ];

  const filteredPosts = posts.filter((post) => post.category === selectedCategory);

  const handleWritePost = () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }

    if (newPost.title.length > 50) {
      alert("제목은 최대 50자까지 입력 가능합니다.");
      return;
    }

    if (newPost.content.length > 5000) {
      alert("내용은 최대 5000자까지 입력 가능합니다.");
      return;
    }

    const post: Post = {
      id: posts.length + 1,
      category: newPost.category,
      title: newPost.title,
      content: newPost.content,
      author: "사용자",
      authorInfo: "개발자",
      createdAt: new Date().toISOString(),
      views: 0,
      likes: 0,
      comments: [],
      isLiked: false,
      isBookmarked: false,
    };

    setPosts([post, ...posts]);
    setNewPost({ title: "", content: "", category: "notice", thumbnail: null, hashtags: [] });
    setThumbnailPreview(null);
    setIsWriting(false);
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("이미지 크기는 최대 2MB까지 가능합니다.");
        return;
      }
      setNewPost({ ...newPost, thumbnail: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleHashtag = (tag: string) => {
    if (newPost.hashtags.includes(tag)) {
      setNewPost({
        ...newPost,
        hashtags: newPost.hashtags.filter((t) => t !== tag),
      });
    } else {
      if (newPost.hashtags.length >= 5) {
        alert("해시태그는 최대 5개까지 선택 가능합니다.");
        return;
      }
      setNewPost({
        ...newPost,
        hashtags: [...newPost.hashtags, tag],
      });
    }
  };

  const handleLike = (postId: number) => {
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            isLiked: !post.isLiked,
          };
        }
        return post;
      })
    );
    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost({
        ...selectedPost,
        likes: selectedPost.isLiked ? selectedPost.likes - 1 : selectedPost.likes + 1,
        isLiked: !selectedPost.isLiked,
      });
    }
  };

  const handleBookmark = (postId: number) => {
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            isBookmarked: !post.isBookmarked,
          };
        }
        return post;
      })
    );
    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost({
        ...selectedPost,
        isBookmarked: !selectedPost.isBookmarked,
      });
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !selectedPost) return;

    const comment: Comment = {
      id: selectedPost.comments.length + 1,
      author: "사용자",
      content: newComment,
      createdAt: new Date().toISOString(),
    };

    const updatedPost = {
      ...selectedPost,
      comments: [...selectedPost.comments, comment],
    };

    setSelectedPost(updatedPost);
    setPosts(posts.map((post) => (post.id === selectedPost.id ? updatedPost : post)));
    setNewComment("");
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "방금 전";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}일 전`;

    return date.toLocaleDateString("ko-KR", {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      <main className="flex-1 px-4 py-8">
        <div className="mx-auto max-w-4xl">
          {/* 헤더 */}
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-gray-900">게시글</h1>
          </div>

          {/* 카테고리 탭 */}
          <div className="flex gap-1 mb-6 border-b border-gray-200">
            <button
              onClick={() => {
                setSelectedCategory("notice");
                setSelectedPost(null);
              }}
              className={`px-4 py-3 font-medium transition border-b-2 ${
                selectedCategory === "notice"
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              공지사항
            </button>
            <button
              onClick={() => {
                setSelectedCategory("free");
                setSelectedPost(null);
              }}
              className={`px-4 py-3 font-medium transition border-b-2 ${
                selectedCategory === "free"
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              자유게시판
            </button>
          </div>

          {/* 글쓰기 버튼 */}
          {!isWriting && !selectedPost && (
            <div className="flex justify-end mb-6">
              <button
                onClick={() => {
                  setIsWriting(true);
                  setSelectedPost(null);
                  setNewPost({
                    title: "",
                    content: "",
                    category: selectedCategory,
                    thumbnail: null,
                    hashtags: [],
                  });
                  setThumbnailPreview(null);
                }}
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                글쓰기
              </button>
            </div>
          )}

          {/* 글쓰기 폼 */}
          {isWriting && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* 카테고리 선택 */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex gap-4 items-center">
                  <label className="text-sm font-semibold text-gray-900">카테고리</label>
                  <select
                    value={newPost.category}
                    onChange={(e) =>
                      setNewPost({ ...newPost, category: e.target.value as PostCategory })
                    }
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="notice">공지사항</option>
                    <option value="free">자유게시판</option>
                  </select>
                </div>
              </div>

              {/* 내용 섹션 */}
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">내용</h3>
                  <p className="mb-4 text-sm text-gray-600">
                    구체적으로 작성하면 더 많은 답변을 받을 수 있어요
                  </p>

                  {/* 제목 입력 */}
                  <div className="mb-4">
                    <input
                      type="text"
                      value={newPost.title}
                      onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                      maxLength={50}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="질문 제목을 입력해주세요(최대 50자)"
                    />
                    <div className="mt-1 text-right text-xs text-gray-500">
                      {newPost.title.length}/50자
                    </div>
                  </div>

                  {/* 본문 입력 */}
                  <div className="relative">
                    <textarea
                      value={newPost.content}
                      onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                      maxLength={5000}
                      rows={12}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder="구체적으로 작성하면 더 많은 답변을 받을 수 있어요"
                    />
                    <div className="absolute bottom-3 right-3 text-xs text-gray-500">
                      {newPost.content.length}/5000자
                    </div>
                  </div>
                </div>

                {/* 게시 규칙 안내 */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <ul className="space-y-2 text-xs text-gray-600">
                    <li>• 등록한 글은 게시판에서 사용중인 닉네임으로 등록됩니다.</li>
                    <li>
                      • 저작권 침해, 음란, 청소년 유해물, 기타 위법자료 등을 게시할 경우 게시물은
                      경고 없이 삭제 됩니다.
                    </li>
                    <li>• 댓글이 등록되면 게시글 삭제가 불가합니다.</li>
                  </ul>
                </div>

                {/* 썸네일 등록 */}
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-gray-900">썸네일 등록</h3>
                  <p className="mb-3 text-xs text-gray-600">
                    썸네일은 리스트에 80*80으로 노출됩니다.
                  </p>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      className="hidden"
                      id="thumbnail-upload"
                    />
                    <label
                      htmlFor="thumbnail-upload"
                      className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition"
                    >
                      {thumbnailPreview ? (
                        <img
                          src={thumbnailPreview}
                          alt="썸네일 미리보기"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <>
                          <svg
                            className="w-12 h-12 text-gray-400 mb-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                          <p className="text-sm text-gray-600">
                            이미지를 등록해주세요(최대 2MB)
                          </p>
                        </>
                      )}
                    </label>
                    {thumbnailPreview && (
                      <button
                        onClick={() => {
                          setThumbnailPreview(null);
                          setNewPost({ ...newPost, thumbnail: null });
                        }}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* 해시태그 선택 */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-gray-900">
                    해시태그 최대 5개까지 선택가능합니다
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {availableHashtags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => toggleHashtag(tag)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                          newPost.hashtags.includes(tag)
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 등록 버튼 */}
                <div className="pt-4">
                  <button
                    onClick={handleWritePost}
                    className="w-full py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    게시글 등록하기
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 게시글 목록 */}
          {!isWriting && !selectedPost && (
            <div className="space-y-4">
              {filteredPosts.length === 0 ? (
                <div className="p-12 text-center text-gray-500 bg-gray-50 rounded-lg">
                  <p>아직 작성된 글이 없습니다.</p>
                </div>
              ) : (
                filteredPosts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => {
                      setSelectedPost({ ...post, views: post.views + 1 });
                      setPosts(
                        posts.map((p) => (p.id === post.id ? { ...p, views: p.views + 1 } : p))
                      );
                    }}
                    className="p-6 bg-white border border-gray-200 rounded-lg cursor-pointer transition hover:border-gray-300 hover:shadow-sm"
                  >
                    <h3 className="mb-3 text-lg font-semibold text-gray-900">{post.title}</h3>
                    <p className="mb-4 text-sm text-gray-600 line-clamp-2">{post.content}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex gap-4 items-center text-xs text-gray-500">
                        <div className="flex gap-2 items-center">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 text-xs font-medium">
                              {post.author.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-700">{post.author}</div>
                            {post.authorInfo && (
                              <div className="text-gray-500">{post.authorInfo}</div>
                            )}
                          </div>
                        </div>
                        <span>·</span>
                        <span>{formatRelativeTime(post.createdAt)}</span>
                      </div>
                      <div className="flex gap-4 items-center text-xs text-gray-500">
                        <span>좋아요 {post.likes}</span>
                        <span>댓글 {post.comments.length}</span>
                        <span>조회 {post.views}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 게시글 상세 */}
          {selectedPost && !isWriting && (
            <div className="space-y-6">
              {/* 카테고리 */}
              <div className="text-sm text-gray-600">
                {selectedPost.category === "notice" ? "공지사항" : "자유게시판"}
              </div>

              {/* 제목 */}
              <h1 className="text-2xl font-bold text-gray-900">{selectedPost.title}</h1>

              {/* 메타 정보 */}
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>
                  작성 {formatRelativeTime(selectedPost.createdAt)} · 조회 {selectedPost.views}
                </span>
              </div>

              {/* 액션 버튼 */}
              <div className="flex gap-4 pb-4 border-b border-gray-200">
                <button
                  onClick={() => handleLike(selectedPost.id)}
                  className={`flex gap-2 items-center px-4 py-2 rounded-lg transition ${
                    selectedPost.isLiked
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill={selectedPost.isLiked ? "currentColor" : "none"}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                    />
                  </svg>
                  <span>{selectedPost.likes}</span>
                </button>
                <button
                  onClick={() => handleBookmark(selectedPost.id)}
                  className={`flex gap-2 items-center px-4 py-2 rounded-lg transition ${
                    selectedPost.isBookmarked
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill={selectedPost.isBookmarked ? "currentColor" : "none"}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                    />
                  </svg>
                  <span>북마크</span>
                </button>
                <button className="flex gap-2 items-center px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-100 transition">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                  </svg>
                  <span>공유하기</span>
                </button>
              </div>

              {/* 작성자 프로필 */}
              <div className="flex gap-4 items-center p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-medium">
                    {selectedPost.author.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{selectedPost.author}</div>
                  {selectedPost.authorInfo && (
                    <div className="text-sm text-gray-600">{selectedPost.authorInfo}</div>
                  )}
                  <div className="text-xs text-gray-500 mt-1">
                    팔로워 0 · 팔로잉 0
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition text-sm font-medium">
                    팔로우
                  </button>
                  <button className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium">
                    프로필 보기
                  </button>
                </div>
              </div>

              {/* 본문 */}
              <div className="pt-6">
                <p className="leading-relaxed text-gray-700 whitespace-pre-wrap">
                  {selectedPost.content}
                </p>
              </div>

              {/* 댓글 섹션 */}
              <div className="pt-6 border-t border-gray-200">
                <div className="mb-4 text-lg font-semibold text-gray-900">
                  댓글 {selectedPost.comments.length}
                </div>
                <p className="mb-4 text-sm text-gray-600">따뜻한 댓글을 남겨주세요 :)</p>

                {/* 댓글 입력 */}
                <div className="mb-6">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="댓글을 입력해주세요 :)"
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500">
                      {newComment.length}/5000자
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setNewComment("")}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition text-sm"
                      >
                        취소
                      </button>
                      <button
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                        className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        등록
                      </button>
                    </div>
                  </div>
                </div>

                {/* 댓글 목록 */}
                {selectedPost.comments.length === 0 ? (
                  <div className="py-8 text-center text-gray-500 text-sm">
                    아직 댓글이 없습니다.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedPost.comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-gray-600 text-xs font-medium">
                            {comment.author.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="mb-1">
                            <span className="font-medium text-gray-900 text-sm">
                              {comment.author}
                            </span>
                            <span className="ml-2 text-xs text-gray-500">
                              {formatRelativeTime(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 목록으로 버튼 */}
              <div className="pt-6 border-t border-gray-200">
                <button
                  onClick={() => setSelectedPost(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                  ← 목록으로
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BoardPage;

