import {
  AlertTriangle,
  Download,
  FileArchive,
  FileText,
  Image as ImageIcon,
  Layers,
  Loader2,
  Lock,
  Move,
  Pause,
  Play,
  RefreshCw,
  Scissors,
  Sparkles,
  Trash2,
  Unlock,
  Upload,
} from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

// Optimized coordinates based on previous analysis
const DEFAULT_CROP = {
  height: 54.5396,
  width: 22.5,
  x: 25.85,
  y: 24.7,
}

// Helper to load JSZip dynamically
const loadJSZip = () =>
  new Promise((resolve, reject) => {
    if (window.JSZip) {
      resolve(window.JSZip)
      return
    }
    const script = document.createElement('script')
    script.src =
      'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'
    script.onload = () => resolve(window.JSZip)
    script.onerror = reject
    document.head.appendChild(script)
  })

export default function App() {
  // API Key provided by the environment
  const apiKey = ''

  const [files, setFiles] = useState([])
  const [currentFileIndex, setCurrentFileIndex] = useState(null)
  const [imageSrc, setImageSrc] = useState(null)
  const [imgDimensions, setImgDimensions] = useState({ height: 0, width: 0 })

  // Store metadata (text) for each file using filename as key
  const [fileMetadata, setFileMetadata] = useState({})

  const [crop, setCrop] = useState(DEFAULT_CROP)
  const [lockAspectRatio, setLockAspectRatio] = useState(true)

  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [cropStart, setCropStart] = useState({ ...crop })
  const [activeHandle, setActiveHandle] = useState(null)

  const [isZipping, setIsZipping] = useState(false)

  // OCR Queue States
  const [isAutoProcessing, setIsAutoProcessing] = useState(true) // Default to auto-process
  const [processingFileName, setProcessingFileName] = useState(null)

  const containerRef = useRef(null)
  const fileInputRef = useRef(null)
  const canvasRef = useRef(null)
  const targetAspectRatio = useRef(DEFAULT_CROP.width / DEFAULT_CROP.height)

  // Load selected file into preview
  useEffect(() => {
    if (
      files.length > 0 &&
      currentFileIndex !== null &&
      files[currentFileIndex]
    ) {
      const file = files[currentFileIndex]
      const reader = new FileReader()
      reader.onload = (e) => {
        setImageSrc(e.target.result)
      }
      reader.readAsDataURL(file)
    } else {
      setImageSrc(null)
    }
  }, [currentFileIndex, files])

  // --- Paste Handler ---
  useEffect(() => {
    const handlePaste = (e) => {
      if (e.clipboardData && e.clipboardData.items) {
        const items = e.clipboardData.items
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            const blob = items[i].getAsFile()
            if (!blob) continue

            // Generate sequential filename: image00.png, image01.png...
            let newIndex = 0
            // Check existing numbering
            const existingIndices = files
              .map((f) => {
                const match = f.name.match(/^image(\d+)\.png$/)
                return match ? parseInt(match[1], 10) : null
              })
              .filter((n) => n !== null)

            if (existingIndices.length > 0) {
              newIndex = Math.max(...existingIndices) + 1
            }

            const fileName = `image${String(newIndex).padStart(2, '0')}.png`
            const newFile = new File([blob], fileName, { type: blob.type })

            // Add file logic
            setFiles((prev) => [...prev, newFile])

            setFileMetadata((prev) => ({
              ...prev,
              [fileName]: {
                description: '',
                isFailed: false,
                isScanned: false,
                isTruncated: false,
                title: '',
              },
            }))

            // Switch to the newly pasted file
            setCurrentFileIndex(files.length) // Current length becomes the index of the new item

            // Ensure auto processing is on
            setIsAutoProcessing(true)
          }
        }
      }
    }

    window.addEventListener('paste', handlePaste)
    return () => {
      window.removeEventListener('paste', handlePaste)
    }
  }, [files]) // Re-bind when files change to calculate correct index

  // --- Auto-Processing Queue Effect ---
  useEffect(() => {
    if (!isAutoProcessing || files.length === 0 || processingFileName) return

    // Find first unscanned file
    const nextFile = files.find((f) => {
      const meta = fileMetadata[f.name]
      return meta && !meta.isScanned && !meta.isFailed // Skip failed ones to avoid loops
    })

    if (nextFile) {
      processFileOCR(nextFile)
    }
  }, [files, fileMetadata, isAutoProcessing, processingFileName])

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      setFiles((prev) => [...prev, ...newFiles])

      const newMetadata = { ...fileMetadata }
      newFiles.forEach((f) => {
        if (!newMetadata[f.name]) {
          newMetadata[f.name] = {
            description: '',
            isFailed: false,
            isScanned: false,
            isTruncated: false,
            title: '',
          }
        }
      })
      setFileMetadata(newMetadata)

      if (currentFileIndex === null) {
        setCurrentFileIndex(0)
      }

      // Auto processing will trigger via useEffect
      setIsAutoProcessing(true)
    }
  }

  const removeFile = (index, e) => {
    e.stopPropagation()
    const newFiles = files.filter((_, i) => i !== index)
    setFiles(newFiles)
    if (newFiles.length === 0) {
      setCurrentFileIndex(null)
    } else if (index === currentFileIndex) {
      setCurrentFileIndex(0)
    } else if (index < currentFileIndex) {
      setCurrentFileIndex(currentFileIndex - 1)
    }
  }

  const clearAllFiles = () => {
    setFiles([])
    setFileMetadata({})
    setCurrentFileIndex(null)
    setImageSrc(null)
    setProcessingFileName(null)
  }

  const onImageLoad = (e) => {
    const naturalWidth = e.target.naturalWidth
    const naturalHeight = e.target.naturalHeight
    setImgDimensions({ height: naturalHeight, width: naturalWidth })

    const pxW = (DEFAULT_CROP.width / 100) * naturalWidth
    const pxH = (DEFAULT_CROP.height / 100) * naturalHeight
    targetAspectRatio.current = pxW / pxH
  }

  const resetCrop = () => {
    setCrop(DEFAULT_CROP)
  }

  // --- Crop Interaction Logic ---
  const handleStart = (clientX, clientY, handleType) => {
    setIsDragging(true)
    setDragStart({ x: clientX, y: clientY })
    setCropStart({ ...crop })
    setActiveHandle(handleType)
  }

  const handleMouseDown = (e, handleType) => {
    e.preventDefault()
    e.stopPropagation()
    handleStart(e.clientX, e.clientY, handleType)
  }

  const handleTouchStart = (e, handleType) => {
    const touch = e.touches[0]
    handleStart(touch.clientX, touch.clientY, handleType)
  }

  const handleMove = (clientX, clientY) => {
    if (!(isDragging && containerRef.current)) return

    const rect = containerRef.current.getBoundingClientRect()
    const deltaXPct = ((clientX - dragStart.x) / rect.width) * 100
    const deltaYPct = ((clientY - dragStart.y) / rect.height) * 100

    const newCrop = { ...cropStart }

    if (activeHandle === 'move') {
      newCrop.x += deltaXPct
      newCrop.y += deltaYPct
    } else {
      if (activeHandle.includes('e')) newCrop.width += deltaXPct
      if (activeHandle.includes('s')) newCrop.height += deltaYPct

      if (lockAspectRatio) {
        const pixelW = (newCrop.width / 100) * rect.width
        const targetPixelH = pixelW / targetAspectRatio.current
        newCrop.height = (targetPixelH / rect.height) * 100
      }
    }

    if (newCrop.width < 5) newCrop.width = 5
    if (newCrop.height < 5) newCrop.height = 5
    if (newCrop.x < 0) newCrop.x = 0
    if (newCrop.y < 0) newCrop.y = 0
    if (newCrop.x + newCrop.width > 100) newCrop.x = 100 - newCrop.width
    if (newCrop.y + newCrop.height > 100) newCrop.y = 100 - newCrop.height

    setCrop(newCrop)
  }

  const handleMouseMove = (e) => {
    if (isDragging) {
      e.preventDefault()
      handleMove(e.clientX, e.clientY)
    }
  }

  const handleTouchMove = (e) => {
    if (isDragging) {
      const touch = e.touches[0]
      handleMove(touch.clientX, touch.clientY)
    }
  }

  const handleEnd = () => {
    setIsDragging(false)
    setActiveHandle(null)
  }

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleEnd)
    window.addEventListener('touchmove', handleTouchMove)
    window.addEventListener('touchend', handleEnd)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleEnd)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleEnd)
    }
  }, [isDragging, dragStart, activeHandle, lockAspectRatio])

  // --- Gemini API Logic ---

  const callGeminiWithBackoff = async (payload, retryCount = 0) => {
    const delays = [1000, 2000, 4000] // Reduced retry count for smoother queue
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`

    try {
      const response = await fetch(url, {
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      if (retryCount < delays.length) {
        await new Promise((resolve) => setTimeout(resolve, delays[retryCount]))
        return callGeminiWithBackoff(payload, retryCount + 1)
      } else {
        throw error
      }
    }
  }

  const processFileOCR = async (file) => {
    setProcessingFileName(file.name)

    try {
      // 1. Load image off-screen to get dimensions and data
      const imageDataUrl = await new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target.result)
        reader.readAsDataURL(file)
      })

      const img = new Image()
      await new Promise((resolve) => {
        img.onload = resolve
        img.src = imageDataUrl
      })

      // 2. Crop
      const canvas = cropImageFromImgObject(img)
      const base64Data = canvas.toDataURL('image/png').split(',')[1]

      // 3. Prepare Gemini Prompt
      const prompt = `
        この画像はゲームのカードです。以下の情報を抽出してJSON形式で出力してください。
        
        {
          "title": "カードのタイトル（一番目立つ大きな文字）",
          "description": "カードの効果や説明文（タイトルの下にある詳細テキスト）",
          "isTruncated": boolean // 説明文が画像の端で切れている、または文が完結していないと判断される場合はtrue、それ以外はfalse
        }
        
        JSON以外の解説は不要です。
      `

      const payload = {
        contents: [
          {
            parts: [
              { text: prompt },
              { inlineData: { data: base64Data, mimeType: 'image/png' } },
            ],
            role: 'user',
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
        },
      }

      // 4. Call API
      const result = await callGeminiWithBackoff(payload)

      const textResponse = result.candidates?.[0]?.content?.parts?.[0]?.text
      if (!textResponse) throw new Error('No response from AI')

      let extractedData = { description: '', isTruncated: false, title: '' }
      try {
        extractedData = JSON.parse(textResponse)
      } catch (e) {
        const jsonMatch = textResponse.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          extractedData = JSON.parse(jsonMatch[0])
        }
      }

      // 5. Update Metadata
      setFileMetadata((prev) => ({
        ...prev,
        [file.name]: {
          description: extractedData.description || '',
          isFailed: false,
          isScanned: true,
          isTruncated: !!extractedData.isTruncated,
          title: extractedData.title || '',
        },
      }))
    } catch (err) {
      console.error(`OCR failed for ${file.name}:`, err)
      setFileMetadata((prev) => ({
        ...prev,
        [file.name]: {
          ...prev[file.name],
          isFailed: true, // Mark failed to stop retry loop
          isScanned: false, // Keep unscanned? Or mark failed?
        },
      }))
    } finally {
      setProcessingFileName(null)
    }
  }

  // Manual Trigger for current file
  const handleManualExtract = () => {
    if (currentFileIndex !== null && files[currentFileIndex]) {
      // Reset failed state to allow retry
      setFileMetadata((prev) => ({
        ...prev,
        [files[currentFileIndex].name]: {
          ...prev[files[currentFileIndex].name],
          isFailed: false,
        },
      }))
      // Set state to trigger effect or just call directly?
      // Calling directly is safer for manual interaction
      processFileOCR(files[currentFileIndex])
    }
  }

  const updateMetadata = (field, value) => {
    if (currentFileIndex === null) return
    const currentFile = files[currentFileIndex]
    setFileMetadata((prev) => ({
      ...prev,
      [currentFile.name]: {
        ...prev[currentFile.name],
        [field]: value,
      },
    }))
  }

  // --- Download Logic ---

  const cropImageFromImgObject = (imageElement) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    // Safety check for 0 dimensions
    if (imageElement.naturalWidth === 0) return canvas

    const sourceX = (crop.x / 100) * imageElement.naturalWidth
    const sourceY = (crop.y / 100) * imageElement.naturalHeight
    const sourceW = (crop.width / 100) * imageElement.naturalWidth
    const sourceH = (crop.height / 100) * imageElement.naturalHeight

    canvas.width = sourceW
    canvas.height = sourceH

    ctx.drawImage(
      imageElement,
      sourceX,
      sourceY,
      sourceW,
      sourceH,
      0,
      0,
      sourceW,
      sourceH,
    )
    return canvas
  }

  // Wrapper that grabs from DOM if available, else creates simple img (for manual single dl)
  const getCroppedCanvasForCurrent = () => {
    const imgElement = document.querySelector('img[alt="Source"]')
    if (imgElement) return cropImageFromImgObject(imgElement)
    return null
  }

  const handleSingleDownload = () => {
    if (!imageSrc) return
    const canvas = getCroppedCanvasForCurrent()
    if (canvas) {
      const link = document.createElement('a')
      link.download = `cropped_${files[currentFileIndex].name}`
      link.href = canvas.toDataURL('image/png')
      link.click()
    }
  }

  const handleZipDownload = async () => {
    if (files.length === 0) return
    setIsZipping(true)

    try {
      const JSZip = await loadJSZip()
      const zip = new JSZip()

      const jsonOutput = []

      const processFile = (file) => {
        return new Promise((resolve) => {
          const reader = new FileReader()
          reader.onload = (e) => {
            const img = new Image()
            img.onload = () => {
              const canvas = cropImageFromImgObject(img)
              canvas.toBlob((blob) => {
                const meta = fileMetadata[file.name] || {
                  description: '',
                  isTruncated: false,
                  title: '',
                }

                // Add to JSON list
                jsonOutput.push({
                  description: meta.description,
                  fileName: `cropped_${file.name}`,
                  isTruncated: meta.isTruncated,
                  title: meta.title,
                })

                resolve({ blob, name: `cropped_${file.name}` })
              }, 'image/png')
            }
            img.src = e.target.result
          }
          reader.readAsDataURL(file)
        })
      }

      const promises = files.map((file) => processFile(file))
      const imageResults = await Promise.all(promises)

      // Add images
      imageResults.forEach((item) => {
        zip.file(item.name, item.blob)
      })

      // Sort JSON by fileName (using numeric sort for image01, image10 etc)
      jsonOutput.sort((a, b) =>
        a.fileName.localeCompare(b.fileName, undefined, {
          numeric: true,
          sensitivity: 'base',
        }),
      )

      // Add JSON
      zip.file('data.json', JSON.stringify(jsonOutput, null, 2))

      const content = await zip.generateAsync({ type: 'blob' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(content)
      link.download = 'card_assets.zip'
      link.click()
    } catch (error) {
      console.error('Zip generation failed:', error)
      alert('ZIPファイルの生成に失敗しました。')
    } finally {
      setIsZipping(false)
    }
  }

  const currentMeta =
    currentFileIndex !== null && files[currentFileIndex]
      ? fileMetadata[files[currentFileIndex].name] || {
          description: '',
          isFailed: false,
          isScanned: false,
          isTruncated: false,
          title: '',
        }
      : {
          description: '',
          isFailed: false,
          isScanned: false,
          isTruncated: false,
          title: '',
        }

  // Calculate stats
  const totalFiles = files.length
  const scannedFiles = files.filter(
    (f) => fileMetadata[f.name]?.isScanned,
  ).length
  const processingFile = files.find((f) => f.name === processingFileName)

  return (
    <div className="min-h-screen bg-slate-900 p-4 font-sans text-white selection:bg-pink-500 selection:text-white">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-slate-700 border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-pink-500 p-2">
              <Scissors size={24} />
            </div>
            <div>
              <h1 className="font-bold text-2xl">カードトリミングツール</h1>
              {totalFiles > 0 && (
                <div className="mt-1 flex items-center gap-2 text-slate-400 text-xs">
                  <span>
                    解析状況: {scannedFiles} / {totalFiles}
                  </span>
                  {processingFileName && (
                    <span className="flex items-center gap-1 text-pink-400">
                      <Loader2 className="animate-spin" size={10} />
                      処理中: {processingFileName}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              className={`flex items-center gap-1 rounded px-3 py-1 text-xs transition-colors ${
                isAutoProcessing
                  ? 'border border-green-500/30 bg-green-500/10 text-green-400'
                  : 'border border-slate-600 bg-slate-700 text-slate-400'
              }`}
              onClick={() => setIsAutoProcessing(!isAutoProcessing)}
              title={isAutoProcessing ? '自動処理を一時停止' : '自動処理を開始'}
            >
              {isAutoProcessing ? <Pause size={12} /> : <Play size={12} />}
              {isAutoProcessing ? '自動解析ON' : '一時停止中'}
            </button>
            <button
              className="flex items-center gap-1 rounded border border-slate-700 px-3 py-1 text-slate-400 text-sm transition-all hover:border-slate-500 hover:bg-slate-800 hover:text-white"
              onClick={() => fileInputRef.current.click()}
            >
              <Upload size={14} /> 画像を追加
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Left Column: Editor */}
          <div className="space-y-4 lg:w-2/3">
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-4 shadow-xl">
              {!imageSrc ? (
                <div
                  className="group flex h-96 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-slate-600 border-dashed transition-all hover:border-pink-500 hover:bg-slate-700/50"
                  onClick={() => fileInputRef.current.click()}
                >
                  <Upload
                    className="mb-4 text-slate-500 transition-colors group-hover:text-pink-400"
                    size={48}
                  />
                  <p className="font-medium text-slate-300 text-xl group-hover:text-white">
                    クリックして画像を選択
                  </p>
                  <p className="mt-2 text-slate-500 text-sm">
                    複数選択可・ドラッグ＆ドロップまたはCtrl+Vで貼り付け
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Image Area */}
                  <div
                    className="group relative w-full select-none overflow-hidden rounded-lg bg-black shadow-2xl"
                    ref={containerRef}
                    style={{ maxHeight: '60vh' }}
                  >
                    <img
                      alt="Source"
                      className="pointer-events-none block h-auto w-full opacity-50"
                      onLoad={onImageLoad}
                      src={imageSrc}
                    />

                    <div
                      className="pointer-events-none absolute top-0 left-0 h-full w-full bg-black/50"
                      style={{
                        clipPath: `polygon(0% 0%, 0% 100%, ${crop.x}% 100%, ${crop.x}% ${crop.y}%, ${crop.x + crop.width}% ${crop.y}%, ${crop.x + crop.width}% ${crop.y + crop.height}%, ${crop.x}% ${crop.y + crop.height}%, ${crop.x}% 100%, 100% 100%, 100% 0%)`,
                      }}
                    />

                    <div
                      className="pointer-events-none absolute box-content overflow-hidden"
                      style={{
                        boxShadow: '0 0 20px rgba(0,0,0,0.5)',
                        height: `${crop.height}%`,
                        left: `${crop.x}%`,
                        top: `${crop.y}%`,
                        width: `${crop.width}%`,
                        zIndex: 11,
                      }}
                    >
                      <img
                        className="absolute max-w-none"
                        src={imageSrc}
                        style={{
                          left: `-${(crop.x / 100) * (containerRef.current ? containerRef.current.clientWidth : 0)}px`,
                          top: `-${(crop.y / 100) * (containerRef.current ? containerRef.current.clientHeight : 0)}px`,
                          width: containerRef.current
                            ? containerRef.current.clientWidth
                            : '100%',
                        }}
                      />
                    </div>

                    <div
                      className={`absolute z-20 flex cursor-move items-center justify-center border-2 border-pink-500 transition-colors hover:bg-pink-500/5 ${isDragging ? 'ring-2 ring-pink-500/30' : ''}`}
                      onMouseDown={(e) => handleMouseDown(e, 'move')}
                      onTouchStart={(e) => handleTouchStart(e, 'move')}
                      style={{
                        height: `${crop.height}%`,
                        left: `${crop.x}%`,
                        top: `${crop.y}%`,
                        width: `${crop.width}%`,
                      }}
                    >
                      <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-0 transition-opacity group-hover:opacity-30">
                        <div className="border-pink-200 border-r"></div>
                        <div className="border-pink-200 border-r"></div>
                        <div className="border-pink-200 border-r"></div>
                        <div className="col-span-3 row-start-2 border-pink-200 border-t"></div>
                        <div className="col-span-3 row-start-3 border-pink-200 border-t"></div>
                      </div>

                      <div className="-translate-x-1/2 -translate-y-1/2 pointer-events-none absolute top-1/2 left-1/2 rounded-full bg-pink-500 p-1.5 text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                        <Move size={16} />
                      </div>

                      <div
                        className="-bottom-2 -right-2 absolute z-30 flex h-6 w-6 cursor-se-resize items-center justify-center rounded-full border-2 border-white bg-pink-500 shadow-lg transition-transform hover:scale-110"
                        onMouseDown={(e) => handleMouseDown(e, 'se')}
                        onTouchStart={(e) => handleTouchStart(e, 'se')}
                      >
                        <div className="h-1.5 w-1.5 rounded-full bg-white" />
                      </div>
                    </div>
                  </div>

                  {/* OCR & Info Area */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Controls */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between rounded-lg bg-slate-700/30 p-3 text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            className="rounded p-1.5 text-slate-400 hover:bg-slate-600 hover:text-white"
                            onClick={resetCrop}
                            title="位置リセット"
                          >
                            <RefreshCw size={14} />
                          </button>
                          <button
                            className={`flex items-center gap-1 rounded p-1.5 ${lockAspectRatio ? 'bg-pink-500/10 text-pink-400' : 'text-slate-400 hover:bg-slate-600'}`}
                            onClick={() => setLockAspectRatio(!lockAspectRatio)}
                          >
                            {lockAspectRatio ? (
                              <Lock size={14} />
                            ) : (
                              <Unlock size={14} />
                            )}
                            {lockAspectRatio ? '固定' : '自由'}
                          </button>
                        </div>
                        <span className="text-slate-500 text-xs">
                          {Math.round(crop.width)}% x {Math.round(crop.height)}%
                        </span>
                      </div>

                      <button
                        className={`flex w-full items-center justify-center gap-2 rounded-lg py-2 font-bold text-sm transition-all ${
                          processingFileName === files[currentFileIndex]?.name
                            ? 'bg-slate-700 text-slate-400'
                            : 'bg-indigo-600 text-white shadow-md hover:bg-indigo-500'
                        }`}
                        disabled={
                          processingFileName === files[currentFileIndex]?.name
                        }
                        onClick={handleManualExtract}
                      >
                        {processingFileName ===
                        files[currentFileIndex]?.name ? (
                          <>
                            <Loader2 className="animate-spin" size={16} />{' '}
                            解析中...
                          </>
                        ) : (
                          <>
                            <Sparkles size={16} /> この画像を再解析
                          </>
                        )}
                      </button>
                    </div>

                    {/* Extracted Text Inputs */}
                    <div className="space-y-2 rounded-lg bg-slate-700/30 p-3">
                      <div>
                        <label className="mb-1 block text-slate-400 text-xs">
                          タイトル
                        </label>
                        <input
                          className="w-full rounded border border-slate-600 bg-slate-800 px-2 py-1 text-sm text-white placeholder-slate-600 focus:border-pink-500 focus:outline-none"
                          onChange={(e) =>
                            updateMetadata('title', e.target.value)
                          }
                          placeholder={
                            currentMeta.isFailed
                              ? '解析失敗 (再試行してください)'
                              : currentMeta.isScanned
                                ? ''
                                : '待機中...'
                          }
                          type="text"
                          value={currentMeta.title}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block flex items-center justify-between text-slate-400 text-xs">
                          <span>説明</span>
                          {currentMeta.isTruncated && (
                            <span className="flex items-center gap-1 text-yellow-400">
                              <AlertTriangle size={10} /> 途切れ検知
                            </span>
                          )}
                        </label>
                        <textarea
                          className={`w-full resize-none rounded border bg-slate-800 px-2 py-1 text-sm text-white placeholder-slate-600 focus:border-pink-500 focus:outline-none ${currentMeta.isTruncated ? 'border-yellow-500/50' : 'border-slate-600'}`}
                          onChange={(e) =>
                            updateMetadata('description', e.target.value)
                          }
                          placeholder={
                            currentMeta.isFailed
                              ? '解析失敗 (再試行してください)'
                              : currentMeta.isScanned
                                ? ''
                                : '待機中...'
                          }
                          rows={3}
                          value={currentMeta.description}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: File List & Bulk Actions */}
          <div className="flex flex-col gap-4 lg:w-1/3">
            <div className="flex max-h-[80vh] flex-1 flex-col rounded-xl border border-slate-700 bg-slate-800 p-4 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-bold">
                  <Layers className="text-pink-500" size={18} />
                  ファイルリスト ({files.length})
                </h2>
                {files.length > 0 && (
                  <button
                    className="flex items-center gap-1 text-red-400 text-xs hover:text-red-300"
                    onClick={clearAllFiles}
                  >
                    <Trash2 size={12} /> 全て削除
                  </button>
                )}
              </div>

              <div className="custom-scrollbar min-h-[200px] flex-1 space-y-2 overflow-y-auto pr-1">
                {files.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-slate-500 opacity-50">
                    <ImageIcon className="mb-2" size={48} />
                    <p className="text-sm">画像がありません</p>
                  </div>
                ) : (
                  files.map((file, idx) => {
                    const meta = fileMetadata[file.name] || {}
                    const isProcessing = processingFileName === file.name
                    const hasText = meta.isScanned

                    return (
                      <div
                        className={`flex cursor-pointer items-center gap-3 rounded-lg border p-2 transition-all ${
                          currentFileIndex === idx
                            ? 'border-pink-500 bg-pink-500/10'
                            : 'border-transparent bg-slate-700/30 hover:bg-slate-700/50'
                        }`}
                        key={idx}
                        onClick={() => setCurrentFileIndex(idx)}
                      >
                        <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded bg-slate-900">
                          {isProcessing ? (
                            <Loader2
                              className="animate-spin text-pink-500"
                              size={20}
                            />
                          ) : (
                            <ImageIcon className="text-slate-600" size={20} />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <p
                              className={`truncate text-sm ${currentFileIndex === idx ? 'font-medium text-pink-400' : 'text-slate-300'}`}
                            >
                              {file.name}
                            </p>
                            <div className="flex items-center gap-1">
                              {meta.isTruncated && !isProcessing && (
                                <AlertTriangle
                                  className="text-yellow-400"
                                  size={12}
                                  title="説明文が途切れている可能性があります"
                                />
                              )}
                              {hasText && !isProcessing && (
                                <FileText
                                  className="text-green-400"
                                  size={12}
                                  title="テキスト抽出済み"
                                />
                              )}
                              {meta.isFailed && !isProcessing && (
                                <span className="text-red-400 text-xs">
                                  失敗
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-slate-500 text-xs">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <button
                          className="rounded p-1.5 text-slate-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                          onClick={(e) => removeFile(idx, e)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )
                  })
                )}
              </div>

              <div className="mt-4 border-slate-700 border-t pt-4">
                <button
                  className={`flex w-full items-center justify-center gap-2 rounded-lg py-4 font-bold shadow-lg transition-all ${
                    files.length === 0
                      ? 'cursor-not-allowed bg-slate-700 text-slate-500'
                      : isZipping
                        ? 'cursor-wait bg-pink-600 text-white'
                        : 'transform bg-gradient-to-r from-pink-500 to-rose-600 text-white hover:from-pink-400 hover:to-rose-500 active:scale-[0.98]'
                  }`}
                  disabled={files.length === 0 || isZipping}
                  onClick={handleZipDownload}
                >
                  {isZipping ? (
                    <>
                      <RefreshCw className="animate-spin" size={20} />
                      処理中...
                    </>
                  ) : (
                    <>
                      <FileArchive size={20} />
                      まとめてZIPで保存
                    </>
                  )}
                </button>
                <p className="mt-2 text-center text-slate-500 text-xs">
                  画像(.png)と解析データ(data.json)を保存します
                </p>
              </div>
            </div>
          </div>
        </div>

        <input
          accept="image/*"
          className="hidden"
          multiple={true}
          onChange={handleFileChange}
          ref={fileInputRef}
          type="file"
        />
        <canvas className="hidden" ref={canvasRef} />
      </div>
    </div>
  )
}
