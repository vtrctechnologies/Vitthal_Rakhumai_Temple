import React, { useState, useEffect } from "react";
import {
  Users,
  Mail,
  Phone,
  Calendar,
  Search,
  Download,
  Loader2,
  RefreshCw,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  CheckCircle2,
  Save,
} from "lucide-react";
import { subscriberAPI } from "../../services/api";

const SubscribersView = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [btnSettings, setBtnSettings] = useState({
    isVisible: true,
    isDisabled: true,
    disabledMessage: "Temporarily Disabled",
    disabledMessageMr: "तात्पुरते बंद आहे",
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSavedMsg, setSettingsSavedMsg] = useState("");

  useEffect(() => {
    fetchSubscribers();
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await subscriberAPI.getSettings();
      if (res?.status === "success" && res.data) {
        setBtnSettings({
          isVisible: res.data.isVisible !== false,
          isDisabled: res.data.isDisabled !== false,
          disabledMessage: res.data.disabledMessage || "Temporarily Disabled",
          disabledMessageMr: res.data.disabledMessageMr || "तात्पुरते बंद आहे",
        });
      }
    } catch (error) {
      console.error("Error fetching subscriber button settings:", error);
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    setSettingsSavedMsg("");
    try {
      const res = await subscriberAPI.updateSettings(btnSettings);
      if (res?.status === "success") {
        setSettingsSavedMsg("Website Subscribe Now button settings saved!");
        setTimeout(() => setSettingsSavedMsg(""), 3500);
      }
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setSavingSettings(false);
    }
  };

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const response = await subscriberAPI.getSubscribers();
      if (response && response.status === "success") {
        setSubscribers(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error("Error fetching subscribers:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSubscribers();
  };

  const filteredSubscribers = subscribers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.phone.includes(searchTerm)
  );

  const exportToCSV = () => {
    const headers = ["Name", "Email", "Phone", "Subscribed On"];
    const data = filteredSubscribers.map((s) => [
      s.name,
      s.email,
      s.phone,
      new Date(s.createdAt).toLocaleDateString(),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...data].map((e) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `subscribers_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-heading-temple font-bold text-[#6b1a1a]">
            Subscriber List
          </h2>
          <p className="text-sm text-[#8b5e3c] mt-1">
            View and manage your newsletter subscribers and footer button controls.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2.5 rounded-xl border border-[#d4af37]/40 bg-[#fffdf8] text-[#5c3317] hover:text-[#6b1a1a] hover:bg-[#f5e6c8]/60 transition-all cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={exportToCSV}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-[#fffaf0] text-[#6b1a1a] border border-[#d4af37]/60 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#d4af37]/15 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#e8650a]" /> Export CSV
          </button>
        </div>
      </div>

      {/* Subscribe Now Button Controls */}
      <div className="temple-card p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-[#d4af37]/25">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#6b1a1a] font-heading-temple">
              Website &ldquo;Subscribe Now&rdquo; Button Control
            </h3>
            <p className="text-xs sm:text-sm text-[#8b5e3c] mt-0.5">
              Control whether the Subscribe Now button is shown in the website footer and whether it is active or temporarily disabled.
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold self-start sm:self-auto ${
              !btnSettings.isVisible
                ? "bg-gray-100 text-gray-600 border border-gray-200"
                : btnSettings.isDisabled
                ? "bg-amber-50 text-amber-800 border border-amber-200"
                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
            }`}
          >
            {!btnSettings.isVisible
              ? "Hidden on Website"
              : btnSettings.isDisabled
              ? "Temporarily Disabled"
              : "Active & Accepting Subscribers"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <button
            type="button"
            onClick={() =>
              setBtnSettings((prev) => ({ ...prev, isVisible: !prev.isVisible }))
            }
            className={`flex items-center justify-between gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
              btnSettings.isVisible
                ? "bg-[#fef6e4] border-[#d4af37]/65 text-[#6b1a1a]"
                : "bg-[#f5e6c8]/40 border-[#d4af37]/35 text-[#5c3317]"
            }`}
          >
            <div className="flex items-center gap-3 text-left min-w-0">
              {btnSettings.isVisible ? (
                <Eye size={20} className="text-[#e8650a] shrink-0" />
              ) : (
                <EyeOff size={20} className="text-[#8b5e3c] shrink-0" />
              )}
              <div className="min-w-0">
                <p className="text-sm font-bold truncate">Footer Visibility</p>
                <p className="text-xs text-[#8b5e3c] truncate">
                  {btnSettings.isVisible
                    ? "Button is visible in Footer"
                    : "Button is hidden from Footer"}
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-[#fffdf8] border border-[#d4af37]/45 text-[#6b1a1a] shrink-0">
              {btnSettings.isVisible ? "Show" : "Hide"}
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              setBtnSettings((prev) => ({
                ...prev,
                isDisabled: !prev.isDisabled,
              }))
            }
            className={`flex items-center justify-between gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
              btnSettings.isDisabled
                ? "bg-amber-50/75 border-amber-300/80 text-amber-950"
                : "bg-emerald-50/75 border-emerald-300/80 text-emerald-950"
            }`}
          >
            <div className="flex items-center gap-3 text-left min-w-0">
              {btnSettings.isDisabled ? (
                <Lock size={20} className="text-amber-700 shrink-0" />
              ) : (
                <Unlock size={20} className="text-emerald-700 shrink-0" />
              )}
              <div className="min-w-0">
                <p className="text-sm font-bold truncate">Subscription State</p>
                <p className="text-xs opacity-75 truncate">
                  {btnSettings.isDisabled
                    ? "Temporarily disabled (button locked)"
                    : "Enabled (modal opens on click)"}
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-[#fffdf8] border border-current/25 shrink-0">
              {btnSettings.isDisabled ? "Disabled" : "Enabled"}
            </span>
          </button>
        </div>

        {btnSettings.isDisabled && btnSettings.isVisible && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-[#5c3317] mb-1">
                Disabled Badge Text (English)
              </label>
              <input
                type="text"
                value={btnSettings.disabledMessage}
                onChange={(e) =>
                  setBtnSettings((prev) => ({
                    ...prev,
                    disabledMessage: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 rounded-xl border border-[#d4af37]/40 bg-[#fffaf0] text-sm text-[#2c1a0e] outline-none focus:border-[#e8650a]"
                placeholder="Temporarily Disabled"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#5c3317] mb-1">
                Disabled Badge Text (Marathi)
              </label>
              <input
                type="text"
                value={btnSettings.disabledMessageMr}
                onChange={(e) =>
                  setBtnSettings((prev) => ({
                    ...prev,
                    disabledMessageMr: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 rounded-xl border border-[#d4af37]/40 bg-[#fffaf0] text-sm text-[#2c1a0e] outline-none focus:border-[#e8650a]"
                placeholder="तात्पुरते बंद आहे"
              />
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            {settingsSavedMsg && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                <CheckCircle2 size={15} /> {settingsSavedMsg}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleSaveSettings}
            disabled={savingSettings}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6b1a1a] to-[#4a0f0f] text-[#fef6e4] text-sm font-semibold border border-[#d4af37]/40 hover:from-[#7c1f1f] hover:to-[#5a1515] transition-all cursor-pointer disabled:opacity-60"
          >
            {savingSettings ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            <span>{savingSettings ? "Saving..." : "Save Button Settings"}</span>
          </button>
        </div>
      </div>

      {/* Stats & Search */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 items-stretch">
        <div className="temple-card p-5 flex items-center gap-4">
          <div className="p-3 bg-[#6b1a1a]/10 border border-[#d4af37]/35 text-[#6b1a1a] rounded-xl shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#8b5e3c]">
              Total Subscribers
            </p>
            <h4 className="text-2xl font-bold text-[#6b1a1a] font-heading-temple mt-0.5">
              {subscribers.length}
            </h4>
          </div>
        </div>

        <div className="sm:col-span-2 temple-card px-4 py-3.5 flex items-center gap-3 focus-within:border-[#e8650a] focus-within:ring-2 focus-within:ring-[#d4af37]/25">
          <Search className="text-[#8b5e3c] w-5 h-5 shrink-0" />
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent outline-none text-sm sm:text-base text-[#2c1a0e] placeholder-[#8b5e3c]/60 font-medium"
          />
        </div>
      </div>

      {/* Subscribers List */}
      <div className="temple-card overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-[#8b5e3c]">
            <Loader2 className="w-8 h-8 animate-spin text-[#6b1a1a]" />
            <p className="text-sm font-medium">Loading subscribers...</p>
          </div>
        ) : filteredSubscribers.length === 0 ? (
          <div className="py-16 px-6 text-center text-[#8b5e3c]">
            <Users size={44} className="mx-auto mb-3 opacity-25 text-[#6b1a1a]" />
            <p className="text-base font-semibold text-[#6b1a1a] font-heading-temple">
              No Subscribers Found
            </p>
            <p className="text-xs sm:text-sm mt-1">
              {searchTerm
                ? "Try adjusting your search query."
                : "Verified newsletter subscribers will appear here."}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Stacked Cards */}
            <div className="sm:hidden divide-y divide-[#d4af37]/20">
              {filteredSubscribers.map((subscriber) => (
                <div key={subscriber._id} className="p-4 space-y-2.5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#6b1a1a]/10 border border-[#d4af37]/35 text-[#6b1a1a] flex items-center justify-center font-bold text-sm font-heading-temple shrink-0">
                      {subscriber.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-[#2c1a0e] truncate">
                        {subscriber.name}
                      </p>
                      <p className="text-xs text-[#8b5e3c]">Verified Subscriber</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs text-[#5c3317] pl-12">
                    <div className="flex items-center gap-2 truncate">
                      <Mail size={13} className="text-[#8b5e3c] shrink-0" />
                      <span className="truncate">{subscriber.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={13} className="text-[#8b5e3c] shrink-0" />
                      <span>{subscriber.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#8b5e3c]">
                      <Calendar size={13} className="shrink-0" />
                      <span>
                        {new Date(subscriber.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tablet & Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f5e6c8]/55 border-b border-[#d4af37]/30">
                    <th className="px-6 py-3.5 text-xs font-bold text-[#5c3317] uppercase tracking-wider">
                      Subscriber Info
                    </th>
                    <th className="px-6 py-3.5 text-xs font-bold text-[#5c3317] uppercase tracking-wider">
                      Contact Details
                    </th>
                    <th className="px-6 py-3.5 text-xs font-bold text-[#5c3317] uppercase tracking-wider">
                      Subscribed On
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#d4af37]/20">
                  {filteredSubscribers.map((subscriber) => (
                    <tr
                      key={subscriber._id}
                      className="hover:bg-[#fef6e4]/70 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#6b1a1a]/10 border border-[#d4af37]/35 text-[#6b1a1a] flex items-center justify-center font-bold text-base font-heading-temple shrink-0">
                            {subscriber.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-[#2c1a0e] leading-none mb-1">
                              {subscriber.name}
                            </p>
                            <p className="text-xs text-[#8b5e3c]">Verified User</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-[#5c3317]">
                            <Mail size={14} className="text-[#8b5e3c]" />
                            {subscriber.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-[#5c3317]">
                            <Phone size={14} className="text-[#8b5e3c]" />
                            {subscriber.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-[#5c3317] font-medium">
                          <Calendar size={14} className="text-[#8b5e3c]" />
                          {new Date(subscriber.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SubscribersView;
