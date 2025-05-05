'use client';
import { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Head from 'next/head';

type UserStatus = 'online' | 'offline' | 'busy' | 'brb';

type User = {
  id: string;
  name: string;
  avatar: string;
  status: UserStatus;
  lastActive?: string;
};

type Message = {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  reactions: Record<string, string[]>;
  isUser?: boolean;
};

type TypingUser = {
  userId: string;
  name: string;
};

const statusColors: Record<UserStatus, string> = {
  online: 'bg-green-500',
  offline: 'bg-gray-400',
  busy: 'bg-red-500',
  brb: 'bg-yellow-500',
};

const statusMessages: Record<UserStatus, string> = {
  online: 'Online',
  offline: 'Offline',
  busy: 'Busy',
  brb: 'Be right back',
};

const quickStatuses = ['👍', '👎', '❤️', '😂', '😮', '😢', 'brb', 'busy'];

const avatars = {
  male: [
    'https://api.dicebear.com/9.x/pixel-art/svg',
    'https://api.dicebear.com/9.x/lorelei/svg',
    'https://api.dicebear.com/9.x/pixel-art/svg?seed=John&hair=short01,short02,short03,short04,short05'
  ],
  female: [
    'https://api.dicebear.com/9.x/pixel-art/svg?seed=John',
    'https://api.dicebear.com/9.x/pixel-art/svg?seed=Jane',
    'https://api.dicebear.com/9.x/pixel-art/svg?seed=Jane&hair=long01,long02,long03,long04,long05'
  ]
};

const defaultUsers: User[] = [
  {
    id: 'user-2',
    name: 'Jane Smith',
    avatar: avatars.female[0],
    status: 'online',
  },
  {
    id: 'user-3',
    name: 'Robert Johnson',
    avatar: avatars.male[1],
    status: 'online',
  },
  {
    id: 'user-4',
    name: 'Emily Davis',
    avatar: avatars.female[1],
    status: 'busy',
  },
  {
    id: 'user-5',
    name: 'Michael Wilson',
    avatar: avatars.male[2],
    status: 'brb',
  },
  {
    id: 'user-6',
    name: 'Sarah Brown',
    avatar: avatars.female[2],
    status: 'offline',
    lastActive: '2 hours ago',
  },
];

const defaultMessages: Message[] = [
  {
    id: 'msg-1',
    senderId: 'user-2',
    content: 'Hi there! How are you doing?',
    timestamp: new Date(Date.now() - 3600000),
    reactions: { '👍': ['user-3'] },
  },
  {
    id: 'msg-2',
    senderId: 'user-1',
    content: "I'm good, thanks! How about you?",
    timestamp: new Date(Date.now() - 3500000),
    reactions: {},
    isUser: true,
  },
  {
    id: 'msg-3',
    senderId: 'user-2',
    content: "I'm doing well. Just working on that project we discussed.",
    timestamp: new Date(Date.now() - 3400000),
    reactions: { '❤️': ['user-1', 'user-4'] },
  },
  {
    id: 'msg-4',
    senderId: 'user-3',
    content: 'Hey team, just checking in. Any updates?',
    timestamp: new Date(Date.now() - 1800000),
    reactions: {},
  },
  {
    id: 'msg-5',
    senderId: 'user-1',
    content: 'Yes, I just finished the design mockups. Will share shortly.',
    timestamp: new Date(Date.now() - 1200000),
    reactions: { '👍': ['user-2', 'user-3'] },
    isUser: true,
  },
  {
    id: 'msg-6',
    senderId: 'user-4',
    content: 'Looking forward to seeing them!',
    timestamp: new Date(Date.now() - 900000),
    reactions: {},
  },
];

// Memoized User Avatar Component
const UserAvatar = memo(({ user, isSelected = false, size = 'md' }: { 
  user: User; 
  isSelected?: boolean;
  size?: 'sm' | 'md' | 'lg';
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10'
  };
  
  const dotSizeClasses = {
    sm: 'h-1.5 w-1.5',
    md: 'h-2.5 w-2.5',
    lg: 'h-3 w-3'
  };

  return (
    <div className="flex-shrink-0 relative">
      <img
        className={`${sizeClasses[size]} rounded-full ${isSelected ? 'ring-2 ring-indigo-500' : ''}`}
        src={user.avatar}
        alt={user.name}
        loading="lazy"
      />
      <span
        className={`absolute bottom-0 right-0 block ${dotSizeClasses[size]} rounded-full ring-2 ring-white ${statusColors[user.status]}`}
      />
    </div>
  );
});

UserAvatar.displayName = 'UserAvatar';

// Memoized Status Menu Component
const StatusMenu = memo(({ 
  showStatusMenu, 
  updateStatus,
  position = 'right'
}: { 
  showStatusMenu: boolean; 
  updateStatus: (status: UserStatus) => void;
  position?: 'left' | 'right';
}) => (
  <AnimatePresence>
    {showStatusMenu && (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className={`origin-top-right absolute ${position === 'right' ? 'right-0' : 'left-0'} mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10`}
      >
        <div className="px-4 py-2 text-sm text-gray-700 border-b">
          <div className="font-medium">Status</div>
        </div>
        {Object.entries(statusMessages).map(([status, label]) => (
          <button
            key={status}
            onClick={() => updateStatus(status as UserStatus)}
            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
          >
            <span className={`h-2 w-2 rounded-full mr-2 ${statusColors[status as UserStatus]}`} />
            {label}
          </button>
        ))}
      </motion.div>
    )}
  </AnimatePresence>
));

StatusMenu.displayName = 'StatusMenu';

// Memoized Reaction Menu Component
const ReactionMenu = memo(({ 
  messageId, 
  isUserMessage, 
  showReactionMenu, 
  handleReaction 
}: { 
  messageId: string; 
  isUserMessage: boolean; 
  showReactionMenu: string | null; 
  handleReaction: (messageId: string, emoji: string) => void 
}) => (
  showReactionMenu === messageId && (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className={`absolute ${isUserMessage ? 'left-0 bottom-8' : 'right-0 bottom-8'} bg-white rounded-full shadow-lg p-1 flex flex-wrap gap-1 z-10 max-w-[200px]`}
    >
      {quickStatuses.map((emoji) => (
        <button
          key={emoji}
          onClick={() => handleReaction(messageId, emoji)}
          className="p-1 rounded-full hover:bg-gray-100 text-lg"
        >
          {emoji}
        </button>
      ))}
    </motion.div>
  )
));

ReactionMenu.displayName = 'ReactionMenu';

// Memoized Message Component
const MessageItem = memo(({ 
  message, 
  users, 
  currentUserId, 
  showReactionMenu, 
  setShowReactionMenu, 
  handleReaction 
}: { 
  message: Message; 
  users: User[]; 
  currentUserId: string; 
  showReactionMenu: string | null; 
  setShowReactionMenu: (id: string | null) => void; 
  handleReaction: (messageId: string, emoji: string) => void 
}) => {
  const sender = users.find(u => u.id === message.senderId);
  const isUserMessage = message.senderId === currentUserId;
  
  return (
    <div className={`flex ${isUserMessage ? 'justify-end' : 'justify-start'}`}>
      <div className={`relative max-w-xs md:max-w-md px-4 py-2 rounded-lg shadow ${isUserMessage ? 'bg-indigo-600 text-white' : 'bg-white text-gray-800'}`}>
        {!isUserMessage && sender && (
          <div className="text-xs font-semibold text-gray-500 mb-1">
            {sender.name}
          </div>
        )}
        <div className="text-sm">{message.content}</div>
        <div className={`text-xs mt-1 flex items-center ${isUserMessage ? 'text-indigo-200' : 'text-gray-500'}`}>
          {formatTime(message.timestamp)}
          {isUserMessage && (
            <svg className="ml-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        {Object.keys(message.reactions).length > 0 && (
          <div className={`absolute -bottom-2 ${isUserMessage ? 'right-2' : 'left-2'} flex space-x-1`}>
            {Object.entries(message.reactions).map(([emoji, userIds]) => (
              <button
                key={emoji}
                onClick={() => handleReaction(message.id, emoji)}
                className={`text-xs px-1 py-0.5 rounded-full ${isUserMessage ? 'bg-indigo-700 text-white' : 'bg-gray-200 text-gray-700'} ${userIds.includes(currentUserId) ? 'ring-1 ring-offset-1 ring-indigo-400' : ''}`}
              >
                {emoji} {userIds.length > 1 ? userIds.length : ''}
              </button>
            ))}
          </div>
        )}
        <button
          onClick={() => setShowReactionMenu(showReactionMenu === message.id ? null : message.id)}
          className={`absolute -bottom-2 ${isUserMessage ? 'left-2' : 'right-2'} p-0.5 rounded-full bg-white shadow-md text-gray-500 hover:text-indigo-600`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
        <ReactionMenu 
          messageId={message.id} 
          isUserMessage={isUserMessage} 
          showReactionMenu={showReactionMenu} 
          handleReaction={handleReaction} 
        />
      </div>
    </div>
  );
});

MessageItem.displayName = 'MessageItem';

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).toUpperCase();
};

