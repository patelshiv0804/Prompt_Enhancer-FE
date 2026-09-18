'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ChatDetailSkeleton } from '@/features/chat/components/ChatView';

const ChatView = dynamic(
  () => import('@/features/chat').then((mod) => mod.ChatView),
  {
    loading: () => <ChatDetailSkeleton />,
    ssr: false,
  }
);

export default function ChatDetailPage() {
  const params = useParams<{ chatId: string }>();
  const chatId = params.chatId;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <ChatView chatId={chatId} />
    </div>
  );
}
