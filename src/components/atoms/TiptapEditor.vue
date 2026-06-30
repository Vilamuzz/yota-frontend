<script setup lang="ts">
import { watch, onBeforeUnmount } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import Placeholder from '@tiptap/extension-placeholder'
import {
  Bold,
  Italic,
  UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  ImageIcon,
  Undo2,
  Redo2,
  Quote,
  Highlighter,
  Minus,
} from 'lucide-vue-next'

interface Props {
  modelValue: string
  placeholder?: string
  error?: string
  label?: string
  required?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Tuliskan isi berita secara lengkap di sini...',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3],
      },
    }),
    Underline,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: 'tiptap-link',
        rel: 'noopener noreferrer',
        target: '_blank',
      },
    }),
    Image.configure({
      HTMLAttributes: {
        class: 'tiptap-image',
      },
    }),
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    Highlight.configure({ multicolor: false }),
    Placeholder.configure({
      placeholder: props.placeholder,
    }),
  ],
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  },
  editorProps: {
    attributes: {
      class: 'tiptap-editor-content',
    },
  },
})

// Sync external model changes (e.g. reset)
watch(
  () => props.modelValue,
  (val) => {
    if (editor.value && editor.value.getHTML() !== val) {
      editor.value.commands.setContent(val, { emitUpdate: false })
    }
  },
)

onBeforeUnmount(() => {
  editor.value?.destroy()
})

const setLink = () => {
  const previousUrl = editor.value?.getAttributes('link').href ?? ''
  const url = window.prompt('URL tautan:', previousUrl)
  if (url === null) return
  if (url === '') {
    editor.value?.chain().focus().extendMarkRange('link').unsetLink().run()
    return
  }
  editor.value?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
}

const addImage = () => {
  const url = window.prompt('URL gambar:')
  if (url) {
    editor.value?.chain().focus().setImage({ src: url }).run()
  }
}
</script>

