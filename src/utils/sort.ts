/**
 * 按学号排序学生
 * 学号可能包含字母和数字，需要特殊处理
 */
export function compareStudentNumbers(a: { studentNumber: string }, b: { studentNumber: string }): number {
  const aNum = a.studentNumber;
  const bNum = b.studentNumber;
  
  // 如果学号是纯数字，按数字大小排序
  if (/^\d+$/.test(aNum) && /^\d+$/.test(bNum)) {
    return parseInt(aNum) - parseInt(bNum);
  }
  
  // 否则按字符串排序
  return aNum.localeCompare(bNum);
}

/**
 * 按日期排序，降序
 */
export function sortByDateDesc<T extends { date: string | Date }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA;
  });
}

/**
 * 按成绩排序，降序
 */
export function sortByScoreDesc<T extends { score: number | null }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    // 处理null值
    const scoreA = a.score === null ? -1 : a.score;
    const scoreB = b.score === null ? -1 : b.score;
    return scoreB - scoreA;
  });
}

/**
 * 通用排序函数
 * @param data 要排序的数据
 * @param field 排序字段
 * @param order 排序方式 'asc' 或 'desc'
 * @returns 排序后的数据
 */
export function sortData<T>(data: T[], field: keyof T, order: 'asc' | 'desc'): T[] {
  return [...data].sort((a, b) => {
    const valueA = a[field];
    const valueB = b[field];
    
    // 处理特殊情况：学号排序
    if (field === 'studentNumber' || field === 'studentId') {
      const aStr = String(valueA);
      const bStr = String(valueB);
      
      // 如果学号是纯数字，按数字大小排序
      if (/^\d+$/.test(aStr) && /^\d+$/.test(bStr)) {
        return order === 'asc' 
          ? parseInt(aStr) - parseInt(bStr)
          : parseInt(bStr) - parseInt(aStr);
      }
      
      // 否则按字符串排序
      return order === 'asc'
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    }
    
    // 处理日期类型
    if (valueA instanceof Date && valueB instanceof Date) {
      return order === 'asc'
        ? valueA.getTime() - valueB.getTime()
        : valueB.getTime() - valueA.getTime();
    }
    
    // 处理字符串类型
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return order === 'asc'
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }
    
    // 处理数字类型
    if (typeof valueA === 'number' && typeof valueB === 'number') {
      return order === 'asc' ? valueA - valueB : valueB - valueA;
    }
    
    // 默认情况
    return 0;
  });
}
