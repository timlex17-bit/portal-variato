'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface TopbarProps {
  title: string
}

export default function Topbar({ title }: TopbarProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value)
  }

  return (
    <header className="topbar">
      <div className="topbar-title">{title}</div>
      <div className="topbar-search">
        <span className="topbar-search-icon">🔍</span>
        <input
          type="text"
          placeholder="Buka kazu, dokumentu..."
          value={search}
          onChange={handleSearch}
        />
      </div>
      <div className="topbar-actions">
        <div className="icon-btn" title="Notifikasaun">🔔</div>
        <div className="icon-btn" title="Lingua">🇹🇱</div>
      </div>
    </header>
  )
}
