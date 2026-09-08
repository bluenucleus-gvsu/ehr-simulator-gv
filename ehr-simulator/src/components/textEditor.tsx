// import './styles.scss'
'use client'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect } from 'react'
import Underline from '@tiptap/extension-underline'
import Highlight from "@tiptap/extension-highlight";
import TextEditorMenuBar from './textEditorMenubar'


interface TextEditorProps {
  content: string;
  onChange: (content: string) => void
}

const TextEditor = ({ content, onChange }: TextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: 'list-disc ml-6'
          }
        },
        orderedList: {
          HTMLAttributes: {
            class: 'list-decimal ml-10'
          }
        }
      }),
      Underline,
      Highlight.configure(
        {
          multicolor: true,
          HTMLAttributes: {
            class: 'py-0.5'
          }
        }
      )
    ],
    editorProps: {
      attributes: {
        class: "min-h-[156px] border rounded-md py-2 px-3 mt-2",
      }
    },
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    content: content,
  })

  useEffect(() => {
    if (!editor) return

    if (editor.getHTML() !== content) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  if (!editor) {
    return null
  }

  return (
    <div>
      <TextEditorMenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}

export default TextEditor;
