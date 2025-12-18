import { useState, useEffect } from 'react'
import { useAdminHeader } from '@/contexts/AdminHeaderContext'
import { getUserList, ApiUser, searchUsers, updateUser, UpdateUserRequest, deleteUser } from '@/lib/adminApi'
import * as XLSX from 'xlsx'
import { Button } from '@/components/admin/ui/button'
import { Checkbox } from '@/components/admin/ui/checkbox'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/admin/ui/select'

interface User {
  id: number
  username: string
  password: string
  name: string
  phone: string
  birthdate: string
  authority: string
  status: string
}


const formatBirthdate = (birthdate: string): string => {
  // YYYYMMDD 형식인 경우
  if (birthdate.length === 8) {
    const year = birthdate.substring(0, 4)
    const month = birthdate.substring(4, 6)
    const day = birthdate.substring(6, 8)
    return `${year}. ${month}. ${day}.`
  }
  // YYMMDD 형식인 경우
  if (birthdate.length === 6) {
    const year = birthdate.substring(0, 2)
    const month = birthdate.substring(2, 4)
    const day = birthdate.substring(4, 6)
    const fullYear = parseInt(year) > 50 ? `19${year}` : `20${year}`
    return `${fullYear}. ${month}. ${day}.`
  }
  return birthdate
}

// API 응답을 User 형식으로 변환
// Swagger API 응답: { userId, email, name, role }
const convertApiUserToUser = (apiUser: ApiUser): User => {
  return {
    id: apiUser.userId,
    username: apiUser.email || '', // email을 username으로 사용
    password: '', // API에서 제공하지 않음
    name: apiUser.name || '',
    phone: '', // API에서 제공하지 않음
    birthdate: '', // API에서 제공하지 않음
    authority: apiUser.role || 'USER',
    status: 'ABLE', // 기본값 (API에서 제공하지 않음)
  }
}

