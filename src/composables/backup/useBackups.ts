import { ref, computed } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { backupService } from '@/services/backup.service'

export function useBackups() {
  const queryClient = useQueryClient()
  const selectedBackupId = ref<string | null>(null)
  const isDownloading = ref(false)

  // Fetch backups list
  const backupsQuery = useQuery({
    queryKey: ['backups'],
    queryFn: () => backupService.getAll(),
    retry: 1,
  })

  const backups = computed(() => backupsQuery.data.value?.data || [])

  // Create backup
  const createBackupMutation = useMutation({
    mutationFn: () => backupService.create(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backups'] })
    },
  })

  // Delete backup
  const deleteBackupMutation = useMutation({
    mutationFn: (backupId: string) => backupService.delete(backupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backups'] })
    },
  })

  // Download backup
  const downloadBackup = async (backupId: string) => {
    try {
      isDownloading.value = true
      const data = await backupService.download(backupId)
      const downloadUrl = data.data?.url
      if (!downloadUrl) throw new Error('No download URL provided')

      // Create and trigger download
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = data.data?.url || `backup-${backupId}.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } finally {
      isDownloading.value = false
    }
  }

  return {
    backups,
    backupsQuery,
    createBackupMutation,
    deleteBackupMutation,
    selectedBackupId,
    isDownloading,
    downloadBackup,
  }
}
