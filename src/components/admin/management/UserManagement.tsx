import { useState, useEffect } from 'react'
import { useAdminHeader } from '@/contexts/AdminHeaderContext'
import { getUserList, ApiUser, updateMemberAuthority, getMemberByName, sendCustomNotification, sendDiaryNotification, sendReportNotification, sendAllCustomNotification, sendAllDiaryNotification, sendAllReportNotification } from '@/lib/adminApi'
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
const convertApiUserToUser = (apiUser: ApiUser): User => {
  // birthDate (YYYYMMDD)를 birthdate (YYMMDD)로 변환
  let birthdate = apiUser.birthDate || ''
  if (birthdate && birthdate.length === 8) {
    birthdate = birthdate.substring(2) // YYYYMMDD → YYMMDD
  }
  
  return {
    id: apiUser.id,
    username: apiUser.memberId || '',
    password: '', // API에서 제공하지 않음
    name: apiUser.memberName || '',
    phone: apiUser.phone || '',
    birthdate: birthdate,
    authority: apiUser.authority || 'USER',
    status: apiUser.status || 'ABLE', // 기본값 설정
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

  // 검색 상태 (memberId는 integer)
  const [searchMemberId, setSearchMemberId] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  // 알림 전송 상태
  const [isNotificationDialogOpen, setIsNotificationDialogOpen] = useState(false)
  const [notificationUser, setNotificationUser] = useState<User | null>(null)
  const [notificationType, setNotificationType] = useState<'custom' | 'diary' | 'report'>('custom')
  const [customMessage, setCustomMessage] = useState('')
  const [isSendingNotification, setIsSendingNotification] = useState(false)

  // 전체 알림 전송 상태
  const [isAllNotificationDialogOpen, setIsAllNotificationDialogOpen] = useState(false)
  const [allNotificationType, setAllNotificationType] = useState<'custom' | 'diary' | 'report'>('custom')
  const [allCustomMessage, setAllCustomMessage] = useState('')
  const [isSendingAllNotification, setIsSendingAllNotification] = useState(false)

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
    if (editingUser && editForm) {
      // 권한이 변경된 경우 API 호출
      if (editForm.authority && editForm.authority !== editingUser.authority) {
        try {
          const result = await updateMemberAuthority(
            editingUser.username,
            editForm.authority as 'USER' | 'ADMIN'
          );

          if (result.success) {
            // 로컬 상태 업데이트
            setUsers(users.map(user => 
              user.id === editingUser.id 
                ? { ...user, ...editForm } 
                : user
            ));
            setIsEditDialogOpen(false);
            setEditingUser(null);
            setEditForm({});
            
            // 목록 새로고침
            fetchUsers();
          } else {
            setError(result.error || '권한 변경에 실패했습니다.');
          }
        } catch (error) {
          console.error('권한 변경 에러:', error);
          setError('권한 변경 중 오류가 발생했습니다.');
        }
      } else {
        // 권한 변경이 아닌 경우 로컬 상태만 업데이트
      setUsers(users.map(user => 
        user.id === editingUser.id 
          ? { ...user, ...editForm } 
          : user
        ));
        setIsEditDialogOpen(false);
        setEditingUser(null);
        setEditForm({});
      }
    }
  }

  const handleDelete = (id: number) => {
    if (window.confirm('정말로 이 사용자를 삭제하시겠습니까?')) {
      // 삭제할 사용자의 원래 인덱스 찾기
      const deletedIndex = users.findIndex(user => user.id === id)
      
      // 삭제 후 남은 사용자들의 ID를 1부터 순차적으로 재정렬
      const updatedUsers = users
        .filter(user => user.id !== id)
        .map((user, index) => ({ ...user, id: index + 1 }))
      setUsers(updatedUsers)
      
      // 선택된 사용자 목록 업데이트: 삭제된 사용자 제거하고 새 ID로 매핑
      const updatedSelectedUsers = selectedUsers
        .filter(userId => userId !== id) // 삭제된 사용자 제거
        .map(oldId => {
          // 원래 사용자 목록에서의 인덱스 찾기
          const oldIndex = users.findIndex(u => u.id === oldId)
          if (oldIndex === -1) return null
          
          // 삭제된 사용자보다 앞에 있던 사용자들은 새 ID가 그대로 (oldIndex + 1)
          // 뒤에 있던 사용자들은 새 ID가 -1 (oldIndex)
          const newId = oldIndex < deletedIndex ? oldIndex + 1 : oldIndex
          return newId
        })
        .filter((id): id is number => id !== null && id > 0)
        .sort((a, b) => a - b)
      
      setSelectedUsers(updatedSelectedUsers)
    }
  }

  // 특정 회원 조회 함수 (memberName은 string)
  const handleSearch = async () => {
    const memberName = searchMemberId.trim()
    if (!memberName) {
      setError('회원 이름을 입력해주세요.')
      return
    }

    try {
      setIsSearching(true)
      setError(null)
      const response = await getMemberByName(memberName)
      
      if (response.statusCode === 200) {
        const convertedUser = convertApiUserToUser(response.resultData)
        setUsers([convertedUser])
      } else {
        setError(response.resultMsg || '회원을 찾을 수 없습니다.')
        setUsers([])
      }
    } catch (err: any) {
      console.error('회원 조회 에러:', err)
      
      const errorMessage = 
        err?.response?.data?.errorResultMsg ||
        err?.response?.data?.resultMsg ||
        err?.message ||
        '회원을 찾을 수 없습니다.'
      
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

  // 알림 전송 핸들러
  const handleSendNotification = (user: User) => {
    setNotificationUser(user)
    setNotificationType('custom')
    setCustomMessage('')
    setIsNotificationDialogOpen(true)
    setError(null)
  }

  const handleNotificationSend = async () => {
    if (!notificationUser) {
      setError('사용자 정보가 없습니다.')
      return
    }

    // 커스텀 알림의 경우 메시지 검증
    if (notificationType === 'custom' && !customMessage.trim()) {
      setError('알림 메시지를 입력해주세요.')
      return
    }

    try {
      setIsSendingNotification(true)
      setError(null)

      let result
      if (notificationType === 'custom') {
        result = await sendCustomNotification({
          memberId: notificationUser.username,
          message: customMessage,
        })
      } else if (notificationType === 'diary') {
        result = await sendDiaryNotification({
          memberId: notificationUser.username,
        })
      } else {
        result = await sendReportNotification({
          memberId: notificationUser.username,
        })
      }

      if (result.success) {
        setIsNotificationDialogOpen(false)
        setNotificationUser(null)
        setCustomMessage('')
        alert('알림이 전송되었습니다.')
      } else {
        setError(result.error || '알림 전송에 실패했습니다.')
      }
    } catch (err: any) {
      console.error('알림 전송 에러:', err)
      setError('알림 전송 중 오류가 발생했습니다.')
    } finally {
      setIsSendingNotification(false)
    }
  }

  // 전체 알림 전송 핸들러
  const handleSendAllNotification = () => {
    setAllNotificationType('custom')
    setAllCustomMessage('')
    setIsAllNotificationDialogOpen(true)
    setError(null)
  }

  const handleAllNotificationSend = async () => {
    // 커스텀 알림의 경우 메시지 검증
    if (allNotificationType === 'custom' && !allCustomMessage.trim()) {
      setError('알림 메시지를 입력해주세요.')
      return
    }

    try {
      setIsSendingAllNotification(true)
      setError(null)

      let result
      if (allNotificationType === 'custom') {
        result = await sendAllCustomNotification({
          message: allCustomMessage,
        })
      } else if (allNotificationType === 'diary') {
        result = await sendAllDiaryNotification()
      } else {
        result = await sendAllReportNotification()
      }

      if (result.success) {
        setIsAllNotificationDialogOpen(false)
        setAllCustomMessage('')
        alert('전체 알림이 전송되었습니다.')
      } else {
        setError(result.error || '전체 알림 전송에 실패했습니다.')
      }
    } catch (err: any) {
      console.error('전체 알림 전송 에러:', err)
      setError('전체 알림 전송 중 오류가 발생했습니다.')
    } finally {
      setIsSendingAllNotification(false)
    }
  }

  const handleExport = () => {
    // 선택된 항목이 있으면 선택된 항목만, 없으면 전체 데이터
    const dataToExport = selectedUsers.length > 0
      ? users.filter(u => selectedUsers.includes(u.id))
      : users

    // 엑셀 데이터 준비
    const excelData = dataToExport.map(user => ({
      ID: user.id,
      권한: user.authority,
      사용자명: user.username,
      이름: user.name,
      전화번호: user.phone,
      생년월일: formatBirthdate(user.birthdate),
      상태: user.status,
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
      const response = await getUserList()
      
      console.log('API 응답 전체:', response)
      console.log('resultData 타입:', typeof response.resultData)
      console.log('resultData가 배열인가?', Array.isArray(response.resultData))
      console.log('resultData 길이:', response.resultData?.length)
      console.log('resultData 내용:', response.resultData)
      
      // statusCode가 200이면 성공으로 간주 (resultMsg는 다양할 수 있음)
      if (response.statusCode === 200) {
        // resultData가 배열이고 비어있지 않은지 확인
        if (Array.isArray(response.resultData) && response.resultData.length > 0) {
          try {
            const convertedUsers = response.resultData.map((user, index) => {
              try {
                return convertApiUserToUser(user)
              } catch (err) {
                console.error(`사용자 ${index} 변환 실패:`, user, err)
                // 기본값으로 사용자 객체 생성
                return {
                  id: user.id || 0,
                  username: user.memberId || '',
                  password: '',
                  name: user.memberName || '',
                  phone: user.phone || '',
                  birthdate: user.birthDate || '',
                  authority: user.authority || 'USER',
                  status: user.status || 'ABLE',
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
          console.log('resultData가 빈 배열이거나 배열이 아닙니다')
          setUsers([])
        }
      } else {
        const errorMsg = response.resultMsg || '사용자 목록을 불러오는데 실패했습니다.'
        setError(errorMsg)
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
    <div className="w-full">
      {error && (
        <div className="p-4 mb-4 rounded-lg border bg-red-900/20 border-red-500/50">
          <p className="text-lg text-red-400">{error}</p>
            </div>
      )}
      
      {/* 검색창 및 전체 알림 버튼 */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-[#0a0a0a] rounded-lg border border-gray-200 dark:border-[#1a1a1a]">
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <Label htmlFor="search-member-id" className="block mb-2 text-xl font-medium text-gray-900 dark:text-white">
              회원 검색 (회원 이름)
            </Label>
              <Input
              id="search-member-id"
              type="text"
              placeholder="회원 이름을 입력하세요 (예: 김두리)"
              value={searchMemberId}
              onChange={(e) => setSearchMemberId(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch()
                }
              }}
              className="bg-white dark:bg-[#1a1a1a] border-gray-300 dark:border-[#2a2a2a] text-gray-900 dark:text-white h-16 text-xl placeholder:text-lg placeholder:text-gray-500 dark:placeholder:text-gray-500"
            />
            </div>
          <Button
            onClick={handleSearch}
            disabled={isSearching || !searchMemberId.trim()}
            className="px-6 h-16 text-xl font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSearching ? '검색 중...' : '검색'}
          </Button>
          {searchMemberId && (
            <Button
              onClick={handleResetSearch}
              variant="outline"
              className="h-16 px-6 text-xl font-medium border-gray-300 dark:border-[#2a2a2a] hover:bg-gray-100 dark:hover:bg-[#1a1a1a] bg-white dark:bg-transparent text-gray-900 dark:text-white"
            >
              초기화
            </Button>
          )}
          <Button
            onClick={handleSendAllNotification}
            className="px-6 h-16 text-xl font-medium text-white bg-green-600 hover:bg-green-700"
          >
            <svg className="mr-2 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            전체 알림
          </Button>
            </div>
          </div>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-[#1a1a1a] text-gray-900 dark:text-white">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">사용자 정보 수정</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              사용자 정보를 수정하세요.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="username" className="text-gray-700 dark:text-gray-300">사용자명</Label>
              <Input
                id="username"
                value={editForm.username || ''}
                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                className="bg-white dark:bg-[#1a1a1a] border-gray-300 dark:border-[#2a2a2a] text-gray-900 dark:text-white"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">패스워드</Label>
              <Input
                id="password"
                type="password"
                value={editForm.password || ''}
                onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                className="bg-white dark:bg-[#1a1a1a] border-gray-300 dark:border-[#2a2a2a] text-gray-900 dark:text-white"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">이름</Label>
              <Input
                id="name"
                value={editForm.name || ''}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="bg-white dark:bg-[#1a1a1a] border-gray-300 dark:border-[#2a2a2a] text-gray-900 dark:text-white"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone" className="text-gray-700 dark:text-gray-300">전화번호</Label>
              <Input
                id="phone"
                value={editForm.phone || ''}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="bg-white dark:bg-[#1a1a1a] border-gray-300 dark:border-[#2a2a2a] text-gray-900 dark:text-white"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="birthdate" className="text-gray-700 dark:text-gray-300">생년월일 (YYMMDD)</Label>
              <Input
                id="birthdate"
                value={editForm.birthdate || ''}
                onChange={(e) => setEditForm({ ...editForm, birthdate: e.target.value })}
                className="bg-white dark:bg-[#1a1a1a] border-gray-300 dark:border-[#2a2a2a] text-gray-900 dark:text-white"
                placeholder="YYMMDD"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="authority" className="text-gray-700 dark:text-gray-300">권한</Label>
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
            <div className="grid gap-2">
              <Label htmlFor="status" className="text-gray-700 dark:text-gray-300">상태</Label>
              <Select
                value={editForm.status || ''}
                onValueChange={(value: string) => setEditForm({ ...editForm, status: value })}
              >
                <SelectTrigger className="bg-white dark:bg-[#1a1a1a] border-gray-300 dark:border-[#2a2a2a] text-gray-900 dark:text-white">
                  <SelectValue placeholder="상태 선택" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#1a1a1a] border-gray-300 dark:border-[#2a2a2a] text-gray-900 dark:text-white">
                  <SelectItem value="ABLE">ABLE</SelectItem>
                  <SelectItem value="DISABLE">DISABLE</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsEditDialogOpen(false)}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              취소
            </Button>
            <Button
              onClick={handleSave}
              className="text-white bg-blue-600 hover:bg-blue-700"
            >
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200 dark:border-[#1a1a1a]">
              <th className="px-5 py-5 w-14 text-left">
                <Checkbox
                  checked={selectedUsers.length === users.length && users.length > 0}
                  onCheckedChange={toggleAll}
                  className="w-5 h-5 border-gray-300 dark:border-gray-600"
                />
              </th>
              <th className="px-5 py-5 text-lg font-semibold text-left text-black dark:text-gray-400">
                <button onClick={handleSort} className="flex gap-1.5 items-center transition-colors hover:text-gray-900 dark:hover:text-white">
                  ID
                  <svg
                    className={`w-6 h-6 transition-transform ${sortOrder === 'asc' ? '' : 'rotate-180'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
              </th>
              <th className="px-5 py-5 text-lg font-semibold text-left text-black dark:text-gray-400">권한</th>
              <th className="px-5 py-5 text-lg font-semibold text-left text-black dark:text-gray-400">사용자명</th>
              <th className="px-5 py-5 text-lg font-semibold text-left text-black dark:text-gray-400">이름</th>
              <th className="px-5 py-5 text-lg font-semibold text-left text-black dark:text-gray-400">전화번호</th>
              <th className="px-5 py-5 text-lg font-semibold text-left text-black dark:text-gray-400">생년월일</th>
              <th className="px-5 py-5 text-lg font-semibold text-left text-black dark:text-gray-400">상태</th>
              <th className="px-5 py-5 text-lg font-semibold text-right text-black dark:text-gray-400"></th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-lg text-center text-gray-500 dark:text-gray-400">
                  사용자 데이터가 없습니다.
                </td>
              </tr>
            ) : (
              sortedUsers.map((user) => (
              <tr key={user.id} className="border-b border-gray-200 dark:border-[#1a1a1a] hover:bg-gray-50 dark:hover:bg-[#0f0f0f] transition-colors">
                <td className="px-5 py-5">
                  <Checkbox
                    checked={selectedUsers.includes(user.id)}
                    onCheckedChange={(checked) => toggleOne(user.id, checked as boolean)}
                    className="w-5 h-5 border-gray-300 dark:border-gray-600"
                  />
                </td>
                <td className="px-5 py-5 text-lg text-black dark:text-gray-300">{user.id}</td>
                <td className="px-5 py-5 text-lg text-black dark:text-gray-300">{user.authority}</td>
                <td className="px-5 py-5 text-lg text-black dark:text-gray-300">{user.username}</td>
                <td className="px-5 py-5 text-lg text-black dark:text-white">{user.name}</td>
                <td className="px-5 py-5 text-lg text-black dark:text-gray-300">{user.phone}</td>
                <td className="px-5 py-5 text-lg text-black dark:text-gray-300">{formatBirthdate(user.birthdate)}</td>
                <td className="px-5 py-5 text-lg text-black dark:text-gray-300">{user.status}</td>
                <td className="px-5 py-5">
                  <div className="flex gap-2 justify-end items-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-[#1a1a1a] gap-2 text-lg"
                      onClick={() => handleSendNotification(user)}
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      알림
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1a1a1a] gap-2 text-lg"
                      onClick={() => handleEdit(user)}
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      EDIT
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-[#1a1a1a] gap-2 text-lg"
                      onClick={() => handleDelete(user.id)}
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      {/* 알림 전송 다이얼로그 */}
      <Dialog open={isNotificationDialogOpen} onOpenChange={setIsNotificationDialogOpen}>
        <DialogContent className="bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-[#1a1a1a] text-gray-900 dark:text-white">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">알림 전송</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              {notificationUser?.name} ({notificationUser?.username})님에게 알림을 전송합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="notification_type" className="text-gray-700 dark:text-gray-300">알림 유형</Label>
              <Select
                value={notificationType}
                onValueChange={(value: 'custom' | 'diary' | 'report') => {
                  setNotificationType(value)
                  if (value !== 'custom') {
                    setCustomMessage('')
                  }
                }}
              >
                <SelectTrigger className="bg-white dark:bg-[#1a1a1a] border-gray-300 dark:border-[#2a2a2a] text-gray-900 dark:text-white">
                  <SelectValue placeholder="알림 유형 선택" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#1a1a1a] border-gray-300 dark:border-[#2a2a2a] text-gray-900 dark:text-white">
                  <SelectItem value="custom">커스텀 알림</SelectItem>
                  <SelectItem value="diary">일기 알림</SelectItem>
                  <SelectItem value="report">리포트 알림</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {notificationType === 'custom' && (
              <div className="grid gap-2">
                <Label htmlFor="custom_message" className="text-gray-700 dark:text-gray-300">알림 메시지 *</Label>
                <Input
                  id="custom_message"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="알림 메시지를 입력하세요"
                  className="bg-white dark:bg-[#1a1a1a] border-gray-300 dark:border-[#2a2a2a] text-gray-900 dark:text-white"
                />
              </div>
            )}
            {notificationType === 'diary' && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  일기 작성 알림을 전송합니다.
                </p>
              </div>
            )}
            {notificationType === 'report' && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200 dark:bg-green-900/20 dark:border-green-800">
                <p className="text-sm text-green-800 dark:text-green-300">
                  리포트 알림을 전송합니다.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setIsNotificationDialogOpen(false)
                setNotificationUser(null)
                setCustomMessage('')
                setError(null)
              }}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              disabled={isSendingNotification}
            >
              취소
            </Button>
            <Button
              onClick={handleNotificationSend}
              className="text-white bg-blue-600 hover:bg-blue-700"
              disabled={isSendingNotification}
            >
              {isSendingNotification ? '전송 중...' : '전송'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 전체 알림 전송 다이얼로그 */}
      <Dialog open={isAllNotificationDialogOpen} onOpenChange={setIsAllNotificationDialogOpen}>
        <DialogContent className="bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-[#1a1a1a] text-gray-900 dark:text-white">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">전체 알림 전송</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              모든 사용자에게 알림을 전송합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="all_notification_type" className="text-gray-700 dark:text-gray-300">알림 유형</Label>
              <Select
                value={allNotificationType}
                onValueChange={(value: 'custom' | 'diary' | 'report') => {
                  setAllNotificationType(value)
                  if (value !== 'custom') {
                    setAllCustomMessage('')
                  }
                }}
              >
                <SelectTrigger className="bg-white dark:bg-[#1a1a1a] border-gray-300 dark:border-[#2a2a2a] text-gray-900 dark:text-white">
                  <SelectValue placeholder="알림 유형 선택" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#1a1a1a] border-gray-300 dark:border-[#2a2a2a] text-gray-900 dark:text-white">
                  <SelectItem value="custom">커스텀 알림</SelectItem>
                  <SelectItem value="diary">일기 알림</SelectItem>
                  <SelectItem value="report">리포트 알림</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {allNotificationType === 'custom' && (
              <div className="grid gap-2">
                <Label htmlFor="all_custom_message" className="text-gray-700 dark:text-gray-300">알림 메시지 *</Label>
                <Input
                  id="all_custom_message"
                  value={allCustomMessage}
                  onChange={(e) => setAllCustomMessage(e.target.value)}
                  placeholder="알림 메시지를 입력하세요"
                  className="bg-white dark:bg-[#1a1a1a] border-gray-300 dark:border-[#2a2a2a] text-gray-900 dark:text-white"
                />
              </div>
            )}
            {allNotificationType === 'diary' && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  모든 사용자에게 일기 작성 알림을 전송합니다.
                </p>
              </div>
            )}
            {allNotificationType === 'report' && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200 dark:bg-green-900/20 dark:border-green-800">
                <p className="text-sm text-green-800 dark:text-green-300">
                  모든 사용자에게 리포트 알림을 전송합니다.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setIsAllNotificationDialogOpen(false)
                setAllCustomMessage('')
                setError(null)
              }}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              disabled={isSendingAllNotification}
            >
              취소
            </Button>
            <Button
              onClick={handleAllNotificationSend}
              className="text-white bg-green-600 hover:bg-green-700"
              disabled={isSendingAllNotification}
            >
              {isSendingAllNotification ? '전송 중...' : '전체 전송'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

