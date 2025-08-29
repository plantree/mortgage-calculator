import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = '房贷计算器 - 专业的房贷计算工具'

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* 装饰性几何图形 */}
        <div
          style={{
            position: 'absolute',
            top: '50px',
            left: '100px',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '80px',
            right: '100px',
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.08)',
          }}
        />
        
        {/* 主卡片 */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            width: '1000px',
            height: '470px',
            borderRadius: '24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            position: 'relative',
          }}
        >
          {/* 主标题 */}
          <div
            style={{
              fontSize: '64px',
              fontWeight: 'bold',
              color: '#1e293b',
              marginBottom: '20px',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            房贷计算器
          </div>
          
          {/* 副标题 */}
          <div
            style={{
              fontSize: '28px',
              color: '#64748b',
              marginBottom: '40px',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            精确计算您的房贷还款计划
          </div>
          
          {/* 功能特性 */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              fontSize: '24px',
              color: '#475569',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: '#10b981',
                }}
              />
              <span>商业贷款 · 公积金贷款 · 组合贷款</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: '#10b981',
                }}
              />
              <span>等额本息 · 等额本金</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: '#10b981',
                }}
              />
              <span>详细还款计划 · 可视化图表</span>
            </div>
          </div>
          
          {/* 房子图标 */}
          <div
            style={{
              position: 'absolute',
              right: '80px',
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '20px',
            }}
          >
            <div
              style={{
                width: '80px',
                height: '80px',
                background: '#2563eb',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '40px',
                color: 'white',
              }}
            >
              🏠
            </div>
            <div
              style={{
                width: '50px',
                height: '50px',
                background: '#10b981',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                color: 'white',
                fontWeight: 'bold',
              }}
            >
              ¥
            </div>
          </div>
          
          {/* 底部品牌信息 */}
          <div
            style={{
              position: 'absolute',
              bottom: '20px',
              fontSize: '20px',
              color: '#64748b',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            @plantree_me
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
