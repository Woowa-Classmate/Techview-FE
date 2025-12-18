import { useState, useEffect } from 'react'
import { useAdminHeader } from '@/contexts/AdminHeaderContext'
import { getPostList, searchPosts, ApiPost, updatePost, UpdatePostRequest, deletePost } from '@/lib/adminApi'
import { Button } from '@/components/admin/ui/button'
import { Input } from '@/components/admin/ui/input'
import { Label } from '@/components/admin/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/admin/ui/dialog'
import { Textarea } from '@/components/admin/ui/textarea'

// 날짜 포맷팅 함수
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}`
  } catch {
    return '-'
  }
}

export function BoardManagement() {
  const { setActions } = useAdminHeader()
  const [posts, setPosts] = useState<ApiPost[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchKeyword, setSearchKeyword] = useState('')
  
  // 수정 다이얼로그 상태
  const [editingPost, setEditingPost] = useState<ApiPost | null>(null)
  const [editForm, setEditForm] = useState<{ title: string; content: string }>({ title: '', content: '' })
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setActions({
      onRefresh: () => {
        console.log('게시판 새로고침')
        fetchPosts()
      },
    })

    return () => {
      setActions({})
    }
  }, [setActions])

  const fetchPosts = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await getPostList()
      setPosts(response)
    } catch (err: any) {
      console.error('게시글 조회 에러:', err)
      const errorMessage = 
        err?.response?.data?.message ||
        err?.response?.data?.resultMsg ||
        err?.message ||
        '게시글을 불러오는데 실패했습니다.'
      setError(errorMessage)
      setPosts([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async () => {
    const keyword = searchKeyword.trim()
    
    try {
      setIsSearching(true)
      setError(null)
      
      // keyword가 없으면 모든 게시글 조회, 있으면 검색
      const response = await searchPosts(keyword || undefined)
      setPosts(response)
      
      if (keyword && response.length === 0) {
        setError('검색 결과가 없습니다.')
      }
    } catch (err: any) {
      console.error('게시글 검색 에러:', err)
      const errorMessage = 
        err?.response?.data?.message ||
        err?.response?.data?.resultMsg ||
        err?.message ||
        '게시글을 검색하는데 실패했습니다.'
      setError(errorMessage)
      setPosts([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleResetSearch = () => {
    setSearchKeyword('')
    setError(null)
    fetchPosts()
  }

  const handleEdit = (post: ApiPost) => {
    setEditingPost(post)
    setEditForm({ title: post.title, content: post.content })
    setIsEditDialogOpen(true)
  }

  const handleSave = async () => {
    if (!editingPost) return

    try {
      setIsSaving(true)
      setError(null)

      const updateData: UpdatePostRequest = {
        title: editForm.title.trim(),
        content: editForm.content.trim(),
      }

      await updatePost(editingPost.postId, updateData)
      
      // 성공 시 목록 새로고침
      await fetchPosts()
      
      setIsEditDialogOpen(false)
      setEditingPost(null)
      setEditForm({ title: '', content: '' })
    } catch (err: any) {
      console.error('게시글 수정 에러:', err)
      const errorMessage = 
        err?.response?.data?.message ||
        err?.response?.data?.resultMsg ||
        err?.message ||
        '게시글 수정에 실패했습니다.'
      setError(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (postId: number) => {
    if (!window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      return
    }

    try {
      setError(null)
      
      // API 호출하여 게시글 삭제
      await deletePost(postId)
      
      // 성공 시 목록 새로고침
      await fetchPosts()
      
      console.log('게시글 삭제 성공:', postId)
    } catch (err: any) {
      console.error('게시글 삭제 에러:', err)
      const errorMessage = 
        err?.response?.data?.message ||
        err?.response?.data?.resultMsg ||
        err?.message ||
        '게시글 삭제에 실패했습니다.'
      setError(errorMessage)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12 w-full">
        <p className="text-gray-400">로딩 중...</p>
      </div>
    )
  }

  return (
    <div className="w-full h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">게시판 관리</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">게시글을 관리할 수 있습니다.</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* 검색 영역 */}
      <div className="mb-6 flex gap-3">
        <Input
          placeholder="게시글 제목 검색..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSearch()
            }
          }}
          className="bg-white dark:bg-[#1a1a1a] border-gray-300 dark:border-[#2a2a2a] text-gray-900 dark:text-white h-11 text-base"
        />
        <Button 
          onClick={handleSearch}
          disabled={isSearching}
          className="px-4 h-11 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSearching ? '검색 중...' : '검색'}
        </Button>
        {searchKeyword && (
          <Button
            onClick={handleResetSearch}
            variant="outline"
            className="h-11 px-4 text-base font-medium border-gray-300 dark:border-[#2a2a2a] hover:bg-gray-100 dark:hover:bg-[#1a1a1a] bg-white dark:bg-transparent text-gray-900 dark:text-white"
          >
            전체 보기
          </Button>
        )}
      </div>

      {/* 게시글 테이블 */}
      <div className="bg-white dark:bg-[#0a0a0a] rounded-lg border border-gray-200 dark:border-[#1a1a1a]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-[#1a1a1a]">
                <th className="px-4 py-3 text-base font-semibold text-left text-black dark:text-gray-400">번호</th>
                <th className="px-4 py-3 text-base font-semibold text-left text-black dark:text-gray-400">제목</th>
                <th className="px-4 py-3 text-base font-semibold text-left text-black dark:text-gray-400">작성자</th>
                <th className="px-4 py-3 text-base font-semibold text-left text-black dark:text-gray-400">작성일</th>
                <th className="px-4 py-3 text-base font-semibold text-left text-black dark:text-gray-400">조회수</th>
                <th className="px-4 py-3 text-base font-semibold text-left text-black dark:text-gray-400">좋아요</th>
                <th className="px-4 py-3 text-base font-semibold text-right text-black dark:text-gray-400">관리</th>
              </tr>
            </thead>
            <tbody>
              {posts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    게시글이 없습니다.
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post.postId} className="border-b border-gray-200 dark:border-[#1a1a1a] hover:bg-gray-50 dark:hover:bg-[#0f0f0f] transition-colors">
                    <td className="px-4 py-3 text-base text-black dark:text-white">{post.postId}</td>
                    <td className="px-4 py-3 text-base text-black dark:text-white max-w-md truncate" title={post.title}>
                      {post.title}
                    </td>
                    <td className="px-4 py-3 text-base text-black dark:text-gray-300">{post.name}</td>
                    <td className="px-4 py-3 text-base text-black dark:text-gray-300">
                      {post.createAt ? formatDate(post.createAt) : '-'}
                    </td>
                    <td className="px-4 py-3 text-base text-black dark:text-gray-300">{post.viewCount}</td>
                    <td className="px-4 py-3 text-base text-black dark:text-gray-300">{post.likeCount}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(post)}
                          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1a1a1a] gap-1.5 text-sm px-2 py-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          수정
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(post.postId)}
                          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-[#1a1a1a] gap-1.5 text-sm px-2 py-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          삭제
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 수정 다이얼로그 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-[#1a1a1a] text-gray-900 dark:text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">게시글 수정</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              게시글 제목과 내용을 수정할 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title" className="text-gray-700 dark:text-gray-300">제목 *</Label>
              <Input
                id="title"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="bg-white dark:bg-[#1a1a1a] border-gray-300 dark:border-[#2a2a2a] text-gray-900 dark:text-white"
                placeholder="게시글 제목을 입력하세요"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="content" className="text-gray-700 dark:text-gray-300">내용 *</Label>
              <Textarea
                id="content"
                value={editForm.content}
                onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                className="bg-white dark:bg-[#1a1a1a] border-gray-300 dark:border-[#2a2a2a] text-gray-900 dark:text-white min-h-[200px]"
                placeholder="게시글 내용을 입력하세요"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsEditDialogOpen(false)}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              disabled={isSaving}
            >
              취소
            </Button>
            <Button
              onClick={handleSave}
              className="text-white bg-blue-600 hover:bg-blue-700"
              disabled={isSaving || !editForm.title.trim() || !editForm.content.trim()}
            >
              {isSaving ? '저장 중...' : '저장'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

