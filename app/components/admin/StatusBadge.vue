<script setup lang="ts">
/** Active/hidden pill, used in every content table. */
defineProps<{ active: boolean, activeLabel: string, inactiveLabel: string }>()
</script>

<template>
  <UBadge
    :color="active ? 'success' : 'neutral'"
    variant="subtle"
    size="sm"
  >
    {{ active ? activeLabel : inactiveLabel }}
  </UBadge>
</template>
