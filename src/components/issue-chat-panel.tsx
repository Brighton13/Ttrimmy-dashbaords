import { sendIssueMessageAction } from "@/app/actions/issues";
import { ActionModal } from "@/components/action-modal";

type ChatParticipant = {
  id: string;
  name: string;
  role?: string;
};

type ChatMessage = {
  id: string;
  body: string;
  createdAt: Date;
  sender?: ChatParticipant | null;
};

type ChatIssue = {
  id: string;
  reference: string;
  assignedToId: string | null;
  student?: ChatParticipant | null;
  assignee?: ChatParticipant | null;
  messages?: ChatMessage[] | null;
};

export function IssueChatPanel({
  issue,
  currentUserId,
  returnPath,
}: {
  issue: ChatIssue;
  currentUserId: string;
  returnPath: string;
}) {
  const counterpart = issue.student?.id === currentUserId ? issue.assignee : issue.student;

  if (!issue.assignedToId || !counterpart) {
    return <span className="text-sm text-slate-600">Chat opens after assignment</span>;
  }

  return (
    <ActionModal
      description={`Direct conversation with ${counterpart.name} for ${issue.reference}.`}
      title={`Chat on ${issue.reference}`}
      triggerLabel="Chat"
    >
      <div className="grid gap-4">
        <div className="max-h-80 space-y-3 overflow-y-auto rounded-[20px] border border-slate-200 bg-slate-50 p-4">
          {issue.messages && issue.messages.length > 0 ? (
            issue.messages.map((message) => {
              const isCurrentUser = message.sender?.id === currentUserId;

              return (
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                    isCurrentUser
                      ? "ml-auto bg-slate-900 text-white"
                      : "bg-white text-slate-700 ring-1 ring-slate-200"
                  }`}
                  key={message.id}
                >
                  <div className={`text-xs font-semibold ${isCurrentUser ? "text-slate-200" : "text-slate-500"}`}>
                    {message.sender?.name ?? "Unknown sender"}
                  </div>
                  <p className="mt-2 whitespace-pre-wrap leading-6">{message.body}</p>
                  <div className={`mt-2 text-[11px] ${isCurrentUser ? "text-slate-300" : "text-slate-400"}`}>
                    {message.createdAt.toLocaleString()}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-slate-500">No messages yet. Start the conversation here.</p>
          )}
        </div>
        <form action={sendIssueMessageAction} className="grid gap-3">
          <input name="issueId" type="hidden" value={issue.id} />
          <input name="returnPath" type="hidden" value={returnPath} />
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor={`chat-message-${issue.id}`}>
              Message
            </label>
            <textarea
              className="field-input min-h-28"
              id={`chat-message-${issue.id}`}
              name="body"
              placeholder={`Write a message to ${counterpart.name}`}
              required
            />
          </div>
          <button className="primary-button" type="submit">
            Send message
          </button>
        </form>
      </div>
    </ActionModal>
  );
}