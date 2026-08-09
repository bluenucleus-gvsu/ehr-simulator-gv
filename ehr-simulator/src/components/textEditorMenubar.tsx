'use client'
import type { Editor } from '@tiptap/react'
import { useEditorState } from '@tiptap/react'
import { Bold, Circle, Heading1, Heading2, Heading3, Highlighter, Italic, List, ListOrdered, Redo2, SeparatorHorizontal, Strikethrough, UnderlineIcon, Undo2 } from 'lucide-react'
import { Button } from './ui/button'
import { Separator } from './ui/separator'


export default function TextEditorMenuBar({ editor }: { editor: Editor }) {
  const editorState = useEditorState({
    editor,
    selector: ctx => {
      return {
        isBold: ctx.editor.isActive('bold') ?? false,
        canBold: ctx.editor.can().chain().toggleBold().run() ?? false,
        isItalic: ctx.editor.isActive('italic') ?? false,
        canItalic: ctx.editor.can().chain().toggleItalic().run() ?? false,
        isStrike: ctx.editor.isActive('strike') ?? false,
        canStrike: ctx.editor.can().chain().toggleStrike().run() ?? false,
        isParagraph: ctx.editor.isActive('paragraph') ?? false,
        isHeading1: ctx.editor.isActive('heading', { level: 1 }) ?? false,
        isHeading2: ctx.editor.isActive('heading', { level: 2 }) ?? false,
        isHeading3: ctx.editor.isActive('heading', { level: 3 }) ?? false,
        isBulletList: ctx.editor.isActive('bulletList') ?? false,
        isOrderedList: ctx.editor.isActive('orderedList') ?? false,
        canUndo: ctx.editor.can().chain().undo().run() ?? false,
        canRedo: ctx.editor.can().chain().redo().run() ?? false,
      }
    },
  })

  return (
    <div className="border bg-slate-50 p-1.5 rounded-lg flex flex-wrap gap-2  min-h-full">
      <div className='flex gap-1'>
        <Button
          size="icon-sm"
          variant='secondary'
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editorState.canBold}
          className={`${editorState.isBold ? 'bg-slate-300 hover:bg-slate-300' : 'bg-transparent hover:bg-slate-200'}`}
        >
          <Bold className='size-4' />
        </Button>
        <Button
          size="icon-sm"
          variant='secondary'
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editorState.canItalic}
          className={editorState.isItalic ? 'bg-slate-300 hover:bg-slate-300' : 'bg-transparent hover:bg-slate-200'}
        >
          <Italic className='size-4' />
        </Button>
        <Button
          size="icon-sm"
          variant='secondary'
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          disabled={!editorState.canItalic}
          className={editorState.isItalic ? 'bg-slate-300 hover:bg-slate-300' : 'bg-transparent hover:bg-slate-200'}
        >
          <UnderlineIcon className='size-4' />
        </Button>
        <Button
          size="icon-sm"
          variant='secondary'
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editorState.canStrike}
          className={editorState.isStrike ? 'bg-slate-300 hover:bg-slate-300' : 'bg-transparent hover:bg-slate-200'}
        >
          <Strikethrough className='size-4' />
        </Button>
      </div>
      <div className='h-8'>
        <Separator orientation='vertical' />
      </div>
      <div className="flex gap-1">
        <Button
          variant='secondary'
          size='icon-sm'
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editorState.isHeading1 ? 'bg-slate-300 hover:bg-slate-300' : 'bg-transparent hover:bg-slate-200'}
        >
          <Heading1 className='size-4' />
        </Button>
        <Button
          variant='secondary'
          size='icon-sm'
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editorState.isHeading2 ? 'bg-slate-300 hover:bg-slate-300' : 'bg-transparent hover:bg-slate-200'}
        >
          <Heading2 className='size-4' />
        </Button>
        <Button
          variant='secondary'
          size='icon-sm'
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editorState.isHeading3 ? 'bg-slate-300 hover:bg-slate-300' : 'bg-transparent hover:bg-slate-200'}
        >
          <Heading3 className='size-4' />

        </Button>
      </div>

      <div className='h-8'>
        <Separator orientation='vertical' />
      </div>

      <div className='flex gap-1'>
        <Button
          variant='secondary'
          size='icon-sm'
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editorState.isBulletList ? 'bg-slate-300 hover:bg-slate-300' : 'bg-transparent hover:bg-slate-200'}
        >
          <List className="size-4" />
        </Button>
        <Button
          variant='secondary'
          size='icon-sm'
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editorState.isOrderedList ? 'bg-slate-300 hover:bg-slate-300' : 'bg-transparent hover:bg-slate-200'}
        >
          <ListOrdered className='size-4' />
        </Button>
      </div>

      <div className='h-8'>
        <Separator orientation='vertical' />
      </div>

      <Button
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        variant='secondary'
        size='icon-sm'
        className='bg-transparent hover:bg-slate-200'
      >
        <SeparatorHorizontal />
      </Button>
      {/* <Button onClick={() => editor.chain().focus().setHardBreak().run()}>Hard break</Button> */}
      <Button
        variant='secondary'
        size='icon-sm'
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        className='bg-transparent hover:bg-slate-200'
      >
        <Highlighter className="size-4" />
      </Button>
      <button
        onClick={() => editor.chain().focus().toggleHighlight({ color: '#ffc078' }).run()}
        className='bg-transparent'
      >
        <Circle className='fill-orange-300 stroke-slate-700 stroke-[1.5] transition-all duration-300 ease-in-out hover:scale-115' />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHighlight({ color: '#74c0fc' }).run()}
        className='bg-transparent'
      >
        <Circle className='fill-blue-300 stroke-slate-700 stroke-[1.5] transition-all duration-300 ease-in-out hover:scale-115' />
      </button>
      <div className='h-8'>
        <Separator orientation='vertical' />
      </div>
      <Button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editorState.canUndo}
        variant='secondary'
        size='icon-sm'
        className='hover:bg-slate-200 bg-transparent'
      >
        <Undo2 className='size-4' />
      </Button>
      <Button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editorState.canRedo}
        variant='secondary'
        size='icon-sm'
        className='hover:bg-slate-200 bg-transparent'
      >
        <Redo2 className='size-4' />
      </Button>
    </div>
  )
}
