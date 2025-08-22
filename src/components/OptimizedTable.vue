<template>
  <div class="optimized-table">
    <div class="table-header" v-if="showSearch || showExport">
      <div class="search-section" v-if="showSearch">
        <el-input
          v-model="searchQuery"
          placeholder="搜索..."
          :prefix-icon="Search"
          clearable
          @input="handleSearch"
          class="search-input"
        />
      </div>
      <div class="action-section" v-if="showExport">
        <el-button
          type="primary"
          :icon="Download"
          @click="exportData"
          :loading="exporting"
        >
          导出数据
        </el-button>
      </div>
    </div>

    <el-table
      :data="paginatedData"
      v-loading="loading"
      :height="tableHeight"
      stripe
      border
      class="modern-table"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
    >
      <el-table-column
        v-if="selectable"
        type="selection"
        width="55"
        align="center"
      />
      
      <slot name="columns" />
      
      <el-table-column
        v-if="showActions"
        label="操作"
        width="120"
        align="center"
        fixed="right"
      >
        <template #default="scope">
          <slot name="actions" :row="scope.row" :index="scope.$index" />
        </template>
      </el-table-column>
    </el-table>

    <div class="table-footer" v-if="showPagination && filteredData.length > pageSize">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="filteredData.length"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        class="modern-pagination"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElTable, ElTableColumn, ElInput, ElButton, ElPagination } from 'element-plus'
import { Search, Download } from '@element-plus/icons-vue'
import * as XLSX from 'xlsx'

interface Props {
  data: any[]
  loading?: boolean
  showSearch?: boolean
  showExport?: boolean
  showPagination?: boolean
  showActions?: boolean
  selectable?: boolean
  tableHeight?: string | number
  searchFields?: string[]
  exportFileName?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  showSearch: true,
  showExport: true,
  showPagination: true,
  showActions: true,
  selectable: false,
  tableHeight: 'auto',
  searchFields: () => [],
  exportFileName: 'data'
})

const emit = defineEmits<{
  selectionChange: [selection: any[]]
  sortChange: [sort: { column: any; prop: string; order: string }]
}>()

const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const exporting = ref(false)

// 搜索过滤
const filteredData = computed(() => {
  if (!searchQuery.value) return props.data
  
  const query = searchQuery.value.toLowerCase()
  return props.data.filter(item => {
    if (props.searchFields.length > 0) {
      return props.searchFields.some(field => {
        const value = item[field]
        return value && value.toString().toLowerCase().includes(query)
      })
    } else {
      return Object.values(item).some(value => 
        value && value.toString().toLowerCase().includes(query)
      )
    }
  })
})

// 分页数据
const paginatedData = computed(() => {
  if (!props.showPagination) return filteredData.value
  
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredData.value.slice(start, end)
})

// 搜索防抖
let searchTimeout: NodeJS.Timeout
const handleSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
  }, 300)
}

// 分页处理
const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
}

// 选择处理
const handleSelectionChange = (selection: any[]) => {
  emit('selectionChange', selection)
}

// 排序处理
const handleSortChange = (sort: { column: any; prop: string; order: string }) => {
  emit('sortChange', sort)
}

// 导出数据
const exportData = async () => {
  try {
    exporting.value = true
    
    const worksheet = XLSX.utils.json_to_sheet(filteredData.value)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
    
    const fileName = `${props.exportFileName}_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(workbook, fileName)
  } catch (error) {
    console.error('导出失败:', error)
  } finally {
    exporting.value = false
  }
}

// 重置搜索
const resetSearch = () => {
  searchQuery.value = ''
  currentPage.value = 1
}

// 暴露方法
defineExpose({
  resetSearch
})
</script>

<style scoped>
.optimized-table {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.search-section {
  flex: 1;
  max-width: 300px;
}

.search-input {
  width: 100%;
}

.action-section {
  margin-left: 16px;
}

.modern-table {
  --el-table-border-color: #e2e8f0;
  --el-table-bg-color: #ffffff;
  --el-table-tr-bg-color: #f8fafc;
  --el-table-header-bg-color: #f1f5f9;
  --el-table-header-text-color: #374151;
}

.table-footer {
  padding: 16px 20px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: center;
}

.modern-pagination {
  --el-pagination-button-color: #6b7280;
  --el-pagination-hover-color: #3b82f6;
}

:deep(.el-table__header-wrapper) {
  background: #f1f5f9;
}

:deep(.el-table__header th) {
  background: #f1f5f9 !important;
  color: #374151;
  font-weight: 600;
  border-bottom: 2px solid #e2e8f0;
}

:deep(.el-table__row:hover > td) {
  background-color: #f0f9ff !important;
}

:deep(.el-table__row.current-row > td) {
  background-color: #dbeafe !important;
}
</style>