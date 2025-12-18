/**
 * localStorage 관련 유틸리티 함수
 */

/**
 * localStorage에 데이터 저장
 */
export const setStorage = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving to localStorage: ${error}`);
  }
};

/**
 * localStorage에서 데이터 가져오기
 */
export const getStorage = <T>(key: string, defaultValue: T | null = null): T | null => {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error reading from localStorage: ${error}`);
    return defaultValue;
  }
};

/**
 * localStorage에서 데이터 삭제
 */
export const removeStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from localStorage: ${error}`);
  }
};

/**
 * localStorage 전체 초기화
 */
export const clearStorage = (): void => {
  try {
    localStorage.clear();
  } catch (error) {
    console.error(`Error clearing localStorage: ${error}`);
  }
};


