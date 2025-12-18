/**
 * 유효성 검사 관련 유틸리티 함수
 */

/**
 * 이메일 유효성 검사
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * 비밀번호 유효성 검사 (최소 8자, 영문, 숫자, 특수문자 포함)
 */
export const isValidPassword = (password: string): boolean => {
  const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

/**
 * 전화번호 유효성 검사
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
  return phoneRegex.test(phone.replace(/-/g, ""));
};

/**
 * 생년월일 유효성 검사 (YYYY-MM-DD)
 */
export const isValidBirthDate = (birthDate: string): boolean => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(birthDate)) return false;

  const date = new Date(birthDate);
  return date instanceof Date && !isNaN(date.getTime());
};



