import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'KOGI BRAIN - マニュアル検索システム',
  description: '韓国居酒屋向け店舗マニュアル検索AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
