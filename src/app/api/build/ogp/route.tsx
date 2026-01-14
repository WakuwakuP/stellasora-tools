import { ImageResponse } from 'next/og'
import { type NextRequest } from 'next/server'

export const runtime = 'edge'

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

  const characters = charactersParam.split(',').filter(Boolean)
  const mainLossRecords = mainLossRecordsParam.split(',').filter(Boolean)
  const subLossRecords = subLossRecordsParam.split(',').filter(Boolean)

  try {
    return new ImageResponse(
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          backgroundColor: '#1e293b',
          padding: '48px',
          fontFamily: 'system-ui, sans-serif',
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
          <h1
            style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: '#f1f5f9',
              margin: 0,
            }}
          >
            {buildName}
          </h1>
        </div>

        {/* キャラクター3人 */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '32px',
            width: '100%',
            marginBottom: '32px',
          }}
        >
          {characters.map((char, index) => (
            <div
              key={`char-${index}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '16px',
                backgroundColor: index === 0 ? '#dc2626' : '#475569',
                borderRadius: '16px',
                width: '200px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '120px',
                  height: '120px',
                  backgroundColor: '#334155',
                  borderRadius: '12px',
                  marginBottom: '12px',
                }}
              >
                <span style={{ fontSize: '48px', color: '#94a3b8' }}>
                  {char.charAt(0)}
                </span>
              </div>
              <span
                style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#f1f5f9',
                }}
              >
                {char}
              </span>
              <span
                style={{
                  fontSize: '14px',
                  color: '#cbd5e1',
                  marginTop: '4px',
                }}
              >
                {index === 0 ? '主力' : '支援'}
              </span>
            </div>
          ))}
        </div>

        {/* ロスレコ6個 (メイン3個 + サブ3個) */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            gap: '16px',
          }}
        >
          {/* メインロスレコ */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '16px',
              width: '100%',
            }}
          >
            {mainLossRecords.map((lossRecord, index) => (
              <div
                key={`main-${index}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '12px',
                  backgroundColor: '#fbbf24',
                  borderRadius: '12px',
                  width: '100px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '60px',
                    height: '60px',
                    backgroundColor: '#f59e0b',
                    borderRadius: '8px',
                    marginBottom: '8px',
                  }}
                >
                  <span style={{ fontSize: '24px' }}>🎵</span>
                </div>
                <span
                  style={{
                    fontSize: '12px',
                    color: '#78350f',
                    textAlign: 'center',
                  }}
                >
                  M{index + 1}
                </span>
              </div>
            ))}
          </div>

          {/* サブロスレコ */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '16px',
              width: '100%',
            }}
          >
            {subLossRecords.map((lossRecord, index) => (
              <div
                key={`sub-${index}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '12px',
                  backgroundColor: '#94a3b8',
                  borderRadius: '12px',
                  width: '100px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '60px',
                    height: '60px',
                    backgroundColor: '#64748b',
                    borderRadius: '8px',
                    marginBottom: '8px',
                  }}
                >
                  <span style={{ fontSize: '24px' }}>🎵</span>
                </div>
                <span
                  style={{
                    fontSize: '12px',
                    color: '#1e293b',
                    textAlign: 'center',
                  }}
                >
                  S{index + 1}
                </span>
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

