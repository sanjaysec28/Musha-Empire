/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, UserCheck, UserX, UserMinus, Calendar, Clock, 
  Plus, Edit, Trash2, Upload, Sparkles, AlertCircle, 
  DollarSign, Check, ChevronRight, X, Briefcase, Award 
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { STYLISTS_DATA } from '../../data/salonData';
import { 
  parseStaffBio, serializeStaffBio, isStaffOnLeave, isStaffWorking, StaffMetadata 
} from '../../lib/staffHelpers';
import Button from '../ui/Button';
import Card from '../ui/Card';

interface StaffManagementProps {
  id: string;
  triggerToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, description?: string) => void;
}

interface DBStaff {
  id: string;
  profile_id?: string;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  is_active: boolean;
  is_available: boolean;
  employee_code: string;
  image_url?: string;
  bio?: string;
  specialty?: string;
  created_at?: string;
}

export default function StaffManagement({ id, triggerToast }: StaffManagementProps) {
  const [staffList, setStaffList] = useState<DBStaff[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingStaff, setEditingStaff] = useState<DBStaff | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Form states
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [employeeCode, setEmployeeCode] = useState<string>('');
  const [specialty, setSpecialty] = useState<string>('');
  const [role, setRole] = useState<string>('stylist');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Metadata/Schedule Form states
  const [bioText, setBioText] = useState<string>('');
  const [workingDays, setWorkingDays] = useState<string[]>(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('18:00');
  const [lunchBreak, setLunchBreak] = useState<string>('13:00-14:00');
  const [weeklyOff, setWeeklyOff] = useState<string[]>(['Saturday', 'Sunday']);
  const [leaves, setLeaves] = useState<any[]>([]);

  // New leave form states
  const [newLeaveType, setNewLeaveType] = useState<'Sick Leave' | 'Vacation' | 'Emergency Leave' | 'Training'>('Vacation');
  const [newLeaveStart, setNewLeaveStart] = useState<string>('');
  const [newLeaveEnd, setNewLeaveEnd] = useState<string>('');

  // Fetch staff and bookings from Supabase
  const fetchData = async () => {
    if (!isSupabaseConfigured) {
      try {
        const localSaved = localStorage.getItem('musha_local_staff');
        if (localSaved) {
          setStaffList(JSON.parse(localSaved));
        } else {
          const defaultStaffList: DBStaff[] = STYLISTS_DATA.map((s, idx) => ({
            id: s.id,
            full_name: s.name,
            email: `${s.name.toLowerCase().replace(/\s+/g, '.')}@mushaempire.com`,
            phone: `+1 (555) 010-000${idx + 1}`,
            role: 'stylist',
            is_active: true,
            is_available: true,
            employee_code: `EMP-${1000 + idx}`,
            image_url: s.image,
            bio: s.bio,
            specialty: s.specialty,
            created_at: new Date().toISOString()
          }));
          setStaffList(defaultStaffList);
          localStorage.setItem('musha_local_staff', JSON.stringify(defaultStaffList));
        }
        setBookings([]);
      } catch (err) {
        console.warn('Notice restoring local staff registry:', err);
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      setLoading(true);
      const { data: staffData, error: staffErr } = await supabase
        .from('staff')
        .select('*')
        .order('created_at', { ascending: false });

      if (staffErr) throw staffErr;
      setStaffList(staffData || []);

      const { data: bookingData, error: bookingErr } = await supabase
        .from('bookings')
        .select('*');

      if (bookingErr) throw bookingErr;
      setBookings(bookingData || []);
    } catch (err: any) {
      console.warn('Notice fetching staff data:', err);
      triggerToast('error', 'Fetch Notice', err.message || 'Could not synchronize staff lists with Supabase.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    if (!isSupabaseConfigured) return;

    // Subscribe to real-time updates for staff table
    const channel = supabase
      .channel('staff_mgmt_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'staff' }, () => {
        fetchData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Compute Statistics
  const stats = (() => {
    const total = staffList.length;
    const active = staffList.filter(s => s.is_active).length;
    
    // Check available staff today
    const todayStr = new Date().toISOString().split('T')[0];
    const available = staffList.filter(s => {
      if (!s.is_active || !s.is_available) return false;
      const meta = parseStaffBio(s.bio || '');
      const onLeave = isStaffOnLeave(meta.leaves, todayStr);
      const workingToday = isStaffWorking(meta, todayStr);
      return !onLeave && workingToday;
    }).length;

    const onLeaveCount = staffList.filter(s => {
      const meta = parseStaffBio(s.bio || '');
      return isStaffOnLeave(meta.leaves, todayStr);
    }).length;

    // Today's appointments count
    const todayApps = bookings.filter(b => {
      if (!b.booking_date) return false;
      const bDate = b.booking_date.split('T')[0];
      return bDate === todayStr && b.status !== 'cancelled';
    }).length;

    // Total revenue generated
    const revenue = bookings
      .filter(b => b.status !== 'cancelled')
      .reduce((sum, b) => sum + (parseFloat(b.total_amount) || 0), 0);

    return {
      total,
      active,
      available,
      onLeave: onLeaveCount,
      todayApps,
      revenue
    };
  })();

  // Open modal for editing or adding
  const handleOpenModal = (staff: DBStaff | null) => {
    setEditingStaff(staff);
    if (staff) {
      setFullName(staff.full_name);
      setEmail(staff.email);
      setPhone(staff.phone || '');
      setEmployeeCode(staff.employee_code || '');
      setSpecialty(staff.specialty || '');
      setRole(staff.role || 'stylist');
      setIsActive(staff.is_active);
      setIsAvailable(staff.is_available);
      setImageUrl(staff.image_url || '');
      
      const meta = parseStaffBio(staff.bio || '');
      setBioText(meta.bioText);
      setWorkingDays(meta.schedule.workingDays);
      setStartTime(meta.schedule.startTime);
      setEndTime(meta.schedule.endTime);
      setLunchBreak(meta.schedule.lunchBreak);
      setWeeklyOff(meta.schedule.weeklyOff);
      setLeaves(meta.leaves);
    } else {
      setFullName('');
      setEmail('');
      setPhone('');
      setEmployeeCode(`STF-${Math.floor(1000 + Math.random() * 9000)}`);
      setSpecialty('');
      setRole('stylist');
      setIsActive(true);
      setIsAvailable(true);
      setImageUrl('');
      setBioText('');
      setWorkingDays(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
      setStartTime('09:00');
      setEndTime('18:00');
      setLunchBreak('13:00-14:00');
      setWeeklyOff(['Saturday', 'Sunday']);
      setLeaves([]);
    }
    setNewLeaveType('Vacation');
    setNewLeaveStart('');
    setNewLeaveEnd('');
    setIsModalOpen(true);
  };

  // Upload image to Supabase Storage / Fallback Base64
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const fileExt = file.name.split('.').pop();
      const randomId = editingStaff?.id || crypto.randomUUID();
      const fileName = `${randomId}-${Date.now()}.${fileExt}`;

      // 1. Try to upload to "staff" storage bucket
      const { data, error } = await supabase.storage
        .from('staff')
        .upload(fileName, file, { cacheControl: '3600', upsert: true });

      if (error) {
        console.warn('Bucket upload failed, attempting default "avatars" bucket...', error);
        // Fallback to "avatars" bucket
        const { data: avData, error: avError } = await supabase.storage
          .from('avatars')
          .upload(fileName, file, { cacheControl: '3600', upsert: true });

        if (avError) throw avError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);
        setImageUrl(publicUrl);
        triggerToast('success', 'Image Upload Complete', 'Staff profile photo has been refreshed.');
      } else {
        const { data: { publicUrl } } = supabase.storage
          .from('staff')
          .getPublicUrl(fileName);
        setImageUrl(publicUrl);
        triggerToast('success', 'Image Upload Complete', 'Staff profile photo has been refreshed.');
      }
    } catch (err: any) {
      console.warn('Supabase storage upload error, using local data URL fallback:', err);
      // Fallback base64 conversion
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
        triggerToast('info', 'Image Cached', 'Photo converted to local asset URI.');
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingImage(false);
    }
  };

  // Add a new leave period
  const handleAddLeave = () => {
    if (!newLeaveStart || !newLeaveEnd) {
      triggerToast('warning', 'Incomplete leave period', 'Please configure start and end dates.');
      return;
    }
    if (new Date(newLeaveStart) > new Date(newLeaveEnd)) {
      triggerToast('warning', 'Invalid date range', 'Start date must precede end date.');
      return;
    }

    const newLeave = {
      id: `leave-${Date.now()}`,
      type: newLeaveType,
      startDate: newLeaveStart,
      endDate: newLeaveEnd
    };

    setLeaves(prev => [...prev, newLeave]);
    setNewLeaveStart('');
    setNewLeaveEnd('');
    triggerToast('info', 'Leave Period Configured', 'Click save on the stylist profile to commit changes.');
  };

  // Remove a leave period
  const handleRemoveLeave = (leaveId: string) => {
    setLeaves(prev => prev.filter(l => l.id !== leaveId));
    triggerToast('info', 'Leave Period Removed', 'Remember to save the profile to commit.');
  };

  // Save changes to Supabase
  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName.trim() || !email.trim() || !employeeCode.trim()) {
      triggerToast('warning', 'Missing Details', 'Full name, email, and employee code are required fields.');
      return;
    }

    // Email, Phone, and Employee code validations (prevent duplicates)
    const duplicateEmail = staffList.find(s => s.email.toLowerCase() === email.trim().toLowerCase() && s.id !== editingStaff?.id);
    if (duplicateEmail) {
      triggerToast('error', 'Duplicate Email Found', 'Another staff member is already registered with this email.');
      return;
    }

    const duplicateCode = staffList.find(s => s.employee_code.toLowerCase() === employeeCode.trim().toLowerCase() && s.id !== editingStaff?.id);
    if (duplicateCode) {
      triggerToast('error', 'Duplicate Employee Code', 'This employee code is already allocated to another stylist.');
      return;
    }

    if (phone.trim()) {
      const duplicatePhone = staffList.find(s => s.phone === phone.trim() && s.id !== editingStaff?.id);
      if (duplicatePhone) {
        triggerToast('error', 'Duplicate Phone Number', 'This phone number is already allocated to another stylist.');
        return;
      }
    }

    setIsSaving(true);
    try {
      // Serialize schedule and leaves into the bio field as JSON
      const serializedBio = serializeStaffBio({
        bioText,
        schedule: {
          workingDays,
          startTime,
          endTime,
          lunchBreak,
          weeklyOff
        },
        leaves
      });

      const staffId = editingStaff?.id || crypto.randomUUID();
      const payload: DBStaff = {
        id: staffId,
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        employee_code: employeeCode.trim(),
        specialty: specialty.trim(),
        role,
        is_active: isActive,
        is_available: isAvailable,
        image_url: imageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150',
        bio: serializedBio
      };

      if (!isSupabaseConfigured) {
        setStaffList(prev => {
          const index = prev.findIndex(s => s.id === staffId);
          let updated: DBStaff[];
          if (index >= 0) {
            updated = [...prev];
            updated[index] = payload;
          } else {
            updated = [payload, ...prev];
          }
          try {
            localStorage.setItem('musha_local_staff', JSON.stringify(updated));
          } catch (e) {
            console.warn('LocalStorage error:', e);
          }
          return updated;
        });

        triggerToast('success', editingStaff ? 'Stylist Updated' : 'Stylist Enrolled', `Successfully saved record for ${fullName}.`);
        setIsModalOpen(false);
        return;
      }

      const { error } = await supabase
        .from('staff')
        .upsert(payload);

      if (error) throw error;

      triggerToast('success', editingStaff ? 'Stylist Updated' : 'Stylist Enrolled', `Successfully saved record for ${fullName}.`);
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      console.warn('Notice saving staff:', err);
      triggerToast('error', 'Save Notice', err.message || 'Could not write records to database.');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete a staff record
  const handleDeleteStaff = async (staffId: string, name: string) => {
    if (!confirm(`Are you absolutely sure you want to retire ${name} from active staff registries?`)) {
      return;
    }

    try {
      if (!isSupabaseConfigured) {
        setStaffList(prev => {
          const updated = prev.filter(s => s.id !== staffId);
          try {
            localStorage.setItem('musha_local_staff', JSON.stringify(updated));
          } catch (e) {
            console.warn('LocalStorage error:', e);
          }
          return updated;
        });
        triggerToast('success', 'Stylist Retired', `Successfully removed ${name} from the salon registries.`);
        return;
      }

      const { error } = await supabase
        .from('staff')
        .delete()
        .eq('id', staffId);

      if (error) throw error;

      triggerToast('success', 'Stylist Retired', `Successfully removed ${name} from the salon registries.`);
      fetchData();
    } catch (err: any) {
      console.warn('Notice deleting staff:', err);
      triggerToast('error', 'Deletion Notice', err.message || 'Could not delete staff record.');
    }
  };

  const toggleDay = (day: string) => {
    setWorkingDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div id={id} className="space-y-8 text-brand-text">
      {/* 1. Dashboard Statistics Cards */}
      <div id="staff-dashboard-stats-grid" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card id="stat-total-staff" variant="bordered" className="bg-brand-surface border-brand-accent p-4 text-center">
          <Users className="h-5 w-5 text-brand-secondary mx-auto mb-1.5" />
          <p className="font-sans text-[10px] uppercase tracking-wider text-brand-text-muted">Total Stylists</p>
          <p className="font-serif text-2xl font-bold mt-1 text-white">{stats.total}</p>
        </Card>
        <Card id="stat-active-staff" variant="bordered" className="bg-brand-surface border-brand-accent p-4 text-center">
          <UserCheck className="h-5 w-5 text-green-500 mx-auto mb-1.5" />
          <p className="font-sans text-[10px] uppercase tracking-wider text-brand-text-muted">Active Registries</p>
          <p className="font-serif text-2xl font-bold mt-1 text-white">{stats.active}</p>
        </Card>
        <Card id="stat-avail-staff" variant="bordered" className="bg-brand-surface border-brand-accent p-4 text-center">
          <Sparkles className="h-5 w-5 text-brand-secondary mx-auto mb-1.5 animate-pulse" />
          <p className="font-sans text-[10px] uppercase tracking-wider text-brand-text-muted">Available Now</p>
          <p className="font-serif text-2xl font-bold mt-1 text-brand-secondary">{stats.available}</p>
        </Card>
        <Card id="stat-on-leave" variant="bordered" className="bg-brand-surface border-brand-accent p-4 text-center">
          <UserX className="h-5 w-5 text-red-400 mx-auto mb-1.5" />
          <p className="font-sans text-[10px] uppercase tracking-wider text-brand-text-muted">On Leave Today</p>
          <p className="font-serif text-2xl font-bold mt-1 text-white">{stats.onLeave}</p>
        </Card>
        <Card id="stat-today-apps" variant="bordered" className="bg-brand-surface border-brand-accent p-4 text-center">
          <Calendar className="h-5 w-5 text-brand-secondary mx-auto mb-1.5" />
          <p className="font-sans text-[10px] uppercase tracking-wider text-brand-text-muted">Today's Sessions</p>
          <p className="font-serif text-2xl font-bold mt-1 text-white">{stats.todayApps}</p>
        </Card>
        <Card id="stat-revenue" variant="bordered" className="bg-brand-surface border-brand-accent p-4 text-center">
          <DollarSign className="h-5 w-5 text-brand-secondary mx-auto mb-1.5" />
          <p className="font-sans text-[10px] uppercase tracking-wider text-brand-text-muted">Revenue Ledger</p>
          <p className="font-serif text-lg font-bold mt-1 text-white">${stats.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </Card>
      </div>

      {/* 2. Controls and Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-white tracking-tight flex items-center gap-2">
            <Users className="h-5 w-5 text-brand-secondary" /> Staff & Artist Management
          </h2>
          <p className="font-sans text-xs text-brand-text-muted mt-1 leading-relaxed max-w-xl">
            Configure working schedules, lock leaves, and upload premium styling portraits. Staff settings act as the single source of truth for public display lists and active client calendars.
          </p>
        </div>
        <Button
          id="add-stylist-btn"
          variant="primary"
          size="sm"
          onClick={() => handleOpenModal(null)}
          leftIcon={<Plus className="h-4 w-4" />}
          className="font-sans text-xs uppercase tracking-widest font-bold self-stretch sm:self-auto shrink-0"
        >
          Enroll Stylist
        </Button>
      </div>

      {/* 3. Main Staff List Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4 bg-brand-surface/30 border border-brand-accent">
          <div className="h-8 w-8 border-2 border-brand-secondary border-t-brand-surface rounded-full animate-spin" />
          <p className="font-sans text-[10px] uppercase tracking-widest text-brand-secondary">Synchronizing registries...</p>
        </div>
      ) : staffList.length === 0 ? (
        <div className="py-16 text-center bg-brand-surface border border-brand-accent">
          <UserMinus className="h-10 w-10 text-brand-secondary mx-auto mb-3" />
          <h3 className="font-serif text-lg text-white font-medium">No Stylist Registries Logged</h3>
          <p className="font-sans text-xs text-brand-text-muted mt-1.5 max-w-sm mx-auto">
            Get started by enrolling your first hair therapist or master barber to allow customers to book luxury packages.
          </p>
        </div>
      ) : (
        <div id="staff-members-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staffList.map((stylist) => {
            const meta = parseStaffBio(stylist.bio || '');
            const todayStr = new Date().toISOString().split('T')[0];
            const onLeave = isStaffOnLeave(meta.leaves, todayStr);
            const workingToday = isStaffWorking(meta, todayStr);

            return (
              <Card
                key={stylist.id}
                id={`staff-item-card-${stylist.id}`}
                variant="bordered"
                className="bg-brand-surface border-brand-accent p-0 flex flex-col justify-between overflow-hidden relative"
              >
                {/* Visual Status Indicator */}
                <div className="absolute top-4 right-4 z-10 flex gap-1.5">
                  {onLeave ? (
                    <span className="font-mono text-[8px] bg-red-950/70 text-red-400 border border-red-800/40 px-2 py-0.5 uppercase tracking-wider backdrop-blur-sm">
                      On Leave
                    </span>
                  ) : stylist.is_active && stylist.is_available && workingToday ? (
                    <span className="font-mono text-[8px] bg-green-950/70 text-green-400 border border-green-800/40 px-2 py-0.5 uppercase tracking-wider backdrop-blur-sm">
                      Active & Free
                    </span>
                  ) : (
                    <span className="font-mono text-[8px] bg-zinc-900/80 text-zinc-400 border border-zinc-700/40 px-2 py-0.5 uppercase tracking-wider backdrop-blur-sm">
                      Unavailable
                    </span>
                  )}
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex gap-4 items-start">
                    {/* Picture Block */}
                    <div className="h-16 w-16 bg-brand-bg border border-brand-secondary/30 overflow-hidden shrink-0">
                      <img
                        src={stylist.image_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150'}
                        alt={stylist.full_name}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    
                    {/* Primary Info */}
                    <div className="space-y-1">
                      <h4 className="font-serif text-lg font-light text-brand-primary leading-tight flex items-center gap-1.5">
                        {stylist.full_name}
                      </h4>
                      <p className="font-sans text-[10px] text-brand-secondary uppercase tracking-widest font-semibold">
                        {stylist.role === 'stylist' ? 'Master Stylist' : stylist.role}
                      </p>
                      <p className="font-mono text-[9px] text-brand-text-muted">
                        CODE: {stylist.employee_code || 'UNASSIGNED'}
                      </p>
                    </div>
                  </div>

                  {/* Contact details */}
                  <div className="space-y-1 font-sans text-xs border-t border-brand-accent/30 pt-3 text-brand-text-muted leading-relaxed font-light">
                    <p><span className="font-semibold text-brand-primary">Email:</span> {stylist.email}</p>
                    {stylist.phone && <p><span className="font-semibold text-brand-primary">Phone:</span> {stylist.phone}</p>}
                    {stylist.specialty && <p><span className="font-semibold text-brand-primary">Specialty:</span> {stylist.specialty}</p>}
                  </div>

                  {/* Schedule quickview */}
                  <div className="bg-brand-bg/50 p-3 text-[11px] space-y-1.5 border border-brand-accent/20">
                    <div className="flex justify-between items-center text-brand-text-muted">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-brand-secondary" /> Shift Hours:</span>
                      <span className="font-semibold text-white">{meta.schedule.startTime} - {meta.schedule.endTime}</span>
                    </div>
                    <div className="flex justify-between items-center text-brand-text-muted">
                      <span className="flex items-center gap-1"><Briefcase className="h-3 w-3 text-brand-secondary" /> Workdays:</span>
                      <span className="font-semibold text-brand-primary">{meta.schedule.workingDays.length} days/wk</span>
                    </div>
                  </div>
                </div>

                {/* Footer Action buttons */}
                <div className="bg-brand-surface-muted/35 border-t border-brand-accent/50 px-6 py-4 flex justify-between items-center">
                  <div className="flex gap-2">
                    <Button
                      id={`edit-stylist-btn-${stylist.id}`}
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenModal(stylist)}
                      className="border-brand-secondary/20 hover:border-brand-secondary text-brand-secondary px-3 py-1 text-[11px] uppercase tracking-wider font-semibold"
                    >
                      <Edit className="h-3 w-3 mr-1" /> Configure
                    </Button>
                    <Button
                      id={`delete-stylist-btn-${stylist.id}`}
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteStaff(stylist.id, stylist.full_name)}
                      className="border-red-950 text-red-400 hover:bg-red-950/20 px-3 py-1 text-[11px] uppercase tracking-wider font-semibold"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <span className="font-sans text-[9px] uppercase tracking-widest text-brand-text-muted font-light">
                    {onLeave ? '🔴 OUT OF OFFICE' : stylist.is_active && stylist.is_available ? '🟢 ACTIVE' : '⚪ SUSPENDED'}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* 4. Edit/Enroll Stylist Modal Drawer */}
      <AnimatePresence>
        {isModalOpen && (
          <div id="staff-modal-backdrop" className="fixed inset-0 bg-brand-bg/85 backdrop-blur-sm z-50 flex justify-end">
            <motion.div
              id="staff-modal-panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-xl bg-brand-surface border-l border-brand-accent h-screen flex flex-col justify-between shadow-2xl relative"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-brand-accent flex justify-between items-center">
                <div>
                  <h3 className="font-serif text-xl font-medium text-white">
                    {editingStaff ? `Configure Stylist Profile: ${editingStaff.full_name}` : 'Enroll New Master Stylist'}
                  </h3>
                  <p className="font-sans text-[10px] uppercase tracking-widest text-brand-secondary mt-1">
                    SYSTEM DATABASE REGISTER
                  </p>
                </div>
                <button
                  id="close-staff-modal"
                  onClick={() => setIsModalOpen(false)}
                  className="h-9 w-9 flex items-center justify-center border border-brand-secondary/15 text-brand-text-muted hover:text-white hover:bg-brand-secondary/10 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Scrollable Content Form */}
              <form onSubmit={handleSaveStaff} id="staff-edit-form" className="flex-grow overflow-y-auto p-6 space-y-8">
                {/* Sub-section: Portrait & Identity */}
                <div className="space-y-4">
                  <h4 className="font-serif text-sm font-semibold text-brand-secondary uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="h-4 w-4" /> Portrait & Identification
                  </h4>
                  
                  <div className="flex gap-4 items-center">
                    {/* Profile Picture Frame */}
                    <div className="h-20 w-20 bg-brand-bg border border-brand-secondary/35 overflow-hidden shrink-0 flex items-center justify-center relative group">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt="Profile Preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Users className="h-8 w-8 text-brand-text-muted" />
                      )}
                      
                      {uploadingImage && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <div className="h-5 w-5 border border-brand-secondary border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <p className="font-sans text-[11px] text-brand-text-muted font-light leading-normal max-w-xs">
                        Provide a premium portrait image representing the artist. Files will be locked in secure Supabase Storage.
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <Button
                        id="trigger-image-upload-btn"
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploadingImage}
                        onClick={() => fileInputRef.current?.click()}
                        leftIcon={<Upload className="h-3 w-3" />}
                        className="border-brand-secondary/30 hover:border-brand-secondary text-brand-secondary py-1 text-[10px] uppercase font-semibold"
                      >
                        Upload portrait
                      </Button>
                    </div>
                  </div>

                  {/* Core fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-[11px] font-sans uppercase tracking-widest text-brand-text-muted mb-1.5 font-semibold">
                        Full Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Elena Rostova"
                        className="w-full bg-brand-bg border border-brand-accent p-3 text-sm text-white font-sans focus:outline-none focus:border-brand-secondary"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-sans uppercase tracking-widest text-brand-text-muted mb-1.5 font-semibold">
                        Employee Code <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={employeeCode}
                        onChange={(e) => setEmployeeCode(e.target.value)}
                        placeholder="e.g. STF-8910"
                        className="w-full bg-brand-bg border border-brand-accent p-3 text-sm text-white font-mono focus:outline-none focus:border-brand-secondary"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-sans uppercase tracking-widest text-brand-text-muted mb-1.5 font-semibold">
                        Specialty
                      </label>
                      <input
                        type="text"
                        value={specialty}
                        onChange={(e) => setSpecialty(e.target.value)}
                        placeholder="e.g. Balayage & Tones"
                        className="w-full bg-brand-bg border border-brand-accent p-3 text-sm text-white font-sans focus:outline-none focus:border-brand-secondary"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-sans uppercase tracking-widest text-brand-text-muted mb-1.5 font-semibold">
                        Email Address <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="elena@mushaempire.com"
                        className="w-full bg-brand-bg border border-brand-accent p-3 text-sm text-white font-sans focus:outline-none focus:border-brand-secondary"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-sans uppercase tracking-widest text-brand-text-muted mb-1.5 font-semibold">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+15550100004"
                        className="w-full bg-brand-bg border border-brand-accent p-3 text-sm text-white font-sans focus:outline-none focus:border-brand-secondary"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-[11px] font-sans uppercase tracking-widest text-brand-text-muted mb-1.5 font-semibold">
                        Professional Biography (SOCIETY PROFILE)
                      </label>
                      <textarea
                        value={bioText}
                        onChange={(e) => setBioText(e.target.value)}
                        placeholder="Artistry background, training academies, fashion accolades..."
                        rows={3}
                        className="w-full bg-brand-bg border border-brand-accent p-3 text-sm text-white font-sans focus:outline-none focus:border-brand-secondary resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Sub-section: Availability & Settings */}
                <div className="space-y-4 pt-4 border-t border-brand-accent/40">
                  <h4 className="font-serif text-sm font-semibold text-brand-secondary uppercase tracking-wider flex items-center gap-1.5">
                    <Briefcase className="h-4 w-4" /> Activity Statuses
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-6 bg-brand-bg/40 p-4 border border-brand-accent/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-white">Registry Active</p>
                        <p className="text-[10px] text-brand-text-muted">Display stylist in public portals.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="h-4 w-4 text-brand-secondary bg-brand-bg border-brand-accent focus:ring-brand-secondary"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-white">Accepting Bookings</p>
                        <p className="text-[10px] text-brand-text-muted">Available for online calendar selection.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={isAvailable}
                        onChange={(e) => setIsAvailable(e.target.checked)}
                        className="h-4 w-4 text-brand-secondary bg-brand-bg border-brand-accent focus:ring-brand-secondary"
                      />
                    </div>
                  </div>
                </div>

                {/* Sub-section: Working Schedule */}
                <div className="space-y-4 pt-4 border-t border-brand-accent/40">
                  <h4 className="font-serif text-sm font-semibold text-brand-secondary uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="h-4 w-4" /> Working Schedule Configuration
                  </h4>

                  <div className="space-y-4">
                    {/* Working Days Select */}
                    <div>
                      <label className="block text-[11px] font-sans uppercase tracking-widest text-brand-text-muted mb-2 font-semibold">
                        Weekly Working Days
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {daysOfWeek.map(day => {
                          const isSel = workingDays.includes(day);
                          return (
                            <button
                              key={day}
                              type="button"
                              onClick={() => toggleDay(day)}
                              className={`px-3 py-1.5 font-sans text-[10px] uppercase tracking-wider border font-bold transition-all duration-300 cursor-pointer ${
                                isSel 
                                  ? 'bg-brand-secondary text-brand-bg border-brand-secondary' 
                                  : 'bg-brand-bg text-brand-text-muted border-brand-accent/30 hover:border-brand-secondary/40'
                              }`}
                            >
                              {day.slice(0, 3)}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Hours configuration */}
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] font-sans uppercase tracking-widest text-brand-text-muted mb-1 font-semibold">
                          Shift Start Time
                        </label>
                        <input
                          type="text"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          placeholder="e.g. 09:00"
                          className="w-full bg-brand-bg border border-brand-accent p-2.5 text-xs text-white font-mono focus:outline-none focus:border-brand-secondary"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-sans uppercase tracking-widest text-brand-text-muted mb-1 font-semibold">
                          Shift End Time
                        </label>
                        <input
                          type="text"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          placeholder="e.g. 18:00"
                          className="w-full bg-brand-bg border border-brand-accent p-2.5 text-xs text-white font-mono focus:outline-none focus:border-brand-secondary"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-sans uppercase tracking-widest text-brand-text-muted mb-1 font-semibold">
                          Lunch Break Slot
                        </label>
                        <input
                          type="text"
                          value={lunchBreak}
                          onChange={(e) => setLunchBreak(e.target.value)}
                          placeholder="e.g. 13:00-14:00"
                          className="w-full bg-brand-bg border border-brand-accent p-2.5 text-xs text-white font-mono focus:outline-none focus:border-brand-secondary"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sub-section: Leave Management */}
                <div className="space-y-4 pt-4 border-t border-brand-accent/40">
                  <h4 className="font-serif text-sm font-semibold text-brand-secondary uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" /> Leave Management (Bespoke Locks)
                  </h4>

                  <div className="space-y-4">
                    {/* Add new leave period */}
                    <div className="bg-brand-bg/50 border border-brand-accent/20 p-4 space-y-4">
                      <p className="font-sans text-[10px] text-brand-text-muted">
                        Configure planned stylist leaves. Customer calendars will automatically block bookings for matching ranges.
                      </p>
                      
                      <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-3 sm:col-span-1">
                          <label className="block text-[9px] font-sans uppercase tracking-widest text-brand-text-muted mb-1 font-semibold">
                            Leave Classification
                          </label>
                          <select
                            value={newLeaveType}
                            onChange={(e) => setNewLeaveType(e.target.value as any)}
                            className="w-full bg-brand-bg border border-brand-accent p-2 text-xs text-white font-sans focus:outline-none focus:border-brand-secondary"
                          >
                            <option value="Sick Leave">Sick Leave</option>
                            <option value="Vacation">Vacation</option>
                            <option value="Emergency Leave">Emergency Leave</option>
                            <option value="Training">Training</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[9px] font-sans uppercase tracking-widest text-brand-text-muted mb-1 font-semibold">
                            Start Date
                          </label>
                          <input
                            type="date"
                            value={newLeaveStart}
                            onChange={(e) => setNewLeaveStart(e.target.value)}
                            className="w-full bg-brand-bg border border-brand-accent p-1.5 text-xs text-white font-sans focus:outline-none focus:border-brand-secondary"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] font-sans uppercase tracking-widest text-brand-text-muted mb-1 font-semibold">
                            End Date (Inclusive)
                          </label>
                          <input
                            type="date"
                            value={newLeaveEnd}
                            onChange={(e) => setNewLeaveEnd(e.target.value)}
                            className="w-full bg-brand-bg border border-brand-accent p-1.5 text-xs text-white font-sans focus:outline-none focus:border-brand-secondary"
                          />
                        </div>
                      </div>

                      <Button
                        id="add-leave-btn"
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={handleAddLeave}
                        className="font-sans text-[10px] uppercase tracking-widest py-1.5 w-full"
                      >
                        Log Leave Period
                      </Button>
                    </div>

                    {/* Active leaves list */}
                    {leaves.length > 0 && (
                      <div className="space-y-2">
                        <p className="font-sans text-[10px] uppercase tracking-widest text-brand-text-muted font-semibold">
                          Configured Leave Records
                        </p>
                        <div className="space-y-1.5">
                          {leaves.map((leave) => (
                            <div
                              key={leave.id}
                              className="bg-brand-bg border border-brand-accent/40 p-3 flex justify-between items-center text-xs"
                            >
                              <div>
                                <span className="font-bold text-brand-secondary uppercase text-[10px] tracking-wider block">
                                  {leave.type}
                                </span>
                                <span className="text-brand-text-muted font-light font-mono text-[11px] mt-0.5 block">
                                  {leave.startDate} to {leave.endDate}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveLeave(leave.id)}
                                className="text-red-400 hover:text-red-300 p-1 bg-red-950/20 border border-red-950/45 cursor-pointer"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </form>

              {/* Modal Actions Footer */}
              <div className="p-6 border-t border-brand-accent bg-brand-surface-muted/30 flex justify-end gap-3 shrink-0">
                <Button
                  id="cancel-save-staff-btn"
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setIsModalOpen(false)}
                  className="font-sans text-xs uppercase tracking-widest"
                >
                  Cancel
                </Button>
                <Button
                  id="confirm-save-staff-btn"
                  type="submit"
                  form="staff-edit-form"
                  variant="primary"
                  size="md"
                  disabled={isSaving}
                  leftIcon={<Check className="h-4 w-4" />}
                  className="font-sans text-xs uppercase tracking-widest font-bold"
                >
                  {isSaving ? 'Saving...' : 'Commit Changes'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
