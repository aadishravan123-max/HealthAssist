'use client';

import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Search } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/lib/supabase/supabaseClient';
import { useAuth } from '@/context/AuthContext';

export default function DoctorMessagesPage() {
    const { user } = useAuth();
    const [conversations, setConversations] = React.useState<any[]>([]);
    const [messages, setMessages] = React.useState<any[]>([]);
    const [selectedConversation, setSelectedConversation] = React.useState<any>(null);
    const [newMessage, setNewMessage] = React.useState('');
    const [loading, setLoading] = React.useState(true);
    const messagesEndRef = React.useRef<HTMLDivElement>(null);

    // Fetch conversations
    React.useEffect(() => {
        if (!user) return;

        const fetchConversations = async () => {
            const { data, error } = await supabase
                .from('conversations')
                .select(`
                    *,
                    participant1:participant1_id(full_name, id),
                    participant2:participant2_id(full_name, id)
                `)
                .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
                .order('last_message_at', { ascending: false });

            if (error) console.error('Error fetching conversations:', error);
            else setConversations(data || []);
            setLoading(false);
        };

        fetchConversations();

        // Subscribe to new conversations or updates
        const channel = supabase
            .channel('conversations_channel')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, () => {
                fetchConversations();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    // Fetch messages when conversation selected
    React.useEffect(() => {
        if (!selectedConversation) return;

        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', selectedConversation.id)
                .order('created_at', { ascending: true });

            if (error) console.error('Error fetching messages:', error);
            else setMessages(data || []);
        };

        fetchMessages();

        // Subscribe to new messages in this conversation
        const channel = supabase
            .channel(`messages:${selectedConversation.id}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `conversation_id=eq.${selectedConversation.id}`
            }, (payload) => {
                setMessages(prev => [...prev, payload.new]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [selectedConversation]);

    // Scroll to bottom
    React.useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Handle query params for deep linking
    React.useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const conversationId = params.get('conversationId');
        if (conversationId && conversations.length > 0) {
            const linkedConv = conversations.find(c => c.id === conversationId);
            if (linkedConv) {
                setSelectedConversation(linkedConv);
                // Clear param to avoid re-selecting on refresh if desired, or keep it.
                // window.history.replaceState({}, '', '/dashboard/doctor/messages');
            }
        }
    }, [conversations]); // Run when conversations are loaded

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedConversation || !user) return;

        const messageContent = newMessage.trim();
        const temporaryId = crypto.randomUUID(); // Temp ID for list key
        const newMsgObj = {
            id: temporaryId,
            conversation_id: selectedConversation.id,
            sender_id: user.id,
            content: messageContent,
            created_at: new Date().toISOString(),
            is_read: false
        };

        // Optimistic Update: Messages
        setMessages(prev => [...prev, newMsgObj]);
        setNewMessage('');

        // Optimistic Update: Conversations List (Move to top, update text)
        setConversations(prev => {
            const updated = prev.map(c =>
                c.id === selectedConversation.id
                    ? { ...c, last_message: messageContent, last_message_at: new Date().toISOString() }
                    : c
            );
            return updated.sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());
        });

        const { error } = await supabase
            .from('messages')
            .insert({
                conversation_id: selectedConversation.id,
                sender_id: user.id,
                content: messageContent
            });

        if (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message');
            // Revert changes if needed (omitted for brevity, but recommended in prod)
        } else {
            // Update conversation last_message in DB
            await supabase
                .from('conversations')
                .update({
                    last_message: messageContent,
                    last_message_at: new Date().toISOString()
                })
                .eq('id', selectedConversation.id);
        }
    };

    const getOtherParticipantName = (conv: any) => {
        if (!user) return 'Unknown';
        return conv.participant1_id === user.id ? conv.participant2?.full_name : conv.participant1?.full_name;
    };

    const getOtherParticipantId = (conv: any) => {
        if (!user) return null;
        return conv.participant1_id === user.id ? conv.participant2_id : conv.participant1_id;
    };

    return (
        <div className="h-[calc(100vh-theme(spacing.32))] grid grid-cols-12 gap-6 p-6">
            {/* Sidebar */}
            <div className="col-span-4 flex flex-col gap-4">
                <GlassCard className="h-full flex flex-col p-0 overflow-hidden">
                    <div className="p-4 border-b">
                        <h2 className="font-semibold mb-4">Messages</h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search messages..." className="pl-9 bg-slate-50" />
                        </div>
                    </div>
                    <div className="flex-1 overflow-auto">
                        {loading ? (
                            <div className="p-4 text-center text-muted-foreground">Loading conversations...</div>
                        ) : conversations.length === 0 ? (
                            <div className="p-4 text-center text-muted-foreground">No conversations yet.</div>
                        ) : (
                            conversations.map((chat) => {
                                const otherName = getOtherParticipantName(chat);
                                return (
                                    <div
                                        key={chat.id}
                                        onClick={() => setSelectedConversation(chat)}
                                        className={`p-4 border-b hover:bg-slate-50 cursor-pointer flex gap-3 transition-colors ${selectedConversation?.id === chat.id ? 'bg-slate-50' : ''}`}
                                    >
                                        <Avatar>
                                            <AvatarFallback>{otherName?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-medium text-sm">{otherName}</h3>
                                                <span className="text-[10px] text-muted-foreground">
                                                    {new Date(chat.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground truncate">{chat.last_message || 'Start a conversation'}</p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </GlassCard>
            </div>

            {/* Chat Window */}
            <div className="col-span-8">
                <GlassCard className="h-full flex flex-col p-0 overflow-hidden bg-white/80">
                    {selectedConversation ? (
                        <>
                            <div className="p-4 border-b bg-white/50 backdrop-blur-sm flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarFallback>{getOtherParticipantName(selectedConversation)?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="font-medium">{getOtherParticipantName(selectedConversation)}</h3>
                                        <div className="flex items-center gap-2">
                                            <span className="h-2 w-2 rounded-full bg-green-500" />
                                            <span className="text-xs text-muted-foreground">Online</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 p-4 overflow-auto space-y-4">
                                {messages.map((msg) => {
                                    const isMe = msg.sender_id === user?.id;
                                    return (
                                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`${isMe ? 'bg-medical-primary text-white' : 'bg-slate-100'} rounded-lg p-3 max-w-[80%] text-sm`}>
                                                {msg.content}
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            <div className="p-4 border-t bg-white">
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Type a message..."
                                        className="bg-slate-50"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                    />
                                    <Button size="icon" className="bg-medical-primary hover:bg-medical-primary/90" onClick={handleSendMessage}>
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-muted-foreground">
                            Select a conversation to start chatting
                        </div>
                    )}
                </GlassCard>
            </div>
        </div>
    );
}
