"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useUser } from "@clerk/nextjs";

export default function Home() {
  const { user } = useUser();

  const createUser = useMutation(api.users.createUser);
  const createConversation = useMutation(
    api.conversations.createOrGetConversation
  );
  const sendMessage = useMutation(api.messages.sendMessage);

  const users = useQuery(api.users.getUsers);

  const [activeConversation, setActiveConversation] = useState<any>(null);
  const [input, setInput] = useState("");

  // Create user in Convex when Clerk user loads
  useEffect(() => {
    if (!user) return;

    createUser({
      clerkId: user.id,
      email: user.primaryEmailAddress?.emailAddress || "",
      name: user.fullName || "No Name",
    });
  }, [user, createUser]);

  // Find current Convex user
  const currentUser = users?.find((u) => u.clerkId === user?.id);

  // Get messages (skip if no conversation)
  const messages = useQuery(
    api.messages.getMessages,
    activeConversation
      ? { conversationId: activeConversation._id }
      : "skip"
  );

  const handleUserClick = async (selectedUser: any) => {
    if (!currentUser) return;

    const conversation = await createConversation({
      userId1: currentUser._id,
      userId2: selectedUser._id,
    });

    setActiveConversation(conversation);
  };

  const handleSend = async () => {
    if (!input.trim() || !activeConversation || !currentUser) return;

    await sendMessage({
      conversationId: activeConversation._id,
      senderId: currentUser._id,
      content: input,
    });

    setInput("");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>All Users:</h2>

      {users?.map((u) => (
        <div
          key={u._id}
          onClick={() => handleUserClick(u)}
          style={{
            border: "1px solid gray",
            padding: 10,
            marginBottom: 5,
            cursor: "pointer",
          }}
        >
          {u.name} — {u.email}
        </div>
      ))}

      <h2>Chat</h2>

      <div
        style={{
          minHeight: 200,
          border: "1px solid gray",
          padding: 10,
          marginBottom: 10,
        }}
      >
        {messages?.map((msg) => {
          const sender = users?.find((u) => u._id === msg.senderId);

          return (
            <div key={msg._id}>
              <strong>{sender?.name || "Unknown"}:</strong> {msg.content}
            </div>
          );
        })}
      </div>

      {activeConversation && (
        <div>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type message..."
          />
          <button onClick={handleSend}>Send</button>
        </div>
      )}
    </div>
  );
}
