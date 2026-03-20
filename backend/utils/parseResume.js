const pdfParse = require('pdf-parse')
const mammoth = require('mammoth')

function getExt(filename = '') {
  const i = filename.lastIndexOf('.')
  return i >= 0 ? filename.slice(i + 1).toLowerCase() : ''
}

async function extractTextFromBuffer({ buffer, filename, mimetype }) {
  const ext = getExt(filename)
  const type = (mimetype || '').toLowerCase()

  // Simple heuristic for file type detection.
  const isPdf = ext === 'pdf' || type.includes('pdf')
  const isDocx =
    ext === 'docx' || type.includes('officedocument') || type.includes('msword')

  if (isPdf) {
    const parsed = await pdfParse(buffer)
    return parsed.text || ''
  }

  if (isDocx) {
    const parsed = await mammoth.extractRawText({ buffer })
    return parsed.value || ''
  }

  // Last-resort: try interpreting as plain text.
  return buffer.toString('utf8')
}

module.exports = {
  extractTextFromBuffer,
}

