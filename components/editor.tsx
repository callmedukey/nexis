"use client";

import { Extension } from "@tiptap/core";
import Link from "@tiptap/extension-link";
import TextStyle from "@tiptap/extension-text-style";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, Strikethrough, Link as LinkIcon } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    fontSize: {
      /**
       * Set the font size
       */
      setFontSize: (size: string) => ReturnType;
      /**
       * Unset the font size
       */
      unsetFontSize: () => ReturnType;
    };
  }
}

interface FontSizeOptions {
  types: string[];
}

const fontSizes = [
  "12px",
  "14px",
  "16px",
  "18px",
  "20px",
  "24px",
  "30px",
  "36px",
  "48px",
  "60px",
  "72px",
];

const FontSizeExtension = Extension.create<FontSizeOptions>({
  name: "fontSize",

  addOptions() {
    return {
      types: ["textStyle"],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) =>
              element.style.fontSize?.replace("px", "") + "px" || null,
            renderHTML: (attributes) => {
              if (!attributes.fontSize) {
                return {};
              }
              return {
                style: `font-size: ${attributes.fontSize}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setFontSize:
        (fontSize: string) =>
        ({ commands }) => {
          return commands.setMark("textStyle", { fontSize });
        },
      unsetFontSize:
        () =>
        ({ commands }) => {
          return commands.setMark("textStyle", { fontSize: null });
        },
    };
  },
});

export function Editor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
        horizontalRule: false,
        blockquote: false,
        code: false,
        codeBlock: false,
      }),
      TextStyle,
      FontSizeExtension,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline hover:text-primary/80",
          rel: "noopener noreferrer",
          target: "_blank",
        },
        protocols: ["http", "https", "mailto", "tel"],
        validate: (href) =>
          /^https?:\/\//.test(href) ||
          href.startsWith("mailto:") ||
          href.startsWith("tel:"),
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: "w-full focus:outline-none min-h-[500px] p-4",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  const setLink = () => {
    if (!editor) return;

    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL을 입력하세요:", previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    // Add https:// if no protocol is specified
    const validUrl = url.match(/^https?:\/\//) ? url : `https://${url}`;

    // update link
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: validUrl })
      .run();
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 rounded-t-lg border border-b-0 bg-white p-2">
        <Toggle
          size="sm"
          pressed={editor.isActive("bold")}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="size-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("italic")}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="size-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("strike")}
          onPressedChange={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="size-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("link")}
          onPressedChange={setLink}
        >
          <LinkIcon className="size-4" />
        </Toggle>
        <Select
          value={editor.getAttributes("textStyle").fontSize || "16px"}
          onValueChange={(value) => {
            editor.chain().focus().setFontSize(value).run();
          }}
        >
          <SelectTrigger className="w-24">
            <SelectValue placeholder="Font size" />
          </SelectTrigger>
          <SelectContent>
            {fontSizes.map((size) => (
              <SelectItem key={size} value={size}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-b-lg border">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
