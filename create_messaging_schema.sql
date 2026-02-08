-- Create conversations table
create table if not exists public.conversations (
  id uuid default gen_random_uuid() primary key,
  participant1_id uuid references public.profiles(id) on delete cascade not null,
  participant2_id uuid references public.profiles(id) on delete cascade not null,
  last_message text,
  last_message_at timestamp with time zone default now(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create messages table
create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  is_read boolean default false,
  created_at timestamp with time zone default now()
);

-- Indexes for performance
create index if not exists idx_conversations_participant1 on public.conversations(participant1_id);
create index if not exists idx_conversations_participant2 on public.conversations(participant2_id);
create index if not exists idx_conversations_last_message_at on public.conversations(last_message_at desc);
create index if not exists idx_messages_conversation_id on public.messages(conversation_id);
create index if not exists idx_messages_created_at on public.messages(created_at);

-- RLS Policies (Simple for now: authenticated users can access)
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

create policy "Users can view their own conversations"
  on public.conversations for select
  using (auth.uid() = participant1_id or auth.uid() = participant2_id);

create policy "Users can insert conversations they are part of"
  on public.conversations for insert
  with check (auth.uid() = participant1_id or auth.uid() = participant2_id);

create policy "Users can view messages in their conversations"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations
      where id = messages.conversation_id
      and (participant1_id = auth.uid() or participant2_id = auth.uid())
    )
  );

create policy "Users can insert messages in their conversations"
  on public.messages for insert
  with check (
    sender_id = auth.uid() and
    exists (
      select 1 from public.conversations
      where id = conversation_id
      and (participant1_id = auth.uid() or participant2_id = auth.uid())
    )
  );