const formatDate = (date: Date) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  return date.toLocaleDateString();
};

const MessagingApp = () => {
  const [currentUser, setCurrentUser] = useState<User>({
    id: 'user-1',
    name: 'John Doe',
    avatar: avatars.male[0],
    status: 'online',
  });

  const [users] = useState<User[]>(defaultUsers);
  const [messages, setMessages] = useState<Message[]>(defaultMessages);
  const [isMounted, setIsMounted] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(users[0]);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showReactionMenu, setShowReactionMenu] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Close sidebar when clicking outside
  const sidebarRef = useRef<HTMLDivElement>(null);
  const sidebarButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showSidebar && 
          sidebarRef.current && 
          !sidebarRef.current.contains(event.target as Node) &&
          sidebarButtonRef.current &&
          !sidebarButtonRef.current.contains(event.target as Node)) {
        setShowSidebar(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSidebar]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Simulate typing indicators with optimized intervals
  useEffect(() => {
    const simulateTyping = () => {
      if (Math.random() > 0.5) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        if (randomUser.status === 'online' && randomUser.id !== currentUser.id) {
          setTypingUsers((prev) => {
            if (!prev.some((u) => u.userId === randomUser.id)) {
              return [...prev, { userId: randomUser.id, name: randomUser.name }];
            }
            return prev;
          });

          const typingDuration = 2000 + Math.random() * 3000;
          const typingTimeout = setTimeout(() => {
            setTypingUsers((prev) => prev.filter((u) => u.userId !== randomUser.id));

            if (Math.random() > 0.2) {
              const possibleMessages = [
                'Hello!',
                'How are you?',
                'Can we meet tomorrow?',
                'I have a question about the project.',
                'Thanks for your help!',
              ];
              setMessages((prev) => [
                ...prev,
                {
                  id: `msg-${Date.now()}`,
                  senderId: randomUser.id,
                  content: possibleMessages[Math.floor(Math.random() * possibleMessages.length)],
                  timestamp: new Date(),
                  reactions: {},
                },
              ]);
            }
          }, typingDuration);

          return () => clearTimeout(typingTimeout);
        }
      }
    };

    const interval = setInterval(simulateTyping, 8000);
    return () => clearInterval(interval);
  }, [users, currentUser.id]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  const handleSendMessage = useCallback(() => {
    if (newMessage.trim()) {
      const message: Message = {
        id: `msg-${Date.now()}`,
        senderId: currentUser.id,
        content: newMessage,
        timestamp: new Date(),
        reactions: {},
        isUser: true,
      };
      setMessages((prev) => [...prev, message]);
      setNewMessage('');
    }
  }, [newMessage, currentUser.id]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const handleReaction = useCallback((messageId: string, emoji: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId) {
          const newReactions = { ...msg.reactions };
          if (newReactions[emoji]) {
            if (newReactions[emoji].includes(currentUser.id)) {
              newReactions[emoji] = newReactions[emoji].filter((id) => id !== currentUser.id);
              if (newReactions[emoji].length === 0) {
                delete newReactions[emoji];
              }
            } else {
              newReactions[emoji] = [...newReactions[emoji], currentUser.id];
            }
          } else {
            newReactions[emoji] = [currentUser.id];
          }
          return { ...msg, reactions: newReactions };
        }
        return msg;
      })
    );
    setShowReactionMenu(null);
  }, [currentUser.id]);

  const updateStatus = useCallback((status: UserStatus) => {
    setCurrentUser((prev) => ({ ...prev, status }));
    setShowStatusMenu(false);
  }, []);

  const groupedMessages = useMemo(() => {
    return messages.reduce((acc, message) => {
      const dateKey = formatDate(message.timestamp);
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(message);
      return acc;
    }, {} as Record<string, Message[]>);
  }, [messages]);

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Head>
        <title>Professional Chat App</title>
        <meta name="description" content="Real-time messaging application" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                ref={sidebarButtonRef}
                onClick={() => setShowSidebar(!showSidebar)}
                className="md:hidden mr-2 inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              >
                <span className="sr-only">Open sidebar</span>
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="flex-shrink-0 flex items-center">
                <svg
                  className="h-8 w-8 text-indigo-600"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <span className="ml-2 text-xl font-semibold text-gray-900">ChatPro</span>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <div className="relative ml-3">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <button
                      onClick={() => setShowStatusMenu(!showStatusMenu)}
                      className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <span className="sr-only">Open user status menu</span>
                      <UserAvatar user={currentUser} />
                    </button>
                    <StatusMenu showStatusMenu={showStatusMenu} updateStatus={updateStatus} />
                  </div>
                  <div className="text-sm text-gray-500">
                    <div className="font-medium">{currentUser.name}</div>
                    <div className="text-xs">{statusMessages[currentUser.status]}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Mobile Overlay */}
        <AnimatePresence>
          {showSidebar && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black z-20 md:hidden"
                onClick={() => setShowSidebar(false)}
              />
              <motion.div
                ref={sidebarRef}
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg md:hidden"
              >
                <div className="flex flex-col h-full">
                  <div className="h-16 flex-shrink-0 flex items-center px-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Conversations</h2>
                    <button className="ml-auto inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                      New Chat
                    </button>
                  </div>
                  <div className="flex-1 flex flex-col overflow-y-auto">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg
                            className="h-5 w-5 text-gray-400"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <input
                          type="text"
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="Search"
                        />
                      </div>
                    </div>
                    <div className="px-4 py-2 border-b border-gray-200">
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Online</h3>
                    </div>
                    <nav className="flex-1 px-2 space-y-1">
                      {users
                        .filter((user) => user.status !== 'offline')
                        .map((user) => (
                          <button
                            key={user.id}
                            onClick={() => {
                              setSelectedUser(user);
                              setShowSidebar(false);
                            }}
                            className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full text-left ${
                              selectedUser?.id === user.id
                                ? 'bg-indigo-50 text-indigo-700'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                          >
                            <UserAvatar user={user} isSelected={selectedUser?.id === user.id} />
                            <div className="ml-3 overflow-hidden">
                              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                              <p className="text-xs text-gray-500 truncate">{statusMessages[user.status]}</p>
                            </div>
                            {typingUsers.some((u) => u.userId === user.id) && (
                              <div className="ml-auto flex items-center">
                                <div className="flex space-x-1">
                                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                </div>
                              </div>
                            )}
                          </button>
                        ))}
                      <div className="px-4 py-2 border-t border-gray-200">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Offline</h3>
                      </div>
                      {users
                        .filter((user) => user.status === 'offline')
                        .map((user) => (
                          <button
                            key={user.id}
                            onClick={() => {
                              setSelectedUser(user);
                              setShowSidebar(false);
                            }}
                            className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full text-left ${
                              selectedUser?.id === user.id
                                ? 'bg-indigo-50 text-indigo-700'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                          >
                            <UserAvatar user={user} isSelected={selectedUser?.id === user.id} />
                            <div className="ml-3 overflow-hidden">
                              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                              <p className="text-xs text-gray-500 truncate">{user.lastActive || 'Offline'}</p>
                            </div>
                          </button>
                        ))}
                    </nav>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Sidebar - Desktop */}
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
            <div className="h-16 flex-shrink-0 flex items-center px-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Conversations</h2>
              <button className="ml-auto inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                New Chat
              </button>
            </div>
            <div className="flex-1 flex flex-col overflow-y-auto">
              <div className="px-4 py-2 border-b border-gray-200">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Search"
                  />
                </div>
              </div>
              <div className="px-4 py-2 border-b border-gray-200">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Online</h3>
              </div>
              <nav className="flex-1 px-2 space-y-1">
                {users
                  .filter((user) => user.status !== 'offline')
                  .map((user) => (
                    <button
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full text-left ${
                        selectedUser?.id === user.id
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <UserAvatar user={user} isSelected={selectedUser?.id === user.id} />
                      <div className="ml-3 overflow-hidden">
                        <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{statusMessages[user.status]}</p>
                      </div>
                      {typingUsers.some((u) => u.userId === user.id) && (
                        <div className="ml-auto flex items-center">
                          <div className="flex space-x-1">
                            <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                <div className="px-4 py-2 border-t border-gray-200">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Offline</h3>
                </div>
                {users
                  .filter((user) => user.status === 'offline')
                  .map((user) => (
                    <button
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full text-left ${
                        selectedUser?.id === user.id
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <UserAvatar user={user} isSelected={selectedUser?.id === user.id} />
                      <div className="ml-3 overflow-hidden">
                        <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.lastActive || 'Offline'}</p>
                      </div>
                    </button>
                  ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex flex-col flex-1 overflow-hidden bg-white">
          {selectedUser ? (
            <>
              {/* Chat header */}
              <div className="h-16 flex-shrink-0 flex items-center px-4 border-b border-gray-200">
                <button
                  onClick={() => setShowSidebar(true)}
                  className="md:hidden mr-2 inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                >
                  <span className="sr-only">Open sidebar</span>
                  
                </button>
                <div className="flex items-center flex-1">
                  <UserAvatar user={selectedUser} size="md" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{selectedUser.name}</p>
                    <p className="text-xs text-gray-500">
                      {typingUsers.some((u) => u.userId === selectedUser.id)
                        ? 'typing...'
                        : statusMessages[selectedUser.status]}
                    </p>
                  </div>
                </div>
                <div className="ml-auto flex items-center">
                  <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    <svg
                      className="h-6 w-6"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </button>
                  <button className="ml-2 p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    <svg
                      className="h-6 w-6"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </button>
                  <div className="relative ml-2 md:hidden">
                    <button
                      onClick={() => setShowStatusMenu(!showStatusMenu)}
                      className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <span className="sr-only">Open user menu</span>
                      <UserAvatar user={currentUser} size="sm" />
                    </button>
                    <StatusMenu 
                      showStatusMenu={showStatusMenu} 
                      updateStatus={updateStatus}
                      position="left"
                    />
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="h-96 overflow-y-auto p-4 bg-gray-50">
                {Object.entries(groupedMessages).map(([date, dateMessages]) => (
                  <div key={date} className="mb-6">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center">
                        <span className="px-2 bg-gray-50 text-sm text-gray-500">{date}</span>
                      </div>
                    </div>
                    <div className="mt-4 space-y-3">
                      {dateMessages.map((message) => (
                        <MessageItem
                          key={message.id}
                          message={message}
                          users={users}
                          currentUserId={currentUser.id}
                          showReactionMenu={showReactionMenu}
                          setShowReactionMenu={setShowReactionMenu}
                          handleReaction={handleReaction}
                        />
                      ))}
                    </div>
                  </div>
                ))}
                {typingUsers.length > 0 && (
                  <div className="flex justify-start">
                    <div className="relative max-w-xs md:max-w-md px-4 py-2 rounded-lg shadow bg-white text-gray-800">
                      <div className="text-xs font-semibold text-gray-500 mb-1">
                        {typingUsers.map((u) => u.name).join(', ')}
                      </div>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message input */}
              <div className="h-20 flex-shrink-0 border-t border-gray-200 px-4 py-3 bg-white">
                <div className="flex items-center space-x-2">
                  <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    <svg
                      className="h-6 w-6"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                      />
                    </svg>
                  </button>
                  <div className="flex-1 relative">
                    <textarea
                      className="block w-full min-h-[56px] max-h-32 rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm resize-none py-2 px-3"
                      placeholder="Type a message"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      rows={1}
                    />
                    <div className="absolute right-2 bottom-2 flex space-x-1">
                      <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none">
                        <svg
                          className="h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className={`p-2 rounded-full ${
                      newMessage.trim() ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center p-4">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No conversation selected</h3>
                <p className="mt-1 text-sm text-gray-500">Select a user from the sidebar to start chatting</p>
                <button
                  onClick={() => setShowSidebar(true)}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 md:hidden"
                >
                  Open Contacts
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center">
              <svg
                className="h-6 w-6 text-indigo-600"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <span className="ml-2 text-lg font-semibold text-gray-900">ChatPro</span>
            </div>
            <div className="mt-2 md:mt-0">
              <p className="text-center text-xs md:text-sm text-gray-500">
                &copy; {new Date().getFullYear()} ChatPro. All rights reserved.
              </p>
            </div>
            <div className="mt-2 md:mt-0 flex space-x-4 md:space-x-6">
              <a href="#" className="text-xs md:text-sm text-gray-400 hover:text-gray-500">
                Privacy
              </a>
              <a href="#" className="text-xs md:text-sm text-gray-400 hover:text-gray-500">
                Terms
              </a>
              <a href="#" className="text-xs md:text-sm text-gray-400 hover:text-gray-500">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MessagingApp;