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
          <h2 className="text-2xl font-display font-bold text-gray-900">
            Subscriber List
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            View and manage your newsletter subscribers
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
            title="Refresh"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-green-50 text-green-700 border border-green-200 px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-100 transition-all"
          >
            <Download className="w-4 h-4" /> Export CSV
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <button
            type="button"
            onClick={() =>
              setBtnSettings((prev) => ({ ...prev, isVisible: !prev.isVisible }))
            }
            className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${
              btnSettings.isVisible
                ? "bg-[#fef6e4] border-[#d4af37]/60 text-[#6b1a1a]"
                : "bg-gray-50 border-gray-200 text-gray-600"
            }`}
          >
            <div className="flex items-center gap-3 text-left">
              {btnSettings.isVisible ? (
                <Eye size={20} className="text-[#e8650a]" />
              ) : (
                <EyeOff size={20} className="text-gray-400" />
              )}
              <div>
                <p className="text-sm font-bold">Footer Visibility</p>
                <p className="text-xs text-[#8b5e3c]">
                  {btnSettings.isVisible
                    ? "Button is visible in Footer"
                    : "Button is hidden from Footer"}
                </p>
              </div>
            </div>
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-white border border-[#d4af37]/40">
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
            className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${
              btnSettings.isDisabled
                ? "bg-amber-50/70 border-amber-300 text-amber-900"
                : "bg-emerald-50/70 border-emerald-300 text-emerald-900"
            }`}
          >
            <div className="flex items-center gap-3 text-left">
              {btnSettings.isDisabled ? (
                <Lock size={20} className="text-amber-700" />
              ) : (
                <Unlock size={20} className="text-emerald-700" />
              )}
              <div>
                <p className="text-sm font-bold">Subscription State</p>
                <p className="text-xs opacity-75">
                  {btnSettings.isDisabled
                    ? "Temporarily disabled (button locked)"
                    : "Enabled (modal opens on click)"}
                </p>
              </div>
            </div>
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-white border border-current/20">
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

        <div className="flex flex-wrap items-center justify-between gap-3">
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
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6b1a1a] to-[#4a0f0f] text-[#fef6e4] text-sm font-semibold border border-[#d4af37]/40 hover:from-[#7c1f1f] hover:to-[#5a1515] transition-all cursor-pointer disabled:opacity-60"
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Subscribers</p>
            <h4 className="text-2xl font-bold text-gray-900">{subscribers.length}</h4>
          </div>
        </div>

        <div className="md:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredSubscribers.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            <Users size={48} className="mx-auto mb-4 opacity-20" />
            <p>No subscribers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Subscriber Info
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Contact Details
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Subscribed On
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredSubscribers.map((subscriber) => (
                  <tr
                    key={subscriber._id}
                    className="hover:bg-gray-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                          {subscriber.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 leading-none mb-1">
                            {subscriber.name}
                          </p>
                          <p className="text-xs text-gray-400">Verified User</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail size={14} className="text-gray-400" />
                          {subscriber.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone size={14} className="text-gray-400" />
                          {subscriber.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                        <Calendar size={14} className="text-gray-400" />
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
        )}
      </div>
    </div>
  );
};

export default SubscribersView;