export function UserManagement() {
  const { setActions } = useAdminHeader()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [selectedUsers, setSelectedUsers] = useState<number[]>([])
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editForm, setEditForm] = useState<Partial<User>>({})
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  // 검색 상태
  const [searchMemberId, setSearchMemberId] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleSort = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
  }

  const toggleAll = (checked: boolean): void => {
    if (checked) {
      setSelectedUsers(users.map(user => user.id))
    } else {
      setSelectedUsers([])
    }
  }

  const toggleOne = (id: number, checked: boolean): void => {
    if (checked) {
      setSelectedUsers((prev) => [...prev, id])
    } else {
      setSelectedUsers((prev) => prev.filter((userId) => userId !== id))
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setEditForm({ ...user })
    setIsEditDialogOpen(true)
  }

  const handleSave = async () => {
    if (!editingUser || !editForm) return

    try {
      setIsSaving(true)
      setError(null)

      // API 요청 데이터 구성 (이메일, 이름, 비밀번호, 권한 전송)
      const updateData: UpdateUserRequest = {}
      
      if (editForm.username && editForm.username !== editingUser.username) {
        updateData.email = editForm.username
      }
      
      if (editForm.name && editForm.name !== editingUser.name) {
        updateData.name = editForm.name
      }
      
      if (editForm.password && editForm.password.trim() !== '') {
        updateData.password = editForm.password
      }
      
      if (editForm.authority && editForm.authority !== editingUser.authority) {
        updateData.role = editForm.authority as 'USER' | 'ADMIN'
      }

      // 변경사항이 있을 경우에만 API 호출
      if (Object.keys(updateData).length > 0) {
        await updateUser(editingUser.id, updateData)
        
        // 성공 시 로컬 상태 업데이트
        setUsers(users.map(user => 
          user.id === editingUser.id 
            ? { ...user, ...editForm } 
            : user
        ))
        
        // 목록 새로고침
        await fetchUsers()
      }
      
      setIsEditDialogOpen(false)
      setEditingUser(null)
      setEditForm({})
    } catch (err: any) {
      console.error('사용자 수정 에러:', err)
      const errorMessage = 
        err?.response?.data?.message ||
        err?.response?.data?.resultMsg ||
        err?.message ||
        '사용자 정보 수정에 실패했습니다.'
      setError(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('정말로 이 사용자를 삭제하시겠습니까?')) {
      return
    }

    try {
      setError(null)
      
      // API 호출하여 사용자 삭제
      await deleteUser(id)
      
      // 성공 시 목록 새로고침
      await fetchUsers()
      
      // 선택된 사용자 목록에서도 제거
      setSelectedUsers((prevSelected) => prevSelected.filter(userId => userId !== id))
      
      console.log('사용자 삭제 성공:', id)
    } catch (err: any) {
      console.error('사용자 삭제 에러:', err)
      const errorMessage = 
        err?.response?.data?.message ||
        err?.response?.data?.resultMsg ||
        err?.message ||
        '사용자 삭제에 실패했습니다.'
      setError(errorMessage)
    }
  }

  // 사용자 검색 함수 (이메일 또는 이름으로 검색)
  const handleSearch = async () => {
    const keyword = searchMemberId.trim()

    try {
      setIsSearching(true)
      setError(null)
      
      // keyword가 없으면 모든 사용자 조회, 있으면 검색
      const response = await searchUsers(keyword || undefined)
      
      if (response && response.length > 0) {
        // API 응답을 User 형식으로 변환
        const convertedUsers = response.map(convertApiUserToUser)
        setUsers(convertedUsers)
      } else {
        if (keyword) {
          setError('검색 결과가 없습니다.')
        }
        setUsers([])
      }
    } catch (err: any) {
      console.error('사용자 검색 에러:', err)
      
      const errorMessage = 
        err?.response?.data?.errorResultMsg ||
        err?.response?.data?.resultMsg ||
        err?.message ||
        '사용자를 검색하는데 실패했습니다.'
      
      setError(errorMessage)
      setUsers([])
    } finally {
      setIsSearching(false)
    }
  }

  // 검색 초기화 함수
  const handleResetSearch = () => {
    setSearchMemberId('')
    setError(null)
    fetchUsers()
  }


  const handleExport = () => {
    // 선택된 항목이 있으면 선택된 항목만, 없으면 전체 데이터
    const dataToExport = selectedUsers.length > 0
      ? users.filter(u => selectedUsers.includes(u.id))
      : users

    // 엑셀 데이터 준비
    const excelData = dataToExport.map(user => ({
      이름: user.name,
      이메일: user.username,
      권한: user.authority,
    }))

    // 워크시트 생성
    const ws = XLSX.utils.json_to_sheet(excelData)
    
    // 워크북 생성
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '사용자 목록')
    
    // 엑셀 파일 다운로드
    XLSX.writeFile(wb, `사용자_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  // 전체 사용자 조회 API 호출
  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const users = await getUserList()
      
      console.log('API 응답:', users)
      console.log('사용자 수:', users.length)
      
      // 배열이 반환되었는지 확인
      if (Array.isArray(users)) {
        try {
          const convertedUsers = users.map((user, index) => {
            try {
              return convertApiUserToUser(user)
            } catch (err) {
              console.error(`사용자 ${index} 변환 실패:`, user, err)
              // 기본값으로 사용자 객체 생성
              return {
                id: user.userId || 0,
                username: user.email || '',
                password: '',
                name: user.name || '',
                phone: '',
                birthdate: '',
                authority: user.role || 'USER',
                status: 'ABLE',
              }
            }
          })
          console.log('변환된 사용자 수:', convertedUsers.length)
          console.log('변환된 사용자:', convertedUsers)
          setUsers(convertedUsers)
        } catch (err) {
          console.error('사용자 변환 중 에러:', err)
          setError('사용자 데이터 변환 중 오류가 발생했습니다.')
          setUsers([])
        }
      } else {
        console.log('응답이 배열이 아닙니다:', users)
        setUsers([])
      }
    } catch (err: any) {
      console.error('Error fetching users:', err)
      console.error('에러 상세:', err?.response?.data)
      
      // 에러 응답에서 상세 메시지 추출
      const errorMessage = 
        err?.response?.data?.errorResultMsg ||
        err?.response?.data?.resultMsg ||
        err?.message ||
        '사용자 목록을 불러오는데 실패했습니다.'
      
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    setActions({
      onExport: handleExport,
      onRefresh: fetchUsers,
    })

    return () => {
      setActions({})
    }
  }, [setActions, selectedUsers, users])

  const sortedUsers = [...users].sort((a, b) => {
    return sortOrder === 'asc' ? a.id - b.id : b.id - a.id
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12 w-full">
        <p className="text-gray-400">로딩 중...</p>
      </div>
    )
  }

  return (
    <div className="w-full scale-[0.85] origin-top-left" style={{ width: '117.65%' }}>
      {error && (
        <div className="p-3 mb-3 rounded-lg border bg-red-900/20 border-red-500/50">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}
      
      {/* 검색창 */}
      <div className="mb-4 p-3 bg-gray-50 dark:bg-[#0a0a0a] rounded-lg border border-gray-200 dark:border-[#1a1a1a]">
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <Label htmlFor="search-member-id" className="block mb-1.5 text-base font-medium text-gray-900 dark:text-white">
              사용자 검색 (이메일 또는 이름)
            </Label>
            <Input
              id="search-member-id"
              type="text"
              placeholder="이메일 또는 이름을 입력하세요 (예: user@example.com 또는 홍길동)"
              value={searchMemberId}
              onChange={(e) => setSearchMemberId(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch()
                }
              }}
              className="bg-white dark:bg-[#1a1a1a] border-gray-300 dark:border-[#2a2a2a] text-gray-900 dark:text-white h-11 text-base placeholder:text-sm placeholder:text-gray-500 dark:placeholder:text-gray-500"
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={isSearching}
            className="px-4 h-11 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSearching ? '검색 중...' : '검색'}
          </Button>
          {searchMemberId && (
            <Button
              onClick={handleResetSearch}
              variant="outline"
              className="h-11 px-4 text-base font-medium border-gray-300 dark:border-[#2a2a2a] hover:bg-gray-100 dark:hover:bg-[#1a1a1a] bg-white dark:bg-transparent text-gray-900 dark:text-white"
            >
              전체 보기
            </Button>
          )}
        </div>
      </div>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-[#1a1a1a] text-gray-900 dark:text-white">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">사용자 정보 수정</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              이름, 이메일, 비밀번호, 권한을 수정할 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">이름 *</Label>
              <Input
                id="name"
                value={editForm.name || ''}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="bg-white dark:bg-[#1a1a1a] border-gray-300 dark:border-[#2a2a2a] text-gray-900 dark:text-white"
                placeholder="홍길동"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="username" className="text-gray-700 dark:text-gray-300">이메일 *</Label>
              <Input
                id="username"
                type="email"
                value={editForm.username || ''}
                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                className="bg-white dark:bg-[#1a1a1a] border-gray-300 dark:border-[#2a2a2a] text-gray-900 dark:text-white"
                placeholder="example@email.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">
                비밀번호 <span className="text-sm text-gray-500">(변경하려면 입력)</span>
              </Label>
              <Input
                id="password"
                type="password"
                value={editForm.password || ''}
                onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                className="bg-white dark:bg-[#1a1a1a] border-gray-300 dark:border-[#2a2a2a] text-gray-900 dark:text-white"
                placeholder="Password!123"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="authority" className="text-gray-700 dark:text-gray-300">권한 *</Label>
              <Select
                value={editForm.authority || ''}
                onValueChange={(value: string) => setEditForm({ ...editForm, authority: value })}
              >
                <SelectTrigger className="bg-white dark:bg-[#1a1a1a] border-gray-300 dark:border-[#2a2a2a] text-gray-900 dark:text-white">
                  <SelectValue placeholder="권한 선택" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#1a1a1a] border-gray-300 dark:border-[#2a2a2a] text-gray-900 dark:text-white">
                  <SelectItem value="USER">USER</SelectItem>
                  <SelectItem value="ADMIN">ADMIN</SelectItem>
                </SelectContent>
              </Select>
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
              disabled={isSaving}
            >
              {isSaving ? '저장 중...' : '저장'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200 dark:border-[#1a1a1a]">
              <th className="px-3 py-3 w-12 text-left">
                <Checkbox
                  checked={selectedUsers.length === users.length && users.length > 0}
                  onCheckedChange={toggleAll}
                  className="w-4 h-4 border-gray-300 dark:border-gray-600"
                />
              </th>
              <th className="px-3 py-3 text-base font-semibold text-left text-black dark:text-gray-400">이름</th>
              <th className="px-3 py-3 text-base font-semibold text-left text-black dark:text-gray-400">이메일</th>
              <th className="px-3 py-3 text-base font-semibold text-left text-black dark:text-gray-400">권한</th>
              <th className="px-3 py-3 text-base font-semibold text-right text-black dark:text-gray-400"></th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-sm text-center text-gray-500 dark:text-gray-400">
                  사용자 데이터가 없습니다.
                </td>
              </tr>
            ) : (
              sortedUsers.map((user) => (
              <tr key={user.id} className="border-b border-gray-200 dark:border-[#1a1a1a] hover:bg-gray-50 dark:hover:bg-[#0f0f0f] transition-colors">
                <td className="px-3 py-3">
                  <Checkbox
                    checked={selectedUsers.includes(user.id)}
                    onCheckedChange={(checked) => toggleOne(user.id, checked as boolean)}
                    className="w-4 h-4 border-gray-300 dark:border-gray-600"
                  />
                </td>
                <td className="px-3 py-3 text-base text-black dark:text-white">{user.name}</td>
                <td className="px-3 py-3 text-base text-black dark:text-gray-300">{user.username}</td>
                <td className="px-3 py-3 text-base text-black dark:text-gray-300">{user.authority}</td>
                <td className="px-3 py-3">
                  <div className="flex gap-1.5 justify-end items-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1a1a1a] gap-1.5 text-sm px-2 py-1"
                      onClick={() => handleEdit(user)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      EDIT
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-[#1a1a1a] gap-1.5 text-sm px-2 py-1"
                      onClick={() => handleDelete(user.id)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      DELETE
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
  )
}

