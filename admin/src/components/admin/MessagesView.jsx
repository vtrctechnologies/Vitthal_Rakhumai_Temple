import React, { useState, useEffect } from "react";
import {
  Mail,
  Phone,
  Calendar,
  Search,
  Trash2,
  Loader2,
  RefreshCw,
  User,
  MessageSquare,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { contactAPI } from "../../services/api";
import Swal from "sweetalert2";

const MessagesView = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await contactAPI.getMessages();
      const messagesList = response?.data || (Array.isArray(response) ? response : []);
      if (Array.isArray(messagesList)) {
        setMessages(messagesList);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMessages();
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await contactAPI.deleteMessage(id);
        setMessages(messages.filter((m) => m._id !== id));
        if (selectedMessage?._id === id) setSelectedMessage(null);
        Swal.fire("Deleted!", "Message has been deleted.", "success");
      } catch (error) {
        Swal.fire("Error!", "Failed to delete message.", "error");
      }
    }
  };

  const filteredMessages = messages.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-gray-900">
            Contact Messages
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Read and manage queries from visitors
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 text-gray-400 hover:text-primary hover:bg-primary/10 px-4 py-2 rounded-lg transition-all"
        >
          <RefreshCw className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-100 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <MessageSquare size={32} className="mx-auto mb-2 opacity-20" />
                <p className="text-xs">No messages found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {filteredMessages.map((msg) => (
                  <div
                    key={msg._id}
                    onClick={() => setSelectedMessage(msg)}
                    className={`p-4 cursor-pointer transition-all hover:bg-gray-50 ${
                      selectedMessage?._id === msg._id
                        ? "bg-primary/5 border-l-4 border-primary"
                        : "border-l-4 border-transparent"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-gray-900 text-sm truncate pr-2">
                        {msg.subject}
                      </h4>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap">
                        {new Date(msg.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate mb-2">{msg.name}</p>
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full ${
                          msg.status === "read"
                            ? "bg-gray-100 text-gray-500"
                            : "bg-blue-50 text-blue-600 font-medium"
                        }`}
                      >
                        {msg.status}
                      </span>
                      <ChevronRight size={14} className="text-gray-300" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Message Content */}
        <div className="lg:col-span-2">
          {selectedMessage ? (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
              {/* Message Header */}
              <div className="p-6 border-b border-gray-50 bg-gray-50/30">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {selectedMessage.subject}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Calendar size={12} />
                      {new Date(selectedMessage.createdAt).toLocaleString("en-IN", {
                        dateStyle: "long",
                        timeStyle: "short",
                      })}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(selectedMessage._id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    title="Delete Message"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
                    <div className="p-2 bg-primary/10 rounded-full text-primary">
                      <User size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                        From
                      </p>
                      <p className="text-sm font-bold text-gray-800">
                        {selectedMessage.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
                    <div className="p-2 bg-blue-50 rounded-full text-blue-500">
                      <Mail size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                        Email
                      </p>
                      <p className="text-sm font-bold text-gray-800">
                        {selectedMessage.email}
                      </p>
                    </div>
                  </div>
                  {selectedMessage.phone && (
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
                      <div className="p-2 bg-green-50 rounded-full text-green-500">
                        <Phone size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                          Phone
                        </p>
                        <p className="text-sm font-bold text-gray-800">
                          {selectedMessage.phone}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Message Body */}
              <div className="p-8 min-h-[300px]">
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-2 bg-primary/5 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-primary" />
                  </div>
                  <h4 className="font-bold text-gray-900">Message Content</h4>
                </div>
                <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 whitespace-pre-wrap text-gray-700 leading-relaxed shadow-inner">
                  {selectedMessage.message}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 border-dashed py-32 flex flex-col items-center justify-center text-gray-400">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Mail size={32} className="opacity-20" />
              </div>
              <p className="font-medium">Select a message to read</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesView;
