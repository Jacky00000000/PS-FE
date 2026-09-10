import { Fragment, type ReactNode } from 'react'
import type { ChatSource } from '../../lib/api/types'
import styles from './MessageContent.module.css'

interface MessageContentProps {
  content: string
  sources?: ChatSource[]
}

type Block =
  | { type: 'paragraph'; lines: string[] }
  | { type: 'heading'; level: 2 | 3; text: string }
  | { type: 'hr' }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'code'; language: string; code: string }

type SourceLinks = Record<string, string>

function splitTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\||\|$/g, '')
    .split('|')
    .map((cell) => cell.trim())
}

function isTableSeparator(line: string): boolean {
  const cells = splitTableRow(line)
  return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell))
}

function trimUrlPunctuation(url: string): string {
  return url.replace(/[.,!?;:，。！？；：]+$/g, '')
}

function isHttpUrl(value: string): boolean {
  return /^https?:\/\/\S+$/i.test(value)
}

const FENCE_OPEN = /^```([^\s]*)\s*$/
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

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const line = lines[lineIndex]
    const trimmed = line.trim()
    const headingMatch = trimmed.match(/^(#{2,3})\s+(.+?)\s*#*$/)
    const ulMatch = trimmed.match(/^[-*•]\s+(.+)/)
    const olMatch = trimmed.match(/^\d+\.\s+(.+)/)

    if (trimmed.includes('|') && lineIndex + 1 < lines.length) {
      const headers = splitTableRow(line)
      const separator = lines[lineIndex + 1]

      if (headers.length > 0 && isTableSeparator(separator)) {
        flushParagraph()
        flushList()
        lineIndex += 1
        const rows: string[][] = []

        while (lineIndex + 1 < lines.length) {
          const nextLine = lines[lineIndex + 1].trim()
          if (!nextLine.includes('|') || nextLine === '') {
            break
          }
          lineIndex += 1
          rows.push(splitTableRow(lines[lineIndex]))
        }

        blocks.push({ type: 'table', headers, rows })
        continue
      }
    }

    if (headingMatch) {
      flushParagraph()
      flushList()
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
      blocks.push({ type: 'hr' })
      continue
    }

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

function parseInline(
  text: string,
  keyPrefix: string,
  sourceLinks: SourceLinks = {},
): ReactNode[] {
  const nodes: ReactNode[] = []
  const pattern =
    /(\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|\[([^\]]+)\]|\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*|`([^`]+)`|(https?:\/\/[^\s<>"']+))/g
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
              className={`${styles.citation}${sourceId.length > 2 ? ` ${styles.citationLong}` : ''}`}
              href={sourceLinks[sourceId]}
              target="_blank"
              rel="noreferrer"
            >
              {sourceId}
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
      const codeValue = trimUrlPunctuation(match[8])
      const trailingText = match[8].slice(codeValue.length)

      if (isHttpUrl(codeValue)) {
        nodes.push(
          <Fragment key={`${keyPrefix}-c${index}`}>
            <a
              className={styles.autoLink}
              href={codeValue}
              target="_blank"
              rel="noreferrer"
            >
              {codeValue}
            </a>
            {trailingText}
          </Fragment>,
        )
      } else {
        nodes.push(
          <code key={`${keyPrefix}-c${index}`} className={styles.inlineCode}>
            {match[8]}
          </code>,
        )
      }
    } else if (match[9]) {
      const url = trimUrlPunctuation(match[9])
      const trailingText = match[9].slice(url.length)
      nodes.push(
        <Fragment key={`${keyPrefix}-u${index}`}>
          <a
            className={styles.autoLink}
            href={url}
            target="_blank"
            rel="noreferrer"
          >
            {url}
          </a>
          {trailingText}
        </Fragment>,
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

function renderSources(items: ChatSource[], key: string) {
  return (
    <section key={key} className={styles.sources}>
      <h3 className={styles.sourcesHeading}>Sources</h3>
      {items.map((item) => (
        <div key={`${key}-${item.id}`}>
          <a
            className={styles.sourceLink}
            href={item.url}
            target="_blank"
            rel="noreferrer"
          >
            [{item.id}] {item.title}
          </a>
        </div>
      ))}
    </section>
  )
}

function renderTable(
  headers: string[],
  rows: string[][],
  key: string,
  sourceLinks: SourceLinks,
) {
  return (
    <div key={key} className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th key={`${key}-header-${index}`} scope="col">
                {parseInline(header, `${key}-header-${index}`, sourceLinks)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={`${key}-row-${rowIndex}`}>
              {headers.map((_, cellIndex) => (
                <td key={`${key}-cell-${rowIndex}-${cellIndex}`}>
                  {parseInline(
                    row[cellIndex] ?? '',
                    `${key}-cell-${rowIndex}-${cellIndex}`,
                    sourceLinks,
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const codeTokenPattern =
  /(#[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b(?:def|if|else|elif|for|while|in|return|import|from|as|class|try|except|finally|with|and|or|not|True|False|None|const|let|function|throw|new)\b|\b(?:print|len|range|str|int|float|list|dict|map|filter|console|log)\b|\b\d+(?:\.\d+)?\b)/g

function highlightCode(code: string, key: string) {
  const nodes: ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  let index = 0

  while ((match = codeTokenPattern.exec(code)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(code.slice(lastIndex, match.index))
    }

    const token = match[0]
    let tokenClass: string

    if (token.startsWith('#')) {
      tokenClass = styles.codeComment
    } else if (token.startsWith('"') || token.startsWith("'")) {
      tokenClass = styles.codeString
    } else if (/^\d/.test(token)) {
      tokenClass = styles.codeNumber
    } else if (
      /^(?:print|len|range|str|int|float|list|dict|map|filter|console|log)$/.test(
        token,
      )
    ) {
      tokenClass = styles.codeBuiltin
    } else {
      tokenClass = styles.codeKeyword
    }

    nodes.push(
      <span key={`${key}-${index}`} className={tokenClass}>
        {token}
      </span>,
    )
    lastIndex = match.index + token.length
    index += 1
  }

  if (lastIndex < code.length) {
    nodes.push(code.slice(lastIndex))
  }

  return nodes
}

function renderCodeBlock(language: string, code: string, key: string) {
  return (
    <div key={key} className={styles.codeBlockWrapper}>
      {language && <span className={styles.codeLang}>{language}</span>}
      <pre
        className={`${styles.codeBlock}${language ? ` ${styles.codeBlockWithLang}` : ''}`}
      >
        <code>{highlightCode(code, key)}</code>
      </pre>
    </div>
  )
}

export function MessageContent({ content, sources = [] }: MessageContentProps) {
  const blocks = splitByCodeFences(content)
  const sourceLinks = Object.fromEntries(
    sources.map((source) => [source.id, source.url]),
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

        if (block.type === 'table') {
          return renderTable(
            block.headers,
            block.rows,
            `table-${index}`,
            sourceLinks,
          )
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
      {sources.length > 0 && renderSources(sources, 'api-sources')}
    </div>
  )
}
