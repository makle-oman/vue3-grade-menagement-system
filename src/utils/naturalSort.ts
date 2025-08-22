/**
 * 自然排序函数，正确处理数字排序
 * 例如：1, 2, 3, ..., 10, 11 而不是 1, 10, 11, 2, 20
 */
export function naturalSort(a: string, b: string): number {
  // 处理 null 或 undefined 值
  if (!a && !b) return 0;
  if (!a) return -1;
  if (!b) return 1;
  
  // 确保是字符串类型
  const aStr = String(a);
  const bStr = String(b);
  
  // 将字符串分解为数字和非数字部分
  const regex = /(\d+|\D+)/g;
  const aParts = aStr.match(regex) || [];
  const bParts = bStr.match(regex) || [];
  
  const maxLength = Math.max(aParts.length, bParts.length);
  
  for (let i = 0; i < maxLength; i++) {
    const aPart = aParts[i] || '';
    const bPart = bParts[i] || '';
    
    // 如果两个部分都是数字
    if (/^\d+$/.test(aPart) && /^\d+$/.test(bPart)) {
      const aNum = parseInt(aPart, 10);
      const bNum = parseInt(bPart, 10);
      if (aNum !== bNum) {
        return aNum - bNum;
      }
    } else {
      // 字符串比较
      if (aPart !== bPart) {
        return aPart.localeCompare(bPart);
      }
    }
  }
  
  return 0;
}

/**
 * 学号自然排序函数
 * 专门用于学号排序，确保数字部分按数值大小排序
 */
export function sortStudentNumbers(a: string, b: string): number {
  return naturalSort(a, b);
}

/**
 * 对学生数组按学号进行自然排序
 */
export function sortStudentsByNumber<T extends { studentNumber: string }>(students: T[]): T[] {
  return [...students].sort((a, b) => sortStudentNumbers(a.studentNumber, b.studentNumber));
}