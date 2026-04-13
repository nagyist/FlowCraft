import { toPng, toSvg } from 'html-to-image'

function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  downloadDataUrl(url, filename)
  URL.revokeObjectURL(url)
}

export async function exportAsPng(
  element: HTMLElement,
  filename: string = 'diagram.png',
) {
  const dataUrl = await toPng(element, {
    pixelRatio: 3,
    backgroundColor: '#ffffff',
  })
  downloadDataUrl(dataUrl, filename)
}

export async function exportAsSvg(
  element: HTMLElement,
  filename: string = 'diagram.svg',
) {
  const dataUrl = await toSvg(element, {
    backgroundColor: '#ffffff',
  })
  // Convert data URL to SVG text and download
  const svgText = decodeURIComponent(dataUrl.split(',')[1])
  const blob = new Blob([svgText], { type: 'image/svg+xml' })
  downloadBlob(blob, filename)
}

export async function exportAsPdf(
  element: HTMLElement,
  filename: string = 'diagram.pdf',
) {
  const { default: jsPDF } = await import('jspdf')

  const dataUrl = await toPng(element, {
    pixelRatio: 2,
    backgroundColor: '#ffffff',
  })

  const pdf = new jsPDF('landscape', 'mm', 'a4')
  const imgProps = pdf.getImageProperties(dataUrl)
  const pdfWidth = pdf.internal.pageSize.getWidth()
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
  pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight)
  pdf.save(filename)
}