<template>
  <div class="tiptap-wrapper">
    <!-- Label -->
    <label
      v-if="label"
      class="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1.5 tracking-wider"
    >
      {{ label }} <span v-if="required" class="text-red-500">*</span>
    </label>

    <!-- Editor Shell -->
    <div class="tiptap-shell" :class="{ 'tiptap-shell--error': error }">
      <!-- Toolbar -->
      <div class="tiptap-toolbar" v-if="editor">
        <!-- Undo / Redo -->
        <div class="tiptap-toolbar-group">
          <button
            type="button"
            class="tiptap-btn"
            @click="editor.chain().focus().undo().run()"
            :disabled="!editor.can().undo()"
            title="Undo"
          >
            <Undo2 :size="15" />
          </button>
          <button
            type="button"
            class="tiptap-btn"
            @click="editor.chain().focus().redo().run()"
            :disabled="!editor.can().redo()"
            title="Redo"
          >
            <Redo2 :size="15" />
          </button>
        </div>

        <div class="tiptap-divider" />

        <!-- Headings -->
        <div class="tiptap-toolbar-group">
          <button
            type="button"
            class="tiptap-btn"
            :class="{ 'tiptap-btn--active': editor.isActive('heading', { level: 1 }) }"
            @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
            title="Heading 1"
          >
            <Heading1 :size="15" />
          </button>
          <button
            type="button"
            class="tiptap-btn"
            :class="{ 'tiptap-btn--active': editor.isActive('heading', { level: 2 }) }"
            @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
            title="Heading 2"
          >
            <Heading2 :size="15" />
          </button>
          <button
            type="button"
            class="tiptap-btn"
            :class="{ 'tiptap-btn--active': editor.isActive('heading', { level: 3 }) }"
            @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
            title="Heading 3"
          >
            <Heading3 :size="15" />
          </button>
        </div>

        <div class="tiptap-divider" />

        <!-- Text formatting -->
        <div class="tiptap-toolbar-group">
          <button
            type="button"
            class="tiptap-btn"
            :class="{ 'tiptap-btn--active': editor.isActive('bold') }"
            @click="editor.chain().focus().toggleBold().run()"
            title="Bold"
          >
            <Bold :size="15" />
          </button>
          <button
            type="button"
            class="tiptap-btn"
            :class="{ 'tiptap-btn--active': editor.isActive('italic') }"
            @click="editor.chain().focus().toggleItalic().run()"
            title="Italic"
          >
            <Italic :size="15" />
          </button>
          <button
            type="button"
            class="tiptap-btn"
            :class="{ 'tiptap-btn--active': editor.isActive('underline') }"
            @click="editor.chain().focus().toggleUnderline().run()"
            title="Underline"
          >
            <UnderlineIcon :size="15" />
          </button>
          <button
            type="button"
            class="tiptap-btn"
            :class="{ 'tiptap-btn--active': editor.isActive('strike') }"
            @click="editor.chain().focus().toggleStrike().run()"
            title="Strikethrough"
          >
            <Strikethrough :size="15" />
          </button>
          <button
            type="button"
            class="tiptap-btn"
            :class="{ 'tiptap-btn--active': editor.isActive('highlight') }"
            @click="editor.chain().focus().toggleHighlight().run()"
            title="Highlight"
          >
            <Highlighter :size="15" />
          </button>
        </div>

        <div class="tiptap-divider" />

        <!-- Alignment -->
        <div class="tiptap-toolbar-group">
          <button
            type="button"
            class="tiptap-btn"
            :class="{ 'tiptap-btn--active': editor.isActive({ textAlign: 'left' }) }"
            @click="editor.chain().focus().setTextAlign('left').run()"
            title="Align Left"
          >
            <AlignLeft :size="15" />
          </button>
          <button
            type="button"
            class="tiptap-btn"
            :class="{ 'tiptap-btn--active': editor.isActive({ textAlign: 'center' }) }"
            @click="editor.chain().focus().setTextAlign('center').run()"
            title="Align Center"
          >
            <AlignCenter :size="15" />
          </button>
          <button
            type="button"
            class="tiptap-btn"
            :class="{ 'tiptap-btn--active': editor.isActive({ textAlign: 'right' }) }"
            @click="editor.chain().focus().setTextAlign('right').run()"
            title="Align Right"
          >
            <AlignRight :size="15" />
          </button>
          <button
            type="button"
            class="tiptap-btn"
            :class="{ 'tiptap-btn--active': editor.isActive({ textAlign: 'justify' }) }"
            @click="editor.chain().focus().setTextAlign('justify').run()"
            title="Justify"
          >
            <AlignJustify :size="15" />
          </button>
        </div>

        <div class="tiptap-divider" />

        <!-- Lists & blocks -->
        <div class="tiptap-toolbar-group">
          <button
            type="button"
            class="tiptap-btn"
            :class="{ 'tiptap-btn--active': editor.isActive('bulletList') }"
            @click="editor.chain().focus().toggleBulletList().run()"
            title="Bullet List"
          >
            <List :size="15" />
          </button>
          <button
            type="button"
            class="tiptap-btn"
            :class="{ 'tiptap-btn--active': editor.isActive('orderedList') }"
            @click="editor.chain().focus().toggleOrderedList().run()"
            title="Ordered List"
          >
            <ListOrdered :size="15" />
          </button>
          <button
            type="button"
            class="tiptap-btn"
            :class="{ 'tiptap-btn--active': editor.isActive('blockquote') }"
            @click="editor.chain().focus().toggleBlockquote().run()"
            title="Blockquote"
          >
            <Quote :size="15" />
          </button>
          <button
            type="button"
            class="tiptap-btn"
            @click="editor.chain().focus().setHorizontalRule().run()"
            title="Horizontal Rule"
          >
            <Minus :size="15" />
          </button>
        </div>

        <div class="tiptap-divider" />

        <!-- Link & Image -->
        <div class="tiptap-toolbar-group">
          <button
            type="button"
            class="tiptap-btn"
            :class="{ 'tiptap-btn--active': editor.isActive('link') }"
            @click="setLink"
            title="Tautan"
          >
            <LinkIcon :size="15" />
          </button>
          <button type="button" class="tiptap-btn" @click="addImage" title="Gambar">
            <ImageIcon :size="15" />
          </button>
        </div>
      </div>

      <!-- Editor Content Area -->
      <EditorContent :editor="editor" class="tiptap-content-wrapper" />
    </div>

    <!-- Error message -->
    <p v-if="error" class="mt-1 text-xs text-red-600">{{ error }}</p>
  </div>
</template>

<style scoped>
/* ─── Shell ──────────────────────────────────────────────────────────────── */
.tiptap-shell {
  border: 1px solid rgb(209 213 219);
  border-radius: 0.75rem;
  overflow: hidden;
  transition:
    box-shadow 0.2s,
    border-color 0.2s;
  background: white;
}

:global(.dark) .tiptap-shell {
  border-color: rgb(55 65 81);
  background: #121212;
}

.tiptap-shell:focus-within {
  box-shadow: 0 0 0 2px #0e733b55;
  border-color: #0e733b;
}

.tiptap-shell--error {
  border-color: rgb(252 165 165) !important;
}
.tiptap-shell--error:focus-within {
  box-shadow: 0 0 0 2px rgb(239 68 68 / 0.25) !important;
}

/* ─── Toolbar ────────────────────────────────────────────────────────────── */
.tiptap-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 2px;
  padding: 6px 8px;
  border-bottom: 1px solid rgb(229 231 235);
  background: rgb(249 250 251);
}

:global(.dark) .tiptap-toolbar {
  background: #1a1a1a;
  border-color: rgb(55 65 81);
}

