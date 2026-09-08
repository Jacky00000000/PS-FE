import { Fragment, type ReactNode } from 'react'
import styles from './MessageContent.module.css'

interface MessageContentProps {
  content: string
}

type Block =
  | { type: 'paragraph'; lines: string[] }
  | { type: 'heading'; level: 2 | 3; text: string }
  | { type: 'hr' }
  | { type: 'sources'; items: SourceItem[] }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'code'; language: string; code: string }

interface SourceItem {
  id: string
  title: string
  url: string
}

type SourceLinks = Record<string, string>

const FENCE_OPEN = /^```(\w*)\s*$/
const FENCE_CLOSE = /^```\s*$/

function splitByCodeFences(text: string): Block[] {
  const lines = text.split('\n')
  const blocks: Block[] = []
  let textLines: string[] = []
  let index = 0

  const flushText = () => {
    if (textLines.length > 0) {
      blocks.push(...parseBlocks(textLines.join('\n')))
      textLines = []
    }
  }

  while (index < lines.length) {
    const line = lines[index]
    const openMatch = line.trim().match(FENCE_OPEN)

    if (openMatch) {
      flushText()
      const language = openMatch[1]
      index += 1
      const codeLines: string[] = []

      while (index < lines.length && !FENCE_CLOSE.test(lines[index].trim())) {
        codeLines.push(lines[index])
        index += 1
      }

      if (index < lines.length) {
        index += 1
      }

      blocks.push({ type: 'code', language, code: codeLines.join('\n') })
      continue
    }

    textLines.push(line)
    index += 1
  }

  flushText()
  return blocks
}

