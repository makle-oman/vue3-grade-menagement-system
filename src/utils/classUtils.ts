/**
 * 班级名称格式化工具函数
 */

/**
 * 格式化班级名称，统一显示格式
 * @param className 原始班级名称
 * @returns 格式化后的班级名称
 */
export function formatClassName(className: string): string {
  if (!className) return '';
  
  // 移除多余的空格
  const trimmed = className.trim();
  
  // 如果已经是正确格式，直接返回
  if (/^[一二三四五六七八九十]（\d+）班$/.test(trimmed)) {
    return trimmed;
  }
  
  // 匹配各种可能的班级名称格式
  const patterns = [
    // 匹配 "1-2" 格式
    /^(\d+)-(\d+)$/,
    // 匹配 "一(2)班", "一（2）班", "1(2)班" 等格式
    /^([一二三四五六七八九十\d]+)[（(](\d+)[）)][班]?$/,
    // 匹配 "一年级2班", "1年级2班" 等格式
    /^([一二三四五六七八九十\d]+)年级(\d+)班$/,
    // 匹配 "2班", "二班" 等格式
    /^([一二三四五六七八九十\d]+)[班]?$/
  ];
  
  // 数字转中文映射
  const numberToChinese: { [key: string]: string } = {
    '1': '一', '2': '二', '3': '三', '4': '四', '5': '五',
    '6': '六', '7': '七', '8': '八', '9': '九', '10': '十'
  };
  
  // 尝试匹配 "1-2" 格式
  const match0 = trimmed.match(patterns[0]);
  if (match0) {
    const grade = match0[1];
    const classNum = match0[2];
    
    const gradeInChinese = numberToChinese[grade] || grade;
    return `${gradeInChinese}（${classNum}）班`;
  }
  
  // 尝试匹配第一种格式：年级(班级)班
  const match1 = trimmed.match(patterns[1]);
  if (match1) {
    const grade = match1[1];
    const classNum = match1[2];
    
    // 统一使用中文年级 + 阿拉伯数字班级的格式，使用全角括号
    const gradeInChinese = numberToChinese[grade] || grade;
    return `${gradeInChinese}（${classNum}）班`;
  }
  
  // 尝试匹配第二种格式：年级年级班级班
  const match2 = trimmed.match(patterns[2]);
  if (match2) {
    const grade = match2[1];
    const classNum = match2[2];
    
    const gradeInChinese = numberToChinese[grade] || grade;
    return `${gradeInChinese}（${classNum}）班`;
  }
  
  // 尝试匹配第三种格式：只有班级号
  const match3 = trimmed.match(patterns[3]);
  if (match3) {
    const classNum = match3[1];
    // 如果只有班级号，假设是一年级
    return `一（${classNum}）班`;
  }
  
  // 如果都不匹配，返回原始名称
  return trimmed;
}

/**
 * 获取班级的简短显示名称（用于下拉框等空间有限的地方）
 * @param className 班级名称
 * @returns 简短的班级名称
 */
export function getShortClassName(className: string): string {
  const formatted = formatClassName(className);
  
  // 提取年级和班级号
  const match = formatted.match(/^([一二三四五六七八九十\d]+)[（(](\d+)[）)]班$/);
  if (match) {
    return `${match[1]}(${match[2]})`;
  }
  
  return formatted;
}

/**
 * 按年级和班级号排序班级列表
 * @param classes 班级列表
 * @returns 排序后的班级列表
 */
export function sortClasses<T extends { name: string }>(classes: T[]): T[] {
  return classes.sort((a, b) => {
    const aFormatted = formatClassName(a.name);
    const bFormatted = formatClassName(b.name);
    
    // 提取年级和班级号进行数值比较
    const aMatch = aFormatted.match(/^([一二三四五六七八九十\d]+)[（(](\d+)[）)]班$/);
    const bMatch = bFormatted.match(/^([一二三四五六七八九十\d]+)[（(](\d+)[）)]班$/);
    
    if (aMatch && bMatch) {
      // 中文转数字进行比较
      const chineseToNumber: { [key: string]: number } = {
        '一': 1, '二': 2, '三': 3, '四': 4, '五': 5,
        '六': 6, '七': 7, '八': 8, '九': 9, '十': 10
      };
      
      const aGrade = chineseToNumber[aMatch[1]] || parseInt(aMatch[1]) || 0;
      const bGrade = chineseToNumber[bMatch[1]] || parseInt(bMatch[1]) || 0;
      
      if (aGrade !== bGrade) {
        return aGrade - bGrade;
      }
      
      const aClass = parseInt(aMatch[2]) || 0;
      const bClass = parseInt(bMatch[2]) || 0;
      return aClass - bClass;
    }
    
    // 如果格式不匹配，按字符串排序
    return aFormatted.localeCompare(bFormatted);
  });
}