.tiptap-toolbar-group {
  display: flex;
  align-items: center;
  gap: 1px;
}

.tiptap-divider {
  width: 1px;
  height: 20px;
  background: rgb(209 213 219);
  margin: 0 4px;
  flex-shrink: 0;
}

:global(.dark) .tiptap-divider {
  background: rgb(55 65 81);
}

/* ─── Toolbar buttons ────────────────────────────────────────────────────── */
.tiptap-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: rgb(75 85 99);
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s;
  flex-shrink: 0;
}

:global(.dark) .tiptap-btn {
  color: rgb(156 163 175);
}

.tiptap-btn:hover:not(:disabled) {
  background: rgb(229 231 235);
  color: rgb(17 24 39);
}

:global(.dark) .tiptap-btn:hover:not(:disabled) {
  background: rgb(55 65 81);
  color: rgb(243 244 246);
}

.tiptap-btn--active {
  background: #0b5c2f22;
  color: #0b5c2f;
}

:global(.dark) .tiptap-btn--active {
  background: #0e733b33;
  color: #0eb95b;
}

.tiptap-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* ─── Content area ───────────────────────────────────────────────────────── */
.tiptap-content-wrapper {
  min-height: 280px;
}

:deep(.tiptap-editor-content) {
  outline: none;
  min-height: 280px;
  padding: 16px;
  font-size: 0.875rem;
  line-height: 1.7;
  color: rgb(17 24 39);
}

:global(.dark) :deep(.tiptap-editor-content) {
  color: rgb(229 231 235);
}

/* ─── Placeholder ────────────────────────────────────────────────────────── */
:deep(.tiptap-editor-content p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  color: rgb(156 163 175);
  pointer-events: none;
  float: left;
  height: 0;
}

/* ─── Typography inside editor ───────────────────────────────────────────── */
:deep(.tiptap-editor-content h1) {
  font-size: 1.5rem;
  font-weight: 700;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  color: rgb(17 24 39);
}
:global(.dark) :deep(.tiptap-editor-content h1) {
  color: rgb(243 244 246);
}

:deep(.tiptap-editor-content h2) {
  font-size: 1.25rem;
  font-weight: 700;
  margin-top: 0.875rem;
  margin-bottom: 0.4rem;
  color: rgb(17 24 39);
}
:global(.dark) :deep(.tiptap-editor-content h2) {
  color: rgb(243 244 246);
}

:deep(.tiptap-editor-content h3) {
  font-size: 1.1rem;
  font-weight: 600;
  margin-top: 0.75rem;
  margin-bottom: 0.35rem;
  color: rgb(17 24 39);
}
:global(.dark) :deep(.tiptap-editor-content h3) {
  color: rgb(243 244 246);
}

:deep(.tiptap-editor-content p) {
  margin-bottom: 0.75rem;
}

:deep(.tiptap-editor-content ul) {
  list-style-type: disc;
  padding-left: 1.5rem;
  margin-bottom: 0.75rem;
}

:deep(.tiptap-editor-content ol) {
  list-style-type: decimal;
  padding-left: 1.5rem;
  margin-bottom: 0.75rem;
}

:deep(.tiptap-editor-content li) {
  margin-bottom: 0.25rem;
}

:deep(.tiptap-editor-content blockquote) {
  border-left: 4px solid #0e733b;
  padding-left: 1rem;
  margin: 1rem 0;
  color: rgb(107 114 128);
  font-style: italic;
}

:deep(.tiptap-editor-content hr) {
  border: none;
  border-top: 2px solid rgb(229 231 235);
  margin: 1rem 0;
}
:global(.dark) :deep(.tiptap-editor-content hr) {
  border-color: rgb(55 65 81);
}

:deep(.tiptap-editor-content code) {
  background: rgb(243 244 246);
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-family: monospace;
}
:global(.dark) :deep(.tiptap-editor-content code) {
  background: rgb(31 41 55);
}

:deep(.tiptap-editor-content pre) {
  background: rgb(17 24 39);
  color: rgb(229 231 235);
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin-bottom: 0.75rem;
}
:deep(.tiptap-editor-content pre code) {
  background: none;
  padding: 0;
  font-size: 0.8rem;
}

:deep(.tiptap-link) {
  color: #0e733b;
  text-decoration: underline;
  cursor: pointer;
}
:deep(.tiptap-link:hover) {
  color: #0b5c2f;
}

:deep(.tiptap-image) {
  max-width: 100%;
  border-radius: 0.5rem;
  margin: 0.75rem 0;
}

:deep(mark) {
  background-color: #fef08a;
  border-radius: 3px;
  padding: 0 2px;
}
:global(.dark) :deep(mark) {
  background-color: #713f12;
  color: #fef08a;
}
</style>