function parseBlocks(text: string): Block[] {
  const lines = text.split('\n')
  const blocks: Block[] = []
  let paragraphLines: string[] = []
  let listItems: string[] = []
  let listType: 'ul' | 'ol' | null = null
  let sourceItems: SourceItem[] = []

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

  const flushSources = () => {
    if (sourceItems.length > 0) {
      blocks.push({ type: 'sources', items: sourceItems })
      sourceItems = []
    }
  }

  for (const line of lines) {
    const trimmed = line.trim()
    const headingMatch = trimmed.match(/^(#{2,3})\s+(.+?)\s*#*$/)
    const sourceMatch = trimmed.match(
      /^[-*]\s+\[([^\]]+)\]\s+(.+?)\s+[—-]\s+(https?:\/\/\S+)$/,
    )
    const ulMatch = trimmed.match(/^[-*•]\s+(.+)/)
    const olMatch = trimmed.match(/^\d+\.\s+(.+)/)

    if (headingMatch) {
      flushParagraph()
      flushList()
      flushSources()
      blocks.push({
        type: 'heading',
        level: headingMatch[1].length as 2 | 3,
        text: headingMatch[2],
      })
      continue
    }

    if (/^(?:---+|\*\*\*+|___+)$/.test(trimmed)) {
      flushParagraph()
      flushList()
      flushSources()
      blocks.push({ type: 'hr' })
      continue
    }

    if (sourceMatch) {
      flushParagraph()
      flushList()
      sourceItems.push({
        id: sourceMatch[1],
        title: sourceMatch[2],
        url: sourceMatch[3],
      })
      continue
    }

    if (ulMatch) {
      flushParagraph()
      flushSources()
      if (listType !== 'ul') {
        flushList()
        listType = 'ul'
      }
      listItems.push(ulMatch[1])
      continue
    }

    if (olMatch) {
      flushParagraph()
      flushSources()
      if (listType !== 'ol') {
        flushList()
        listType = 'ol'
      }
      listItems.push(olMatch[1])
      continue
    }

    flushList()
    flushSources()

    if (trimmed === '') {
      flushParagraph()
    } else {
      paragraphLines.push(line)
    }
  }

  flushList()
  flushSources()
  flushParagraph()

  return blocks
}

function parseInline(
  text: string,
  keyPrefix: string,
  sourceLinks: SourceLinks = {},
): ReactNode[] {
  const nodes: ReactNode[] = []
  const pattern =
    /(\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|\[([^\]]+)\]|\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*|`([^`]+)`)/g
  let lastIndex = 0
  let match: RegExpExecArray | null
  let index = 0

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index))
    }

    if (match[2] && match[3]) {
      nodes.push(
        <a
          key={`${keyPrefix}-l${index}`}
          href={match[3]}
          target="_blank"
          rel="noreferrer"
        >
          {match[2]}
        </a>,
      )
    } else if (
      match[4] &&
      match[4]
        .split(',')
        .map((sourceId) => sourceId.trim())
        .every((sourceId) => sourceLinks[sourceId])
    ) {
      const sourceIds = match[4].split(',').map((sourceId) => sourceId.trim())
      nodes.push(
        <Fragment key={`${keyPrefix}-s${index}`}>
          {sourceIds.map((sourceId) => (
            <a
              key={sourceId}
              href={sourceLinks[sourceId]}
              target="_blank"
              rel="noreferrer"
            >
              [{sourceId}]
            </a>
          ))}
        </Fragment>,
      )
    } else if (match[4]) {
      nodes.push(match[0])
    } else if (match[5]) {
      nodes.push(
        <strong key={`${keyPrefix}-b${index}`}>
          <em>{match[5]}</em>
        </strong>,
      )
    } else if (match[6]) {
      nodes.push(<strong key={`${keyPrefix}-b${index}`}>{match[6]}</strong>)
    } else if (match[7]) {
      nodes.push(<em key={`${keyPrefix}-i${index}`}>{match[7]}</em>)
    } else if (match[8]) {
      nodes.push(
        <code key={`${keyPrefix}-c${index}`} className={styles.inlineCode}>
          {match[8]}
        </code>,
      )
    }

    lastIndex = match.index + match[0].length
    index += 1
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex))
  }

  return nodes.length > 0 ? nodes : [text]
}

function renderParagraph(lines: string[], key: string, sourceLinks: SourceLinks) {
  return (
    <p key={key} className={styles.paragraph}>
      {lines.map((line, lineIndex) => (
        <Fragment key={`${key}-line-${lineIndex}`}>
          {lineIndex > 0 && <br />}
          {parseInline(line, `${key}-line-${lineIndex}`, sourceLinks)}
        </Fragment>
      ))}
    </p>
  )
}

function renderHeading(level: 2 | 3, text: string, key: string, sourceLinks: SourceLinks) {
  const Heading = level === 2 ? 'h2' : 'h3'
  return (
    <Heading key={key} className={styles.heading}>
      {parseInline(text, key, sourceLinks)}
    </Heading>
  )
}

function renderSources(items: SourceItem[], key: string) {
  return (
    <div key={key} className={styles.sources}>
      {items.map((item) => (
        <div key={`${key}-${item.id}`}>
          <a href={item.url} target="_blank" rel="noreferrer">
            [{item.id}] {item.title}
          </a>
        </div>
      ))}
    </div>
  )
}

function renderCodeBlock(language: string, code: string, key: string) {
  return (
    <div key={key} className={styles.codeBlockWrapper}>
      {language && <span className={styles.codeLang}>{language}</span>}
      <pre
        className={`${styles.codeBlock}${language ? ` ${styles.codeBlockWithLang}` : ''}`}
      >
        <code>{code}</code>
      </pre>
    </div>
  )
}

export function MessageContent({ content }: MessageContentProps) {
  const blocks = splitByCodeFences(content)
  const sourceLinks = Object.fromEntries(
    [...content.matchAll(/^[-*]\s+\[([^\]]+)\]\s+.+?\s+[—-]\s+(https?:\/\/\S+)\s*$/gm)].map(
      (match) => [match[1], match[2]],
    ),
  )

  if (blocks.length === 0) {
    return null
  }

  return (
    <div className={styles.content}>
      {blocks.map((block, index) => {
        if (block.type === 'code') {
          return renderCodeBlock(block.language, block.code, `code-${index}`)
        }

        if (block.type === 'paragraph') {
          return renderParagraph(block.lines, `p-${index}`, sourceLinks)
        }

        if (block.type === 'heading') {
          return renderHeading(block.level, block.text, `heading-${index}`, sourceLinks)
        }

        if (block.type === 'hr') {
          return <hr key={`hr-${index}`} className={styles.rule} />
        }

        if (block.type === 'sources') {
          return renderSources(block.items, `sources-${index}`)
        }

        if (block.type === 'ul') {
          return (
            <ul key={`ul-${index}`} className={styles.list}>
              {block.items.map((item, itemIndex) => (
                <li key={`ul-${index}-${itemIndex}`}>
                  {parseInline(item, `ul-${index}-${itemIndex}`, sourceLinks)}
                </li>
              ))}
            </ul>
          )
        }

        return (
          <ol key={`ol-${index}`} className={styles.list}>
            {block.items.map((item, itemIndex) => (
              <li key={`ol-${index}-${itemIndex}`}>
                {parseInline(item, `ol-${index}-${itemIndex}`, sourceLinks)}
              </li>
            ))}
          </ol>
        )
      })}
    </div>
  )
}
