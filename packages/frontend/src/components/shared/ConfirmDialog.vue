<script setup lang="ts">
import { watch } from 'vue';
import { cn } from '@/lib/utils';

const props = withDefaults(
  defineProps<{
    open: boolean;
    title: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'default' | 'destructive';
  }>(),
  {
    description: undefined,
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    variant: 'default',
  },
);

const emit = defineEmits<{
  confirm: [];
  cancel: [];
}>();

// Prevent body scroll when dialog is open
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  },
);

function handleOverlayClick(event: MouseEvent) {
  if (event.target === event.currentTarget) {
    emit('cancel');
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center"
        @click="handleOverlayClick"
      >
        <!-- Overlay -->
        <div class="fixed inset-0 bg-black/50" />

        <!-- Dialog -->
        <div class="relative z-50 w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg">
          <h2 class="text-lg font-semibold text-card-foreground">
            {{ title }}
          </h2>
          <p
            v-if="description"
            class="mt-2 text-sm text-muted-foreground"
          >
            {{ description }}
          </p>

          <div class="mt-6 flex justify-end gap-3">
            <button
              class="inline-flex items-center justify-center rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-card-foreground hover:bg-muted transition-colors"
              @click="emit('cancel')"
            >
              {{ cancelText }}
            </button>
            <button
              :class="cn(
                'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors',
                variant === 'destructive'
                  ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90',
              )"
              @click="emit('confirm')"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
