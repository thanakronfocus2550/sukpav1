'use client';

import { useState, useEffect } from 'react';
import {
  Store,
  Plus,
  Phone,
  MapPin,
  CheckCircle2,
  XCircle,
  Edit2,
  Save,
  AlertCircle,
  RefreshCw,
  Clock,
} from 'lucide-react';
import { Partner } from '@/lib/types';

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/partners');
      const data = await res.json();
      if (data.success) {
        setPartners(data.partners);
      }
    } catch (err) {
      console.error('Error fetching partners:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const openAddModal = () => {
    setEditingPartner(null);
    setName('');
    setOwnerName('');
    setPhone('');
    setAddress('');
    setNotes('');
    setErrorMsg('');
    setShowAddModal(true);
  };

  const openEditModal = (p: Partner) => {
    setEditingPartner(p);
    setName(p.name);
    setOwnerName(p.owner_name);
    setPhone(p.phone);
    setAddress(p.address);
    setNotes(p.notes || '');
    setErrorMsg('');
    setShowAddModal(true);
  };

  const handleSavePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !ownerName.trim() || !phone.trim()) {
      setErrorMsg('กรุณากรอกข้อมูลสำคัญให้ครบถ้วน');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      if (editingPartner) {
        // Edit
        const res = await fetch('/api/partners', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingPartner.id,
            updates: {
              name: name.trim(),
              owner_name: ownerName.trim(),
              phone: phone.trim(),
              address: address.trim(),
              notes: notes.trim(),
            },
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error);
      } else {
        // Create
        const res = await fetch('/api/partners', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            owner_name: ownerName.trim(),
            phone: phone.trim(),
            address: address.trim(),
            notes: notes.trim(),
            commission_rate: 5.0,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error);
      }

      setShowAddModal(false);
      await fetchPartners();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePartnerStatus = async (p: Partner) => {
    try {
      await fetch('/api/partners', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: p.id,
          updates: { is_active: !p.is_active },
        }),
      });
      await fetchPartners();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            จัดการร้านพาร์ทเนอร์ (Partner Management)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            ร้านซักอบรีดพาร์ทเนอร์ในเครือข่ายรอบ มจพ. ปราจีนบุรี (ค่าตอบแทนมาตรฐาน 5 บ./ตะกร้า)
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-cute-button transition-all self-start"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มร้านพาร์ทเนอร์</span>
        </button>
      </div>

      {/* Partners List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {partners.map((p) => (
          <div
            key={p.id}
            className={`bg-white rounded-3xl p-6 border shadow-sm space-y-4 transition-all flex flex-col justify-between ${
              p.is_active ? 'border-slate-200/80 hover:border-sky-300' : 'border-slate-200 opacity-60 bg-slate-50'
            }`}
          >
            <div className="space-y-3">
              {/* Partner Status Badge */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                    p.is_active
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {p.is_active ? 'เปิดให้บริการ (Active)' : 'ระงับชั่วคราว (Inactive)'}
                </span>

                <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-lg border border-sky-200">
                  ฿{p.commission_rate || 5.0} / ตะกร้า
                </span>
              </div>

              {/* Shop Name & Owner */}
              <div>
                <h3 className="text-lg font-bold text-slate-900">{p.name}</h3>
                <p className="text-xs text-slate-500">เจ้าของร้าน: <strong>{p.owner_name}</strong></p>
              </div>

              {/* Contact Info */}
              <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                  <span className="font-mono">{p.phone}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-sky-500 shrink-0 mt-0.5" />
                  <span>{p.address || 'ไม่ได้ระบุที่อยู่'}</span>
                </div>
              </div>

              {/* Notes */}
              {p.notes && (
                <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {p.notes}
                </p>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => openEditModal(p)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-sky-600 hover:bg-slate-100 flex items-center gap-1 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>แก้ไข</span>
              </button>

              <button
                onClick={() => togglePartnerStatus(p)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  p.is_active
                    ? 'text-rose-600 hover:bg-rose-50'
                    : 'text-emerald-600 hover:bg-emerald-50'
                }`}
              >
                {p.is_active ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Partner Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSavePartner}
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4 animate-in zoom-in-95"
          >
            <h3 className="text-lg font-black text-slate-900">
              {editingPartner ? 'แก้ไขข้อมูลร้านพาร์ทเนอร์' : 'เพิ่มร้านพาร์ทเนอร์ใหม่'}
            </h3>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ชื่อร้านพาร์ทเนอร์ <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="เช่น ร้านซักอบฟองสบู่ (สาขาหน้า มจพ.)"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ชื่อเจ้าของร้าน <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="เช่น ป้าสมศรี"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  เบอร์โทรศัพท์ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08X-XXX-XXXX"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ที่อยู่ร้าน
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="เช่น 123 หมู่ 6 ต.เนินหอม (ตรงข้ามประตู 1 มจพ.)"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                รายละเอียดเพิ่มเติม
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="เช่น มีเครื่องซัก 10 เครื่อง อบ 6 เครื่อง, รับงานซักผ้านวม"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-sm"
              >
                {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
