import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAuthStore } from "@/stores/authStore";
import * as postApi from "@/api/post";
import * as commentApi from "@/api/comment";

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
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const refreshUser = useAuthStore((state) => state.refreshUser);

  // 페이지 로드 시 user 정보 확인 및 갱신
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token && !user) {
      // 토큰이 있지만 user 정보가 없으면 갱신 시도
      refreshUser();
    }
  }, [user, refreshUser]);
  const [selectedCategory, setSelectedCategory] = useState<PostCategory>("notice");
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isWriting, setIsWriting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    name: "",
    password: "",
    category: "free" as PostCategory, // 일반 유저는 기본값을 자유게시판으로
  });
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [newComment, setNewComment] = useState("");
  const [commentPassword, setCommentPassword] = useState("");
  const [isLoadingPost, setIsLoadingPost] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [postToDelete, setPostToDelete] = useState<number | null>(null);
  const [showCommentDeleteModal, setShowCommentDeleteModal] = useState(false);
  const [commentDeletePassword, setCommentDeletePassword] = useState("");
  const [commentToDelete, setCommentToDelete] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editPost, setEditPost] = useState({ title: "", content: "", password: "" });
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editComment, setEditComment] = useState({ content: "", password: "" });


  // 게시글 목록 로드
  useEffect(() => {
    const loadPosts = async () => {
      setIsLoading(true);
      try {
        const apiPosts = await postApi.getPosts();
        // 각 게시글의 댓글 수를 가져와서 변환
        const convertedPosts: Post[] = await Promise.all(
          apiPosts.map(async (post) => {
            try {
              const apiComments = await commentApi.getComments(post.postId);
              return {
                id: post.postId, // postId를 id로 매핑
                category: "free" as PostCategory, // API에 category가 없으면 기본값으로 설정 (추후 API에 추가되면 수정 필요)
                title: post.title,
                content: post.content || "", // API 응답에 content가 없을 수 있음
                author: post.name,
                createdAt: post.createAt,
                views: post.views || 0,
                likes: post.likeCount,
                comments: apiComments.map((comment) => ({
                  id: comment.commentId,
                  author: comment.userName,
                  content: comment.content,
                  createdAt: comment.createAt,
                })),
                isLiked: false,
                isBookmarked: false,
              };
            } catch (error) {
              console.error(`게시글 ${post.postId}의 댓글 로드 실패:`, error);
              return {
                id: post.postId,
                category: "free" as PostCategory,
                title: post.title,
                content: post.content || "",
                author: post.name,
                createdAt: post.createAt,
                views: post.views || 0,
                likes: post.likeCount,
                comments: [],
                isLiked: false,
                isBookmarked: false,
              };
            }
          })
        );
        setPosts(convertedPosts);
      } catch (error) {
        console.error("게시글 목록 로드 실패:", error);
        // 에러 발생 시 빈 배열로 설정
        setPosts([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadPosts();
  }, []);

  const filteredPosts = posts.filter((post) => post.category === selectedCategory);

  const handleWritePost = async () => {
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

    // 인증 확인
    if (!isAuthenticated) {
      alert("게시글 작성은 로그인이 필요합니다.");
      return;
    }

    // password 필수
    if (!newPost.password.trim()) {
      alert("비밀번호를 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      // API 호출 데이터 준비
      // API 스펙: 인증 필요, title, content, password만 필요 (name 불필요)
      const requestData: postApi.CreatePostRequest = {
        title: newPost.title.trim(),
        content: newPost.content.trim(),
      };

      // password 필드: 필수
      const userPassword = newPost.password.trim();
      if (!userPassword) {
        alert("비밀번호를 입력해주세요.");
        setIsSubmitting(false);
        return;
      }
      
      requestData.password = userPassword;

      console.log("게시글 작성 요청 데이터:", requestData);
      const token = localStorage.getItem("accessToken");
      console.log("인증 상태:", { 
        isAuthenticated, 
        user, 
        hasToken: !!token,
        tokenPreview: token ? token.substring(0, 20) + "..." : "없음"
      });
      const response = await postApi.createPost(requestData);
      console.log("게시글 작성 응답:", response);

      // 성공 시 게시글 목록 다시 로드
      const apiPosts = await postApi.getPosts();
      const convertedPosts: Post[] = apiPosts.map((post) => ({
        id: post.postId,
        category: "free" as PostCategory,
        title: post.title,
        content: post.content || "",
        author: post.name,
        createdAt: post.createAt,
        views: post.views || 0,
        likes: post.likeCount,
        comments: [],
        isLiked: false,
        isBookmarked: false,
      }));
      setPosts(convertedPosts);
      setNewPost({ 
        title: "", 
        content: "", 
        name: "",
        password: "",
        category: "free", 
      });
      setIsWriting(false);
      alert("게시글이 작성되었습니다.");
    } catch (error: any) {
      console.error("게시글 작성 실패:", error);
      console.error("에러 상세 정보:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        requestData: error.config?.data,
        requestHeaders: error.config?.headers,
        authorizationHeader: error.config?.headers?.Authorization || "없음",
        url: error.config?.url,
      });
      console.error("에러 응답 data 상세:", JSON.stringify(error.response?.data, null, 2));
      console.error("에러 응답 전체:", error.response);
      
      // 서버에서 보낸 에러 메시지가 있으면 사용, 없으면 기본 메시지
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error
        || error.message 
        || "게시글 작성에 실패했습니다.";
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleLike = async (postId: number) => {
    // 인증이 필요한 경우 체크
    if (!isAuthenticated) {
      alert("좋아요는 로그인이 필요합니다.");
      return;
    }

    try {
      // API 호출
      await postApi.likePost(postId);
      
      // 성공 시 UI 업데이트
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
    } catch (error: any) {
      console.error("좋아요 실패:", error);
      const errorMessage = error.response?.data?.message 
        || error.message 
        || "좋아요 처리에 실패했습니다.";
      alert(errorMessage);
    }
  };

  const handleBookmark = async (postId: number) => {
    // 인증이 필요한 경우 체크
    if (!isAuthenticated) {
      alert("북마크는 로그인이 필요합니다.");
      return;
    }

    try {
      // API 호출
      await postApi.toggleBookmark(postId);
      
      // 성공 시 UI 업데이트
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
    } catch (error: any) {
      console.error("북마크 실패:", error);
      const errorMessage = error.response?.data?.message 
        || error.message 
        || "북마크 처리에 실패했습니다.";
      alert(errorMessage);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedPost) return;

    // 인증이 필요한 경우 체크
    if (!isAuthenticated) {
      alert("댓글 작성은 로그인이 필요합니다.");
      return;
    }

    // 비밀번호 확인
    if (!commentPassword.trim()) {
      alert("댓글 삭제/수정을 위한 비밀번호를 입력해주세요.");
      return;
    }

    try {
      // API 호출 (인증 필요, password 필수)
      const requestData: commentApi.CreateCommentRequest = {
        content: newComment.trim(),
        postId: selectedPost.id,
        password: commentPassword.trim(),
      };

      console.log("댓글 작성 요청 데이터:", requestData);
      await commentApi.createComment(requestData);

      // 성공 시 댓글 목록 다시 로드
      const apiComments = await commentApi.getComments(selectedPost.id);
      const convertedComments: Comment[] = apiComments.map((comment) => ({
        id: comment.commentId,
        author: comment.userName,
        content: comment.content,
        createdAt: comment.createAt,
      }));

      const updatedPost: Post = {
        ...selectedPost,
        comments: convertedComments,
      };

      setSelectedPost(updatedPost);
      setPosts(posts.map((post) => (post.id === selectedPost.id ? updatedPost : post)));
      setNewComment("");
      setCommentPassword("");
    } catch (error: any) {
      console.error("댓글 작성 실패:", error);
      console.error("에러 상세 정보:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        requestData: error.config?.data,
      });
      console.error("에러 응답 data 상세:", JSON.stringify(error.response?.data, null, 2));
      
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error
        || error.message 
        || "댓글 작성에 실패했습니다.";
      alert(errorMessage);
    }
  };

  const handleEditClick = () => {
    if (!selectedPost) return;
    setEditPost({
      title: selectedPost.title,
      content: selectedPost.content,
      password: "",
    });
    setIsEditing(true);
  };

  const handleUpdatePost = async () => {
    if (!selectedPost || !editPost.title.trim() || !editPost.content.trim()) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }

    if (!editPost.password.trim()) {
      alert("비밀번호를 입력해주세요.");
      return;
    }

    try {
      await postApi.updatePost(selectedPost.id, {
        title: editPost.title.trim(),
        content: editPost.content.trim(),
        password: editPost.password.trim(),
      });

      // 성공 시 게시글 상세 정보 다시 로드
      const updatedPostDetail = await postApi.getPost(selectedPost.id);
      const apiComments = await commentApi.getComments(selectedPost.id);
      const convertedComments: Comment[] = apiComments.map((comment) => ({
        id: comment.commentId,
        author: comment.userName,
        content: comment.content,
        createdAt: comment.createAt,
      }));

      const convertedPost: Post = {
        id: updatedPostDetail.postId,
        category: selectedPost.category,
        title: updatedPostDetail.title,
        content: updatedPostDetail.content || "",
        author: updatedPostDetail.name,
        createdAt: updatedPostDetail.createAt,
        views: updatedPostDetail.views || 0,
        likes: updatedPostDetail.likeCount,
        comments: convertedComments,
        isLiked: selectedPost.isLiked,
        isBookmarked: selectedPost.isBookmarked,
      };

      setSelectedPost(convertedPost);
      setPosts(posts.map((post) => (post.id === selectedPost.id ? convertedPost : post)));
      setIsEditing(false);
      setEditPost({ title: "", content: "", password: "" });
      alert("게시글이 수정되었습니다.");
    } catch (error: any) {
      console.error("게시글 수정 실패:", error);
      const errorMessage = error.response?.data?.message 
        || error.message 
        || "게시글 수정에 실패했습니다.";
      alert(errorMessage);
    }
  };

  const handleDeleteClick = (postId: number) => {
    setPostToDelete(postId);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!postToDelete || !deletePassword.trim()) {
      alert("비밀번호를 입력해주세요.");
      return;
    }

    try {
      await postApi.deletePost(postToDelete, { password: deletePassword });
      // 삭제 성공 시 목록에서 제거
      setPosts(posts.filter((post) => post.id !== postToDelete));
      if (selectedPost && selectedPost.id === postToDelete) {
        setSelectedPost(null);
      }
      setShowDeleteModal(false);
      setDeletePassword("");
      setPostToDelete(null);
      alert("게시글이 삭제되었습니다.");
    } catch (error: any) {
      console.error("게시글 삭제 실패:", error);
      console.error("에러 상세 정보:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });
      
      let errorMessage = "게시글 삭제에 실패했습니다.";
      
      if (error.response?.status === 500) {
        // 서버 내부 에러 (외래키 제약 조건 위반 등)
        const errorData = error.response?.data;
        if (errorData?.message?.includes("foreign key") || 
            errorData?.message?.includes("constraint") ||
            errorData?.message?.includes("참조")) {
          errorMessage = "이 게시글은 다른 데이터와 연결되어 있어 삭제할 수 없습니다. (관련된 좋아요나 북마크가 있을 수 있습니다)";
        } else {
          errorMessage = errorData?.message || "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
        }
      } else if (error.response?.status === 403) {
        errorMessage = "비밀번호가 일치하지 않습니다.";
      } else if (error.response?.status === 404) {
        errorMessage = "게시글을 찾을 수 없습니다.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    }
  };

  const handleCommentDeleteClick = (commentId: number) => {
    setCommentToDelete(commentId);
    setShowCommentDeleteModal(true);
  };

  const handleCommentDeleteConfirm = async () => {
    if (!commentToDelete || !selectedPost || !commentDeletePassword.trim()) {
      alert("비밀번호를 입력해주세요.");
      return;
    }

    try {
      await commentApi.deleteComment(commentToDelete, { password: commentDeletePassword.trim() });
      
      // 성공 시 댓글 목록 다시 로드
      const apiComments = await commentApi.getComments(selectedPost.id);
      const convertedComments: Comment[] = apiComments.map((comment) => ({
        id: comment.commentId,
        author: comment.userName,
        content: comment.content,
        createdAt: comment.createAt,
      }));

      const updatedPost: Post = {
        ...selectedPost,
        comments: convertedComments,
      };

      setSelectedPost(updatedPost);
      setPosts(posts.map((post) => (post.id === selectedPost.id ? updatedPost : post)));
      setShowCommentDeleteModal(false);
      setCommentDeletePassword("");
      setCommentToDelete(null);
      alert("댓글이 삭제되었습니다.");
    } catch (error: any) {
      console.error("댓글 삭제 실패:", error);
      const errorMessage = error.response?.data?.message 
        || error.message 
        || "댓글 삭제에 실패했습니다.";
      alert(errorMessage);
    }
  };

  const handleCommentEditClick = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditComment({
      content: comment.content,
      password: "",
    });
  };

  const handleCommentUpdate = async () => {
    if (!editingCommentId || !selectedPost || !editComment.content.trim()) {
      alert("내용을 입력해주세요.");
      return;
    }

    if (!editComment.password.trim()) {
      alert("비밀번호를 입력해주세요.");
      return;
    }

    try {
      await commentApi.updateComment(editingCommentId, {
        content: editComment.content.trim(),
        password: editComment.password.trim(),
      });

      // 성공 시 댓글 목록 다시 로드
      const apiComments = await commentApi.getComments(selectedPost.id);
      const convertedComments: Comment[] = apiComments.map((comment) => ({
        id: comment.commentId,
        author: comment.userName,
        content: comment.content,
        createdAt: comment.createAt,
      }));

      const updatedPost: Post = {
        ...selectedPost,
        comments: convertedComments,
      };

      setSelectedPost(updatedPost);
      setPosts(posts.map((post) => (post.id === selectedPost.id ? updatedPost : post)));
      setEditingCommentId(null);
      setEditComment({ content: "", password: "" });
      alert("댓글이 수정되었습니다.");
    } catch (error: any) {
      console.error("댓글 수정 실패:", error);
      const errorMessage = error.response?.data?.message 
        || error.message 
        || "댓글 수정에 실패했습니다.";
      alert(errorMessage);
    }
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

          {/* 글쓰기 버튼 - 자유게시판에서만 표시 */}
          {!isWriting && !selectedPost && selectedCategory === "free" && (
            <div className="flex justify-end mb-6">
              <button
                onClick={() => {
                  setIsWriting(true);
                  setSelectedPost(null);
                  setNewPost({
                    title: "",
                    content: "",
                    name: "",
                    password: "",
                    category: "free", // 일반 유저는 기본값을 자유게시판으로
                  });
                }}
                className="px-4 py-2 font-medium text-white bg-amber-500 rounded-full transition hover:bg-amber-500"
              >
                글쓰기
              </button>
            </div>
          )}

          {/* 글쓰기 폼 */}
          {isWriting && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              {/* 카테고리 선택 */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex gap-4 items-center">
                  <label className="text-sm font-semibold text-gray-900">카테고리</label>
                  <select
                    value={newPost.category}
                    onChange={(e) =>
                      setNewPost({ ...newPost, category: e.target.value as PostCategory })
                    }
                    className="px-4 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    disabled={true} // 일반 유저는 자유게시판만 선택 가능
                  >
                    <option value="free">자유게시판</option>
                    {/* 관리자만 공지사항 선택 가능 - 추후 권한 체크 추가 */}
                  </select>
                  {!isAuthenticated && (
                    <span className="text-xs text-gray-500">
                      일반 유저는 자유게시판만 작성 가능합니다.
                    </span>
                  )}
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
                      className="px-4 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="제목을 입력해주세요(최대 50자)"
                    />
                    <div className="mt-1 text-xs text-right text-gray-500">
                      {newPost.title.length}/50자
                    </div>
                  </div>

                  {/* 이름과 비밀번호 입력 */}
                  <div className="mb-4 space-y-3">
                    {!isAuthenticated && (
                      <div>
                        <input
                          type="text"
                          value={newPost.name}
                          onChange={(e) => setNewPost({ ...newPost, name: e.target.value })}
                          className="px-4 py-3 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                          placeholder="이름을 입력해주세요"
                        />
                      </div>
                    )}
                  </div>

                  {/* 본문 입력 */}
                  <div className="relative">
                    <textarea
                      value={newPost.content}
                      onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                      maxLength={5000}
                      rows={12}
                      className="px-4 py-3 w-full rounded-lg border border-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="구체적으로 작성하면 더 많은 답변을 받을 수 있어요"
                    />
                    <div className="absolute right-3 bottom-3 text-xs text-gray-500">
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

                <div>
                      <input
                        type="password"
                        value={newPost.password}
                        onChange={(e) => setNewPost({ ...newPost, password: e.target.value })}
                        className="px-4 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        placeholder={isAuthenticated ? "비밀번호를 입력해주세요" : "비밀번호를 입력해주세요"}
                      />
                      {isAuthenticated && (
                        <p className="mt-1 text-xs text-gray-500">
                          게시글 수정/삭제 시 필요합니다.
                        </p>
                      )}
                    </div>
                {/* 등록 버튼 */}
                <div className="pt-4">
                  <button
                    onClick={handleWritePost}
                    disabled={isSubmitting}
                    className="py-3 w-full font-medium text-white bg-amber-500 rounded-full transition hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "등록 중..." : "게시글 등록하기"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 게시글 목록 */}
          {!isWriting && !selectedPost && (
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center items-center p-12">
                  <div className="inline-block w-12 h-12 rounded-full border-b-2 border-gray-600 animate-spin"></div>
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="p-12 text-center text-gray-500 bg-gray-50 rounded-lg">
                  <p>아직 작성된 글이 없습니다.</p>
                </div>
              ) : (
                filteredPosts.map((post) => (
                  <div
                    key={post.id}
                    onClick={async () => {
                      setIsLoadingPost(true);
                      try {
                        // API에서 게시글 상세 정보 가져오기
                        const postDetail = await postApi.getPost(post.id);
                        // 댓글 목록 가져오기
                        const apiComments = await commentApi.getComments(post.id);
                        // 댓글을 UI 형식으로 변환
                        const convertedComments: Comment[] = apiComments.map((comment) => ({
                          id: comment.commentId,
                          author: comment.userName,
                          content: comment.content,
                          createdAt: comment.createAt,
                        }));
                        // API 응답을 UI 형식으로 변환
                        const convertedPost: Post = {
                          id: postDetail.postId,
                          category: post.category || "free",
                          title: postDetail.title,
                          content: postDetail.content || "",
                          author: postDetail.name,
                          createdAt: postDetail.createAt,
                          views: postDetail.views || 0,
                          likes: postDetail.likeCount,
                          comments: convertedComments,
                          isLiked: false,
                          isBookmarked: false,
                        };
                        setSelectedPost({ ...convertedPost, views: (convertedPost.views || 0) + 1 });
                        setPosts(
                          posts.map((p) => 
                            p.id === post.id 
                              ? { ...p, views: (p.views || 0) + 1, comments: convertedComments } 
                              : p
                          )
                        );
                      } catch (error) {
                        console.error("게시글 상세 조회 실패:", error);
                        alert("게시글을 불러오는데 실패했습니다.");
                      } finally {
                        setIsLoadingPost(false);
                      }
                    }}
                    className="p-6 bg-white rounded-lg border border-gray-200 transition cursor-pointer hover:border-gray-300 hover:shadow-sm"
                  >
                    <h3 className="mb-3 text-lg font-semibold text-gray-900">{post.title}</h3>
                    {post.content && (
                      <p className="mb-4 text-sm text-gray-600 line-clamp-2">{post.content}</p>
                    )}
                    <div className="flex justify-between items-center">
                      <div className="flex gap-4 items-center text-xs text-gray-500">
                        <div className="flex gap-2 items-center">
                          <div className="flex justify-center items-center w-6 h-6 bg-amber-100 rounded-full">
                            <span className="text-xs font-medium text-amber-500">
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
                        <span>댓글 {post.comments?.length || 0}</span>
                        <span>조회 {post.views || 0}</span>
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

              {/* 수정 모드 */}
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">제목</label>
                    <input
                      type="text"
                      value={editPost.title}
                      onChange={(e) => setEditPost({ ...editPost, title: e.target.value })}
                      className="px-4 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="제목을 입력해주세요"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">내용</label>
                    <textarea
                      value={editPost.content}
                      onChange={(e) => setEditPost({ ...editPost, content: e.target.value })}
                      rows={10}
                      className="px-4 py-2 w-full rounded-lg border border-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="내용을 입력해주세요"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">비밀번호</label>
                    <input
                      type="password"
                      value={editPost.password}
                      onChange={(e) => setEditPost({ ...editPost, password: e.target.value })}
                      className="px-4 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="비밀번호를 입력해주세요"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditPost({ title: "", content: "", password: "" });
                      }}
                      className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-full transition hover:bg-gray-200"
                    >
                      취소
                    </button>
                    <button
                      onClick={handleUpdatePost}
                      disabled={!editPost.title.trim() || !editPost.content.trim() || !editPost.password.trim()}
                      className="px-4 py-2 text-sm text-white bg-amber-500 rounded-full transition hover:bg-amber-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      수정 완료
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* 제목 */}
                  <h1 className="text-2xl font-bold text-gray-900">{selectedPost.title}</h1>

                  {/* 메타 정보 */}
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>
                      작성 {formatRelativeTime(selectedPost.createdAt)} · 조회 {selectedPost.views}
                    </span>
                  </div>

                  {/* 본문 */}
                  <div className="py-6">
                    <p className="text-base leading-relaxed text-gray-800 whitespace-pre-wrap">
                      {selectedPost.content}
                    </p>
                  </div>
                </>
              )}

              {/* 작성자 프로필 */}
              <div className="flex gap-3 items-center py-4">
                <div className="flex justify-center items-center w-10 h-10 bg-gray-100 rounded-full">
                  <span className="text-sm font-medium text-gray-600">
                    {selectedPost.author.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{selectedPost.author}</div>
                  {selectedPost.authorInfo && (
                    <div className="text-xs text-gray-500 mt-0.5">{selectedPost.authorInfo}</div>
                  )}
                </div>
              </div>

              {/* 액션 버튼 */}
              <div className="flex gap-2 pt-4 pb-6 border-b border-gray-200">
                <button
                  onClick={() => handleLike(selectedPost.id)}
                  className={`flex gap-1.5 items-center px-3 py-1.5 text-sm rounded-full transition ${
                    selectedPost.isLiked
                      ? "text-amber-500 bg-amber-50"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <svg
                    className="w-4 h-4"
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
                  className={`flex gap-1.5 items-center px-3 py-1.5 text-sm rounded-full transition ${
                    selectedPost.isBookmarked
                      ? "text-amber-500 bg-amber-50"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <svg
                    className="w-4 h-4"
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
                {/* 작성자만 수정 버튼 표시 */}
                {isAuthenticated && user && selectedPost.author?.trim() === user.name?.trim() && (
                  <button
                    onClick={handleEditClick}
                    className="flex gap-1.5 items-center px-3 py-1.5 text-sm text-gray-600 rounded-full transition hover:bg-gray-100"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    <span>수정</span>
                  </button>
                )}
                {/* 작성자만 삭제 버튼 표시 */}
                {isAuthenticated && user && selectedPost.author?.trim() === user.name?.trim() && (
                  <button
                    onClick={() => handleDeleteClick(selectedPost.id)}
                    className="flex gap-1.5 items-center px-3 py-1.5 text-sm text-red-600 rounded-full transition hover:bg-red-50 ml-auto"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    <span>삭제</span>
                  </button>
                )}
              </div>

              {/* 댓글 섹션 */}
              <div className="pt-8">
                <div className="mb-6">
                  <h3 className="mb-2 text-xl font-semibold text-gray-900">
                    댓글 {selectedPost.comments.length}
                  </h3>
                </div>

                {/* 댓글 입력 */}
                <div className="p-6 mb-6 bg-gray-50 rounded-lg border border-gray-200">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="댓글을 입력해주세요 :)"
                    rows={4}
                    className="px-4 py-3 w-full rounded-lg border border-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                  <div className="mt-3">
                    <input
                      type="password"
                      value={commentPassword}
                      onChange={(e) => setCommentPassword(e.target.value)}
                      placeholder="댓글 삭제/수정용 비밀번호"
                      className="px-4 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      댓글 삭제 및 수정 시 사용할 비밀번호를 입력해주세요.
                    </p>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-xs text-gray-500">
                      {newComment.length}/5000자
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setNewComment("");
                          setCommentPassword("");
                        }}
                        className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-full transition hover:bg-gray-200"
                      >
                        취소
                      </button>
                      <button
                        onClick={handleAddComment}
                        disabled={!newComment.trim() || !commentPassword.trim()}
                        className="px-4 py-2 text-sm text-white bg-amber-500 rounded-full transition hover:bg-amber-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        등록
                      </button>
                    </div>
                  </div>
                </div>

                {/* 댓글 목록 */}
                <div className="p-6 bg-white rounded-lg border border-gray-200">
                {selectedPost.comments.length === 0 ? (
                  <div className="py-8 text-sm text-center text-gray-500">
                    아직 댓글이 없습니다.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedPost.comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <div className="flex flex-shrink-0 justify-center items-center w-8 h-8 bg-gray-200 rounded-full">
                          <span className="text-xs font-medium text-gray-600">
                            {comment.author.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          {editingCommentId === comment.id ? (
                            <div className="space-y-3">
                              <textarea
                                value={editComment.content}
                                onChange={(e) => setEditComment({ ...editComment, content: e.target.value })}
                                rows={3}
                                className="px-3 py-2 w-full text-sm rounded-lg border border-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                placeholder="댓글 내용을 수정해주세요"
                              />
                              <input
                                type="password"
                                value={editComment.password}
                                onChange={(e) => setEditComment({ ...editComment, password: e.target.value })}
                                placeholder="비밀번호"
                                className="px-3 py-2 w-full text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setEditingCommentId(null);
                                    setEditComment({ content: "", password: "" });
                                  }}
                                  className="px-3 py-1.5 text-xs text-gray-700 bg-gray-100 rounded-full transition hover:bg-gray-200"
                                >
                                  취소
                                </button>
                                <button
                                  onClick={handleCommentUpdate}
                                  disabled={!editComment.content.trim() || !editComment.password.trim()}
                                  className="px-3 py-1.5 text-xs text-white bg-amber-500 rounded-full transition hover:bg-amber-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                  수정 완료
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex justify-between items-center mb-1">
                                <div>
                                  <span className="text-sm font-medium text-gray-900">
                                    {comment.author}
                                  </span>
                                  <span className="ml-2 text-xs text-gray-500">
                                    {formatRelativeTime(comment.createdAt)}
                                  </span>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleCommentEditClick(comment)}
                                    className="px-2 py-1 text-xs text-gray-600 rounded-full transition hover:bg-gray-100"
                                  >
                                    수정
                                  </button>
                                  <button
                                    onClick={() => handleCommentDeleteClick(comment.id)}
                                    className="px-2 py-1 text-xs text-red-600 rounded-full transition hover:bg-red-50"
                                  >
                                    삭제
                                  </button>
                                </div>
                              </div>
                              <p className="text-sm text-gray-700">{comment.content}</p>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                </div>
              </div>

              {/* 목록으로 버튼 */}
              <div className="pt-6 border-t border-gray-200">
                <button
                  onClick={() => setSelectedPost(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-full transition hover:bg-gray-200"
                >
                  ← 목록으로
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* 게시글 삭제 모달 */}
      {showDeleteModal && (
        <div className="flex fixed inset-0 z-50 justify-center items-center bg-black/30">
          <div className="w-full max-w-sm bg-white rounded-lg border border-gray-200 shadow-lg">
            <div className="p-6">
              <p className="mb-4 text-base text-gray-900">게시글을 삭제하시겠습니까?</p>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="비밀번호"
                className="px-3 py-2 mb-4 w-full text-sm rounded border border-gray-300 focus:outline-none focus:border-gray-400"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && deletePassword.trim()) {
                    handleDeleteConfirm();
                  } else if (e.key === "Escape") {
                    setShowDeleteModal(false);
                    setDeletePassword("");
                    setPostToDelete(null);
                  }
                }}
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletePassword("");
                    setPostToDelete(null);
                  }}
                  className="px-4 py-2 text-sm text-gray-700 rounded-full hover:bg-gray-100"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  disabled={!deletePassword.trim()}
                  className="px-4 py-2 text-sm text-white bg-red-600 rounded-full hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 댓글 삭제 모달 */}
      {showCommentDeleteModal && (
        <div className="flex fixed inset-0 z-50 justify-center items-center bg-black/30">
          <div className="w-full max-w-sm bg-white rounded-lg border border-gray-200 shadow-lg">
            <div className="p-6">
              <p className="mb-4 text-base text-gray-900">댓글을 삭제하시겠습니까?</p>
              <input
                type="password"
                value={commentDeletePassword}
                onChange={(e) => setCommentDeletePassword(e.target.value)}
                placeholder="비밀번호"
                className="px-3 py-2 mb-4 w-full text-sm rounded border border-gray-300 focus:outline-none focus:border-gray-400"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && commentDeletePassword.trim()) {
                    handleCommentDeleteConfirm();
                  } else if (e.key === "Escape") {
                    setShowCommentDeleteModal(false);
                    setCommentDeletePassword("");
                    setCommentToDelete(null);
                  }
                }}
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowCommentDeleteModal(false);
                    setCommentDeletePassword("");
                    setCommentToDelete(null);
                  }}
                  className="px-4 py-2 text-sm text-gray-700 rounded-full hover:bg-gray-100"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleCommentDeleteConfirm}
                  disabled={!commentDeletePassword.trim()}
                  className="px-4 py-2 text-sm text-white bg-red-600 rounded-full hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardPage;

