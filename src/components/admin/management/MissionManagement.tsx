import { useState, useEffect } from 'react'
import { useAdminHeader } from '@/contexts/AdminHeaderContext'
import {
  getMissionList,
  createMission,
  updateMission,
  deleteMission,
  searchMissions,
  getMissionById,
  ApiMission,
  CreateMissionRequest,
  SearchMissionParams,
} from '@/lib/adminApi'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/admin/ui/select'
import { Textarea } from '@/components/admin/ui/textarea'

export function MissionManagement() {
  const { setActions } = useAdminHeader()
  const [missions, setMissions] = useState<ApiMission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 다이얼로그 상태
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [editingMission, setEditingMission] = useState<ApiMission | null>(null)
  const [detailMission, setDetailMission] = useState<ApiMission | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // 검색 상태
  const [isSearching, setIsSearching] = useState(false)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [searchCategoryId, setSearchCategoryId] = useState('')
  const [searchSkillId, setSearchSkillId] = useState('')
  const [searchDifficulty, setSearchDifficulty] = useState<string>('ALL')

  // 폼 상태
  const [formData, setFormData] = useState<CreateMissionRequest>({
    question: '',
    answer: '',
    difficulty: 'MEDIUM',
    categories: [],
    skills: [],
  })

  const fetchMissions = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getMissionList()
      setMissions(data)
    } catch (err: any) {
      console.error('미션 조회 에러:', err)
      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.resultMsg ||
        err?.message ||
        '미션을 불러오는데 실패했습니다.'
      setError(errorMessage)
      setMissions([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMissions()
  }, [])

  useEffect(() => {
    setActions({
      onCreate: () => {
        setFormData({
          question: '',
          answer: '',
          difficulty: 'MEDIUM',
          categories: [],
          skills: [],
        })
        setIsCreateDialogOpen(true)
      },
      onRefresh: fetchMissions,
    })

    return () => {
      setActions({})
    }
  }, [setActions])

  const handleCreate = async () => {
    if (!formData.question.trim() || !formData.answer.trim()) {
      setError('질문과 답변을 모두 입력해주세요.')
      return
    }

    setIsSaving(true)
    setError(null)
    try {
      await createMission(formData)
      setIsCreateDialogOpen(false)
      setFormData({
        question: '',
        answer: '',
        difficulty: 'MEDIUM',
        categories: [],
        skills: [],
      })
      await fetchMissions()
    } catch (err: any) {
      console.error('미션 생성 에러:', err)
      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.resultMsg ||
        err?.message ||
        '미션 생성에 실패했습니다.'
      setError(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (mission: ApiMission) => {
    setEditingMission(mission)
    // categories와 skills를 number[]로 변환
    const categories = Array.isArray(mission.categories)
      ? mission.categories.map((c) => (typeof c === 'number' ? c : parseInt(c as string) || 0))
      : []
    const skills = Array.isArray(mission.skills)
      ? mission.skills.map((s) => (typeof s === 'number' ? s : parseInt(s as string) || 0))
      : []
    
    setFormData({
      question: mission.question,
      answer: mission.answer,
      difficulty: mission.difficulty,
      categories,
      skills,
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdate = async () => {
    if (!editingMission) return
    if (!formData.question.trim() || !formData.answer.trim()) {
      setError('질문과 답변을 모두 입력해주세요.')
      return
    }

    setIsSaving(true)
    setError(null)
    try {
      await updateMission(editingMission.id, formData)
      setIsEditDialogOpen(false)
      setEditingMission(null)
      await fetchMissions()
    } catch (err: any) {
      console.error('미션 수정 에러:', err)
      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.resultMsg ||
        err?.message ||
        '미션 수정에 실패했습니다.'
      setError(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (missionId: number) => {
    if (!confirm('정말 이 미션을 삭제하시겠습니까?')) {
      return
    }

    try {
      await deleteMission(missionId)
      await fetchMissions()
    } catch (err: any) {
      console.error('미션 삭제 에러:', err)
      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.resultMsg ||
        err?.message ||
        '미션 삭제에 실패했습니다.'
      alert(errorMessage)
    }
  }

  const handleSearch = async () => {
    setIsSearching(true)
    setError(null)
    try {
      const params: SearchMissionParams = {}
      if (searchKeyword.trim()) {
        params.keyword = searchKeyword.trim()
      }
      if (searchCategoryId.trim()) {
        const categoryId = parseInt(searchCategoryId.trim())
        if (!isNaN(categoryId)) {
          params.categoryId = categoryId
        }
      }
      if (searchSkillId.trim()) {
        const skillId = parseInt(searchSkillId.trim())
        if (!isNaN(skillId)) {
          params.skillId = skillId
        }
      }
      if (searchDifficulty && searchDifficulty !== 'ALL') {
        params.difficulty = searchDifficulty as 'EASY' | 'MEDIUM' | 'HARD'
      }

      const data = await searchMissions(params)
      setMissions(data)
    } catch (err: any) {
      console.error('미션 검색 에러:', err)
      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.resultMsg ||
        err?.message ||
        '미션 검색에 실패했습니다.'
      setError(errorMessage)
      setMissions([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleResetSearch = () => {
    setSearchKeyword('')
    setSearchCategoryId('')
    setSearchSkillId('')
    setSearchDifficulty('ALL')
    fetchMissions()
  }

  const handleViewDetail = async (missionId: number) => {
    try {
      const detail = await getMissionById(missionId)
      // ApiMissionDetail을 ApiMission으로 변환 (categories와 skills를 number[]로 변환 시도)
      const mission: ApiMission = {
        ...detail,
        categories: detail.categories.map((c) => {
          const num = parseInt(c as any)
          return isNaN(num) ? 0 : num
        }),
        skills: detail.skills.map((s) => {
          const num = parseInt(s as any)
          return isNaN(num) ? 0 : num
        }),
      }
      setDetailMission(mission)
      setIsDetailDialogOpen(true)
    } catch (err: any) {
      console.error('미션 상세 조회 에러:', err)
      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.resultMsg ||
        err?.message ||
        '미션 상세 정보를 불러오는데 실패했습니다.'
      alert(errorMessage)
    }
  }

  const getDifficultyLabel = (difficulty: string) => {
    const labels: Record<string, string> = {
      EASY: 'Easy',
      MEDIUM: 'Medium',
      HARD: 'Hard',
    }
    return labels[difficulty] || difficulty
  }

  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      EASY: 'bg-green-100 text-green-700 border-green-300',
      MEDIUM: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      HARD: 'bg-red-100 text-red-700 border-red-300',
    }
    return colors[difficulty] || 'bg-gray-100 text-gray-700 border-gray-300'
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12 w-full">
        <p className="text-gray-400">로딩 중...</p>
      </div>
    )
  }

  return (
    <div className="w-full scale-[0.85] origin-top-left" style={{ width: '117.65%' }}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">미션 관리</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">면접 미션을 관리할 수 있습니다.</p>
      </div>

      {error && (
        <div className="p-3 mb-3 rounded-lg border bg-red-900/20 border-red-500/50">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* 검색창 */}
      <div className="mb-4 p-3 bg-gray-50 dark:bg-[#0a0a0a] rounded-lg border border-gray-200 dark:border-[#1a1a1a]">
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-5">
          <div>
            <Label htmlFor="search-keyword" className="block mb-1.5 text-sm font-medium text-gray-900 dark:text-white">
              질문 키워드
            </Label>
            <Input
              id="search-keyword"
              type="text"
              placeholder="질문 키워드"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch()
                }
              }}
              className="bg-white dark:bg-[#1a1a1a] border-gray-300 dark:border-[#2a2a2a] text-gray-900 dark:text-white h-10 text-sm"
            />
          </div>
          <div>
            <Label htmlFor="search-category" className="block mb-1.5 text-sm font-medium text-gray-900 dark:text-white">
              카테고리 ID
            </Label>
            <Input
              id="search-category"
              type="number"
              placeholder="카테고리 ID"
              value={searchCategoryId}
              onChange={(e) => setSearchCategoryId(e.target.value)}
              className="bg-white dark:bg-[#1a1a1a] border-gray-300 dark:border-[#2a2a2a] text-gray-900 dark:text-white h-10 text-sm"
            />
          </div>
          <div>
            <Label htmlFor="search-skill" className="block mb-1.5 text-sm font-medium text-gray-900 dark:text-white">
              스킬 ID
            </Label>
            <Input
              id="search-skill"
              type="number"
              placeholder="스킬 ID"
              value={searchSkillId}
              onChange={(e) => setSearchSkillId(e.target.value)}
              className="bg-white dark:bg-[#1a1a1a] border-gray-300 dark:border-[#2a2a2a] text-gray-900 dark:text-white h-10 text-sm"
            />
          </div>
          <div>
            <Label htmlFor="search-difficulty" className="block mb-1.5 text-sm font-medium text-gray-900 dark:text-white">
              난이도
            </Label>
            <Select value={searchDifficulty} onValueChange={setSearchDifficulty}>
              <SelectTrigger className="bg-white dark:bg-[#1a1a1a] border-gray-300 dark:border-[#2a2a2a] text-gray-900 dark:text-white h-10 text-sm w-full">
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#1a1a1a] border-gray-300 dark:border-[#2a2a2a] text-gray-900 dark:text-white z-[100]">
                <SelectItem value="ALL" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-[#2a2a2a]">
                  전체
                </SelectItem>
                <SelectItem value="EASY" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-[#2a2a2a]">
                  Easy
                </SelectItem>
                <SelectItem value="MEDIUM" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-[#2a2a2a]">
                  Medium
                </SelectItem>
                <SelectItem value="HARD" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-[#2a2a2a]">
                  Hard
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 items-end">
            <Button
              onClick={handleSearch}
              disabled={isSearching}
              className="flex-1 h-10 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? '검색 중...' : '검색'}
            </Button>
            {(searchKeyword || searchCategoryId || searchSkillId || (searchDifficulty && searchDifficulty !== 'ALL')) && (
              <Button
                onClick={handleResetSearch}
                variant="outline"
                className="h-10 px-4 text-sm font-medium border-gray-300 dark:border-[#2a2a2a] hover:bg-gray-100 dark:hover:bg-[#1a1a1a] bg-white dark:bg-transparent text-gray-900 dark:text-white"
              >
                초기화
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 미션 목록 */}
      <div className="bg-white dark:bg-[#0a0a0a] rounded-lg border border-gray-200 dark:border-[#1a1a1a]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-[#1a1a1a]">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-white">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-white">
                  질문
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-white">
                  답변
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-white">
                  난이도
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-white">
                  카테고리
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-white">
                  스킬
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-white">
                  작업
                </th>
              </tr>
            </thead>
            <tbody>
              {missions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    미션이 없습니다.
                  </td>
                </tr>
              ) : (
                missions.map((mission) => (
                  <tr
                    key={mission.id}
                    className="border-b border-gray-200 dark:border-[#1a1a1a] hover:bg-gray-50 dark:hover:bg-[#1a1a1a]"
                  >
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{mission.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white max-w-xs truncate">
                      {mission.question}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white max-w-xs truncate">
                      {mission.answer}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded border ${getDifficultyColor(
                          mission.difficulty
                        )}`}
                      >
                        {getDifficultyLabel(mission.difficulty)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {mission.categories.length > 0 ? mission.categories.join(', ') : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {mission.skills.length > 0 ? mission.skills.join(', ') : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleViewDetail(mission.id)}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                        >
                          상세
                        </Button>
                        <Button
                          onClick={() => handleEdit(mission)}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                        >
                          수정
                        </Button>
                        <Button
                          onClick={() => handleDelete(mission.id)}
                          variant="outline"
                          size="sm"
                          className="text-xs text-red-600 hover:text-red-700"
                        >
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

      {/* 생성 다이얼로그 */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-[#1a1a1a] text-gray-900 dark:text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">미션 추가</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              새로운 면접 미션을 생성합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="question" className="text-gray-700 dark:text-gray-300">
                질문 *
              </Label>
              <Textarea
                id="question"
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                className="bg-white dark:bg-[#1a1a1a] border-gray-300 dark:border-[#2a2a2a] text-gray-900 dark:text-white min-h-[100px]"
                placeholder="예: Spring Bean의 생명주기를 설명하세요."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="answer" className="text-gray-700 dark:text-gray-300">
                답변 *
              </Label>
              <Textarea
                id="answer"
                value={formData.answer}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                className="bg-white dark:bg-[#1a1a1a] border-gray-300 dark:border-[#2a2a2a] text-gray-900 dark:text-white min-h-[150px]"
                placeholder="답변을 입력하세요."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="difficulty" className="text-gray-700 dark:text-gray-300">
                난이도 *
              </Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value: 'EASY' | 'MEDIUM' | 'HARD') =>
                  setFormData({ ...formData, difficulty: value })
                }
              >
                <SelectTrigger className="bg-white dark:bg-[#1a1a1a] border-gray-300 dark:border-[#2a2a2a] text-gray-900 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#1a1a1a] border-gray-300 dark:border-[#2a2a2a] text-gray-900 dark:text-white z-[100]">
                  <SelectItem value="EASY" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-[#2a2a2a]">
                    Easy
                  </SelectItem>
                  <SelectItem value="MEDIUM" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-[#2a2a2a]">
                    Medium
                  </SelectItem>
                  <SelectItem value="HARD" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-[#2a2a2a]">
                    Hard
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="categories" className="text-gray-700 dark:text-gray-300">
                카테고리 ID (쉼표로 구분)
              </Label>
              <Input
                id="categories"
                value={formData.categories.join(', ')}
                onChange={(e) => {
                  const values = e.target.value
                    .split(',')
                    .map((v) => parseInt(v.trim()))
                    .filter((v) => !isNaN(v))
                  setFormData({ ...formData, categories: values })
                }}
                className="bg-white dark:bg-[#1a1a1a] border-gray-300 dark:border-[#2a2a2a] text-gray-900 dark:text-white"
                placeholder="예: 1, 2, 3"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="skills" className="text-gray-700 dark:text-gray-300">
                스킬 ID (쉼표로 구분)
              </Label>
              <Input
                id="skills"
                value={formData.skills.join(', ')}
                onChange={(e) => {
                  const values = e.target.value
                    .split(',')
                    .map((v) => parseInt(v.trim()))
                    .filter((v) => !isNaN(v))
                  setFormData({ ...formData, skills: values })
                }}
                className="bg-white dark:bg-[#1a1a1a] border-gray-300 dark:border-[#2a2a2a] text-gray-900 dark:text-white"
                placeholder="예: 3, 5"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              disabled={isSaving}
            >
              취소
            </Button>
            <Button onClick={handleCreate} disabled={isSaving}>
              {isSaving ? '생성 중...' : '생성'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 수정 다이얼로그 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-[#1a1a1a] text-gray-900 dark:text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">미션 수정</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              미션 내용을 수정합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-question" className="text-gray-700 dark:text-gray-300">
                질문 *
              </Label>
              <Textarea
                id="edit-question"
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                className="bg-white dark:bg-[#1a1a1a] border-gray-300 dark:border-[#2a2a2a] text-gray-900 dark:text-white min-h-[100px]"
                placeholder="예: Spring Bean의 생명주기를 설명하세요."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-answer" className="text-gray-700 dark:text-gray-300">
                답변 *
              </Label>
              <Textarea
                id="edit-answer"
                value={formData.answer}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                className="bg-white dark:bg-[#1a1a1a] border-gray-300 dark:border-[#2a2a2a] text-gray-900 dark:text-white min-h-[150px]"
                placeholder="답변을 입력하세요."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-difficulty" className="text-gray-700 dark:text-gray-300">
                난이도 *
              </Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value: 'EASY' | 'MEDIUM' | 'HARD') =>
                  setFormData({ ...formData, difficulty: value })
                }
              >
                <SelectTrigger className="bg-white dark:bg-[#1a1a1a] border-gray-300 dark:border-[#2a2a2a] text-gray-900 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#1a1a1a] border-gray-300 dark:border-[#2a2a2a] text-gray-900 dark:text-white z-[100]">
                  <SelectItem value="EASY" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-[#2a2a2a]">
                    Easy
                  </SelectItem>
                  <SelectItem value="MEDIUM" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-[#2a2a2a]">
                    Medium
                  </SelectItem>
                  <SelectItem value="HARD" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-[#2a2a2a]">
                    Hard
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-categories" className="text-gray-700 dark:text-gray-300">
                카테고리 ID (쉼표로 구분)
              </Label>
              <Input
                id="edit-categories"
                value={formData.categories.join(', ')}
                onChange={(e) => {
                  const values = e.target.value
                    .split(',')
                    .map((v) => parseInt(v.trim()))
                    .filter((v) => !isNaN(v))
                  setFormData({ ...formData, categories: values })
                }}
                className="bg-white dark:bg-[#1a1a1a] border-gray-300 dark:border-[#2a2a2a] text-gray-900 dark:text-white"
                placeholder="예: 1, 2, 3"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-skills" className="text-gray-700 dark:text-gray-300">
                스킬 ID (쉼표로 구분)
              </Label>
              <Input
                id="edit-skills"
                value={formData.skills.join(', ')}
                onChange={(e) => {
                  const values = e.target.value
                    .split(',')
                    .map((v) => parseInt(v.trim()))
                    .filter((v) => !isNaN(v))
                  setFormData({ ...formData, skills: values })
                }}
                className="bg-white dark:bg-[#1a1a1a] border-gray-300 dark:border-[#2a2a2a] text-gray-900 dark:text-white"
                placeholder="예: 3, 5"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isSaving}
            >
              취소
            </Button>
            <Button onClick={handleUpdate} disabled={isSaving}>
              {isSaving ? '수정 중...' : '수정'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 상세 보기 다이얼로그 */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-[#1a1a1a] text-gray-900 dark:text-white max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">미션 상세 정보</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              미션의 상세 정보를 확인합니다.
            </DialogDescription>
          </DialogHeader>
          {detailMission && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label className="text-gray-700 dark:text-gray-300">ID</Label>
                <p className="text-sm text-gray-900 dark:text-white">{detailMission.id}</p>
              </div>
              <div className="grid gap-2">
                <Label className="text-gray-700 dark:text-gray-300">질문</Label>
                <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                  {detailMission.question}
                </p>
              </div>
              <div className="grid gap-2">
                <Label className="text-gray-700 dark:text-gray-300">답변</Label>
                <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                  {detailMission.answer}
                </p>
              </div>
              <div className="grid gap-2">
                <Label className="text-gray-700 dark:text-gray-300">난이도</Label>
                <span
                  className={`inline-flex w-fit px-2 py-1 text-xs font-medium rounded border ${getDifficultyColor(
                    detailMission.difficulty
                  )}`}
                >
                  {getDifficultyLabel(detailMission.difficulty)}
                </span>
              </div>
              <div className="grid gap-2">
                <Label className="text-gray-700 dark:text-gray-300">카테고리</Label>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(detailMission.categories) && detailMission.categories.length > 0 ? (
                    detailMission.categories.map((cat, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded border border-blue-300"
                      >
                        {cat}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500 dark:text-gray-400">없음</span>
                  )}
                </div>
              </div>
              <div className="grid gap-2">
                <Label className="text-gray-700 dark:text-gray-300">스킬</Label>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(detailMission.skills) && detailMission.skills.length > 0 ? (
                    detailMission.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded border border-purple-300"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500 dark:text-gray-400">없음</span>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
