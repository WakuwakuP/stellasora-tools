import { ImageResponse } from 'next/og'
import { type NextRequest } from 'next/server'

export const runtime = 'edge'

const API_BASE_URL = 'https://api.ennead.cc'

/**
 * OGP画像生成API
 * クエリパラメータ:
 * - name: ビルド名
 * - characters: キャラクター名（カンマ区切り、3人）
 * - mainLossRecords: メインロスレコID（カンマ区切り、3個）
 * - subLossRecords: サブロスレコID（カンマ区切り、3個）
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const buildName = searchParams.get('name') || 'ビルド'
  const charactersParam = searchParams.get('characters') || ''
  const mainLossRecordsParam = searchParams.get('mainLossRecords') || ''
  const subLossRecordsParam = searchParams.get('subLossRecords') || ''

  const characterNames = charactersParam.split(',').filter(Boolean)
  const mainLossRecordIds = mainLossRecordsParam.split(',').filter(Boolean)
  const subLossRecordIds = subLossRecordsParam.split(',').filter(Boolean)

  // キャラクターアイコンURLを取得
  const characterIcons = await Promise.all(
    characterNames.map(async (name) => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/stella/character/${encodeURIComponent(name)}?lang=JP`,
        )
        if (!response.ok) return null
        const data = await response.json()
        return `${API_BASE_URL}/stella/assets/${data.icon}`
      } catch {
        return null
      }
    }),
  )

  // ロスレコアイコンURLを取得
  const mainLossRecordIcons = await Promise.all(
    mainLossRecordIds.map(async (id) => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/stella/disc/${id}?lang=JP`,
        )
        if (!response.ok) return null
        const data = await response.json()
        return `${API_BASE_URL}/stella/assets/${data.icon}`
      } catch {
        return null
      }
    }),
  )

  const subLossRecordIcons = await Promise.all(
    subLossRecordIds.map(async (id) => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/stella/disc/${id}?lang=JP`,
        )
        if (!response.ok) return null
        const data = await response.json()
        return `${API_BASE_URL}/stella/assets/${data.icon}`
      } catch {
        return null
      }
    }),
  )

  try {
    return new ImageResponse(
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
          padding: '50px 60px',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
        }}
      >
        {/* 背景装飾 */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
            opacity: 0.6,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)',
            opacity: 0.6,
          }}
        />

        {/* コンテンツ */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* ビルド名 */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              marginBottom: '32px',
            }}
          >
            <div
              style={{
                display: 'flex',
                width: '716px',
                justifyContent: 'flex-start',
              }}
            >
              <h1
                style={{
                  fontSize: '56px',
                  fontWeight: 'bold',
                  background: 'linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 100%)',
                  backgroundClip: 'text',
                  color: 'transparent',
                  margin: 0,
                  textShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 2,
                  maxWidth: '716px',
                }}
              >
                {buildName}
              </h1>
            </div>
          </div>

          {/* キャラクター3人 */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '28px',
              width: '100%',
              marginBottom: '28px',
            }}
          >
            {characterNames.map((name, index) => (
              <div
                key={`char-${index}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '20px',
                  background:
                    index === 0
                      ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                      : 'linear-gradient(135deg, #475569 0%, #334155 100%)',
                  borderRadius: '20px',
                  width: '220px',
                  boxShadow:
                    index === 0
                      ? '0 8px 24px rgba(239, 68, 68, 0.3), 0 2px 8px rgba(0, 0, 0, 0.3)'
                      : '0 8px 24px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)',
                  border: index === 0 ? '2px solid rgba(252, 165, 165, 0.4)' : '2px solid rgba(71, 85, 105, 0.5)',
                }}
              >
                {characterIcons[index] ? (
                  <div
                    style={{
                      display: 'flex',
                      borderRadius: '16px',
                      marginBottom: '14px',
                      overflow: 'hidden',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                      border: '3px solid rgba(255, 255, 255, 0.15)',
                    }}
                  >
                    <img
                      src={characterIcons[index]!}
                      width={140}
                      height={140}
                      alt={name}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: '140px',
                      height: '140px',
                      background: 'linear-gradient(135deg, #334155 0%, #1e293b 100%)',
                      borderRadius: '16px',
                      marginBottom: '14px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                      border: '3px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <span style={{ fontSize: '56px', color: '#94a3b8' }}>
                      {name.charAt(0)}
                    </span>
                  </div>
                )}
                <span
                  style={{
                    fontSize: '22px',
                    fontWeight: 'bold',
                    color: '#ffffff',
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                    marginBottom: '4px',
                  }}
                >
                  {name}
                </span>
                <div
                  style={{
                    display: 'flex',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: index === 0 ? '#fecaca' : '#cbd5e1',
                    backgroundColor: index === 0 ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    letterSpacing: '0.5px',
                  }}
                >
                  {index === 0 ? '主力' : '支援'}
                </div>
              </div>
            ))}
          </div>

          {/* ロスレコ6個 (メイン3個 + サブ3個) - 全て横並び */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '14px',
              width: '100%',
            }}
          >
            {/* メインロスレコ */}
            {mainLossRecordIds.map((id, index) => (
              <div
                key={`main-${index}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '12px',
                  background: 'linear-gradient(135deg, #fcd34d 0%, #fbbf24 100%)',
                  borderRadius: '16px',
                  width: '110px',
                  boxShadow: '0 6px 16px rgba(252, 211, 77, 0.3), 0 2px 6px rgba(0, 0, 0, 0.3)',
                  border: '2px solid rgba(254, 243, 199, 0.4)',
                }}
              >
                {mainLossRecordIcons[index] ? (
                  <div
                    style={{
                      display: 'flex',
                      borderRadius: '12px',
                      overflow: 'hidden',
                    }}
                  >
                    <img
                      src={mainLossRecordIcons[index]!}
                      width={86}
                      height={86}
                      alt={`Main Loss Record ${index + 1}`}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: '86px',
                      height: '86px',
                      background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                      borderRadius: '12px',
                    }}
                  >
                    <span style={{ fontSize: '32px' }}>🎵</span>
                  </div>
                )}
              </div>
            ))}

            {/* サブロスレコ */}
            {subLossRecordIds.map((id, index) => (
              <div
                key={`sub-${index}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '12px',
                  background: 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)',
                  borderRadius: '16px',
                  width: '110px',
                  boxShadow: '0 6px 16px rgba(100, 116, 139, 0.4), 0 2px 6px rgba(0, 0, 0, 0.3)',
                  border: '2px solid rgba(203, 213, 225, 0.4)',
                }}
              >
                {subLossRecordIcons[index] ? (
                  <div
                    style={{
                      display: 'flex',
                      borderRadius: '12px',
                      overflow: 'hidden',
                    }}
                  >
                    <img
                      src={subLossRecordIcons[index]!}
                      width={86}
                      height={86}
                      alt={`Sub Loss Record ${index + 1}`}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: '86px',
                      height: '86px',
                      background: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
                      borderRadius: '12px',
                    }}
                  >
                    <span style={{ fontSize: '32px' }}>🎵</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
      },
    )
  } catch (error) {
    console.error('OGP image generation error:', error)
    return new Response('Failed to generate OGP image', { status: 500 })
  }
}

