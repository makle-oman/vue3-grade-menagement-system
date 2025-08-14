/**
 * 成绩工具函数
 */

// 获取成绩等级文本
export const getGradeText = (score) => {
  if (score >= 90) return '优秀';
  if (score >= 80) return '良好';
  if (score >= 70) return '合格';
  if (score >= 60) return '合格';
  return '不合格';
};

// 获取成绩等级颜色
export const getGradeColor = (score) => {
  if (score >= 90) return 'bg-green-100 text-green-800';
  if (score >= 80) return 'bg-blue-100 text-blue-800';
  if (score >= 70) return 'bg-yellow-100 text-yellow-800';
  if (score >= 60) return 'bg-orange-100 text-orange-800';
  if (score >= 50) return 'bg-red-100 text-red-800';
  return 'bg-gray-100 text-gray-800';
};

// 获取字母等级
export const getLetterGrade = (score) => {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B+';
  if (score >= 60) return 'B';
  return 'C';
};

// 获取等级标签类型
export const getGradeTagType = (score) => {
  if (score >= 90) return 'bg-green-100 text-green-800';
  if (score >= 80) return 'bg-blue-100 text-blue-800';
  if (score >= 70) return 'bg-yellow-100 text-yellow-800';
  if (score >= 60) return 'bg-orange-100 text-orange-800';
  return 'bg-red-100 text-red-800';
};

// 获取分数段颜色
export const getScoreRangeColor = (range) => {
  if (range === '90-100') return 'bg-green-500';
  if (range === '80-89') return 'bg-blue-500';
  if (range === '70-79') return 'bg-yellow-500';
  if (range === '60-69') return 'bg-orange-500';
  if (range === '50-59') return 'bg-red-400';
  return 'bg-red-600';
};

// 获取行样式
export const getRowClassName = (student) => {
  if (student.score < 60 || student.isAbsent) {
    return 'text-red-500 font-medium';
  }
  return '';
};
