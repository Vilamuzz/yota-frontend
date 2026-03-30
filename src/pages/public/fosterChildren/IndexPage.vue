<script setup lang="ts">
import PublicLayout from '@/layouts/PublicLayout.vue'
import BaseSearchChildren from '@/components/atoms/BaseSearchChildren.vue'
import BaseLoading from '@/components/atoms/BaseLoading.vue'
import BaseAlert from '@/components/atoms/BaseAlert.vue'
import ChildrenCard from '@/components/molecules/ChildrenCard.vue'
import { computed, ref } from 'vue'
import { usePublishedChildList } from '@/composables/fosterchildren/usePublishedChildList'

const searchQuery = ref('')

const params = computed(() => ({
  search: searchQuery.value || undefined,
}))


const { publishedChildListQuery, publishedChildListError } = usePublishedChildList(params)

const children = computed(() => publishedChildListQuery.data.value?.data?.child ?? [])
</script>

<template>
  <PublicLayout>
    <BaseSearchChildren v-model="searchQuery" />

    <div class="mx-auto mt-10 px-6 md:px-12 lg:px-24">
      <!-- Loading State -->
      <BaseLoading v-if="publishedChildListQuery.isLoading.value" message="Memuat data..." />

      <!-- Error State -->
      <BaseAlert v-else-if="publishedChildListQuery.isError.value" type="error">
        {{ publishedChildListError || 'Gagal memuat data anak asuh.' }}
      </BaseAlert>

      <!-- Daftar Anak Asuh -->
      <div v-else class="grid grid-cols-7 gap-6">
        <ChildrenCard v-for="child in children" :key="child.id" :children="child" />

        <!-- Empty State -->
        <div v-if="children.length === 0" class="col-span-2 text-center py-16 text-gray-400">
          Tidak ada anak asuh aktif saat ini.
        </div>
      </div>
    </div>
  </PublicLayout>
</template>
