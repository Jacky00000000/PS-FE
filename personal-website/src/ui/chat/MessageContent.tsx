import { Fragment, type ReactNode } from 'react'
import styles from './MessageContent.module.css'

interface MessageContentProps {
  content: string
}

type Block =
  | { type: 'paragraph'; lines: string[] }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }

function parseBlocks(text: string): Block[] {
  const lines = text.split('\n')
  const blocks: Block[] = []
  let paragraphLines: string[] = []
  let listItems: string[] = []
  let listType: 'ul' | 'ol' | null = null

  const flushParagraph = () => {
    if (paragraphLines.length > 0) {
      blocks.push({ type: 'paragraph', lines: paragraphLines })
      paragraphLines = []
    }
  }

  const flushList = () => {
    if (listType && listItems.length > 0) {
      blocks.push({ type: listType, items: listItems })
      listItems = []
      listType = null
    }
  }

  for (const line of lines) {
    const trimmed = line.trim()
    const ulMatch = trimmed.match(/^[-*•]\s+(.+)/)
    const olMatch = trimmed.match(/^\d+\.\s+(.+)/)

    if (ulMatch) {
      flushParagraph()
      if (listType !== 'ul') {
        flushList()
        listType = 'ul'
      }
      listItems.push(ulMatch[1])
      continue
    }

    if (olMatch) {
      flushParagraph()
      if (listType !== 'ol') {
        flushList()
        listType = 'ol'
      }
      listItems.push(olMatch[1])
      continue
    }

    flushList()

    if (trimmed === '') {
      flushParagraph()
    } else {
      paragraphLines.push(line)
    }
  }

  flushList()
  flushParagraph()

  return blocks
}

function parseInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = []
  const pattern = /(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*)/g
  let lastIndex = 0
  let match: RegExpExecArray | null
  let index = 0

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index))
    }

    if (match[2]) {
      nodes.push(
        <strong key={`${keyPrefix}-b${index}`}>
          <em>{match[2]}</em>
        </strong>,
      )
    } else if (match[3]) {
      nodes.push(<strong key={`${keyPrefix}-b${index}`}>{match[3]}</strong>)
    } else if (match[4]) {
      nodes.push(<em key={`${keyPrefix}-i${index}`}>{match[4]}</em>)
    }

    lastIndex = match.index + match[0].length
    index += 1
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex))
  }

  return nodes.length > 0 ? nodes : [text]
}

function renderParagraph(lines: string[], key: string) {
  return (
    <p key={key} className={styles.paragraph}>
      {lines.map((line, lineIndex) => (
        <Fragment key={`${key}-line-${lineIndex}`}>
          {lineIndex > 0 && <br />}
          {parseInline(line, `${key}-line-${lineIndex}`)}
        </Fragment>
      ))}
    </p>
  )
}

export function MessageContent({ content }: MessageContentProps) {
  const blocks = parseBlocks(content)

  if (blocks.length === 0) {
    return null
  }

  return (
    <div className={styles.content}>
      {blocks.map((block, index) => {
        if (block.type === 'paragraph') {
          return renderParagraph(block.lines, `p-${index}`)
        }

        if (block.type === 'ul') {
          return (
            <ul key={`ul-${index}`} className={styles.list}>
              {block.items.map((item, itemIndex) => (
                <li key={`ul-${index}-${itemIndex}`}>
                  {parseInline(item, `ul-${index}-${itemIndex}`)}
                </li>
              ))}
            </ul>
          )
        }

        return (
          <ol key={`ol-${index}`} className={styles.list}>
            {block.items.map((item, itemIndex) => (
              <li key={`ol-${index}-${itemIndex}`}>
                {parseInline(item, `ol-${index}-${itemIndex}`)}
              </li>
            ))}
          </ol>
        )
      })}
    </div>
  )
}
