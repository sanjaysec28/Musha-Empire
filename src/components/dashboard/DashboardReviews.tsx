/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, MessageSquare, Plus, Edit2, Trash2, ShieldAlert, Sparkles, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';
import { Modal } from '../ui/Overlay';
import { supabase } from '../../lib/supabase';

interface DashboardReviewsProps {
  id: string;
  triggerToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, description?: string) => void;
}

interface Review {
  id: string;
  customer_id?: string;
  user_id?: string;
  profile_id?: string;
  service_id?: string;
  rating: number;
  comment?: string;
  review_text?: string;
  created_at: string;
  service_name?: string; // dynamically joined/mapped
}

interface ServiceItem {
  id: string;
  name: string;
}

export default function DashboardReviews({ id, triggerToast }: DashboardReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [selectedRating, setSelectedRating] = useState(5);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete State
  const [deletingReview, setDeletingReview] = useState<Review | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Probe column mapping to heal schema dynamically
  const [columnMap, setColumnMap] = useState({
    userIdCol: 'customer_id',
    commentCol: 'comment'
  });

  const fetchUserAndData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      // Fetch Services to map service names
      const { data: dbServices } = await supabase.from('services').select('id, name');
      const loadedServices = dbServices || [];
      setServices(loadedServices);

      // Fetch all reviews
      const { data: dbReviews, error: reviewsErr } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (reviewsErr) throw reviewsErr;

      // Auto-probe schema column names based on retrieved reviews if any exist
      if (dbReviews && dbReviews.length > 0) {
        const firstRow = dbReviews[0];
        const detectedUserIdCol = 'customer_id' in firstRow ? 'customer_id' : ('user_id' in firstRow ? 'user_id' : 'profile_id');
        const detectedCommentCol = 'comment' in firstRow ? 'comment' : 'review_text';
        setColumnMap({ userIdCol: detectedUserIdCol, commentCol: detectedCommentCol });
      }

      // Map service names
      const mappedReviews = (dbReviews || []).map((r: any) => {
        const serviceMatch = loadedServices.find(s => s.id === r.service_id);
        return {
          ...r,
          service_name: serviceMatch?.name || 'Exclusive Custom Styling'
        };
      });

      setReviews(mappedReviews);
    } catch (err: any) {
      console.error('Error fetching reviews details:', err);
      setError(err.message || 'An error occurred while loading reviews.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserAndData();
  }, []);

  const openCreateModal = () => {
    setEditingReview(null);
    setSelectedServiceId(services[0]?.id || '');
    setSelectedRating(5);
    setCommentText('');
    setIsModalOpen(true);
  };

  const openEditModal = (review: Review) => {
    setEditingReview(review);
    setSelectedServiceId(review.service_id || '');
    setSelectedRating(review.rating);
    setCommentText(review.comment || review.review_text || '');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      triggerToast('error', 'Authentication Required', 'Please sign in to write reviews.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Build dynamic self-healing payload
      const payload: any = {
        rating: selectedRating,
        service_id: selectedServiceId || null
      };

      // Add appropriate user column
      payload[columnMap.userIdCol] = currentUser.id;
      // Add appropriate comment column
      payload[columnMap.commentCol] = commentText;

      let responseError: any = null;

      if (editingReview) {
        // UPDATE operation
        const { error: updateErr } = await supabase
          .from('reviews')
          .update(payload)
          .eq('id', editingReview.id);
        responseError = updateErr;
      } else {
        // CREATE operation
        const { error: insertErr } = await supabase
          .from('reviews')
          .insert(payload);
        responseError = insertErr;
      }

      // Self-healing fallback if insert fails due to column discrepancy
      if (responseError && responseError.message?.toLowerCase().includes('column')) {
        console.warn('Attempting self-healing recovery for review insertion...');
        // Try fallback options
        const fallbackPayload: any = {
          rating: selectedRating,
          service_id: selectedServiceId || null
        };
        // Swap column names
        const alternateUserId = columnMap.userIdCol === 'customer_id' ? 'user_id' : 'customer_id';
        const alternateComment = columnMap.commentCol === 'comment' ? 'review_text' : 'comment';

        fallbackPayload[alternateUserId] = currentUser.id;
        fallbackPayload[alternateComment] = commentText;

        if (editingReview) {
          const { error: retryErr } = await supabase
            .from('reviews')
            .update(fallbackPayload)
            .eq('id', editingReview.id);
          responseError = retryErr;
        } else {
          const { error: retryErr } = await supabase
            .from('reviews')
            .insert(fallbackPayload);
          responseError = retryErr;
        }

        // Save healed keys if it works
        if (!responseError) {
          setColumnMap({ userIdCol: alternateUserId, commentCol: alternateComment });
        }
      }

      if (responseError) throw responseError;

      triggerToast(
        'success',
        editingReview ? 'Review Updated' : 'Review Submitted',
        editingReview ? 'Your changes have been saved to Supabase.' : 'Thank you! Your feedback has been recorded.'
      );
      
      setIsModalOpen(false);
      fetchUserAndData(); // refresh
    } catch (err: any) {
      console.error('Error saving review:', err);
      triggerToast('error', 'Operation Failed', err.message || 'Could not persist review to Supabase.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingReview) return;

    setIsDeleting(true);
    try {
      const { error: deleteErr } = await supabase
        .from('reviews')
        .delete()
        .eq('id', deletingReview.id);

      if (deleteErr) throw deleteErr;

      triggerToast('success', 'Review Deleted', 'Your feedback has been removed from Supabase.');
      setDeletingReview(null);
      fetchUserAndData();
    } catch (err: any) {
      console.error('Error deleting review:', err);
      triggerToast('error', 'Delete Failed', err.message || 'Could not delete review from Supabase.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper to extract userId safely
  const getReviewUserId = (r: Review) => r.customer_id || r.user_id || r.profile_id;

  return (
    <div id={id} className="space-y-6">
      
      {/* Header and Call to Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="font-mono text-[9px] uppercase tracking-widest text-brand-secondary font-bold block">
            FEEDBACK PLATFORM
          </span>
          <h2 className="font-serif text-3.5xl font-semibold text-brand-primary mt-1">
            Service Reviews
          </h2>
          <p className="font-sans text-xs text-brand-text-muted mt-1 leading-relaxed">
            Share your experiences, recommend stylists, or edit your existing feedback loops.
          </p>
        </div>

        <Button
          id="btn-add-review-trigger"
          variant="primary"
          size="md"
          onClick={openCreateModal}
          className="font-sans text-[10px] uppercase tracking-widest font-bold flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Write a Review
        </Button>
      </div>

      <div className="luxury-divider" />

      {/* Error View */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-6 text-center space-y-4">
          <AlertCircle className="h-8 w-8 text-red-400 mx-auto" />
          <div>
            <h4 className="font-serif text-base text-red-200 font-semibold">Synchronization Error</h4>
            <p className="font-sans text-xs text-red-300 mt-1 max-w-md mx-auto">{error}</p>
          </div>
          <Button
            id="btn-retry-reviews"
            variant="outline"
            size="sm"
            onClick={fetchUserAndData}
            className="font-sans text-[9px] uppercase tracking-wider mx-auto"
          >
            Retry Connection
          </Button>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-brand-surface border border-brand-accent p-6 space-y-4 animate-pulse">
              <div className="flex justify-between">
                <div className="h-4 bg-brand-bg/60 w-1/3" />
                <div className="h-4 bg-brand-bg/60 w-1/4" />
              </div>
              <div className="h-3 bg-brand-bg/60 w-2/3" />
              <div className="h-12 bg-brand-bg/60 w-full" />
              <div className="h-4 bg-brand-bg/60 w-1/4 pt-2" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && reviews.length === 0 && (
        <div className="bg-brand-surface border border-brand-accent p-12 text-center space-y-4">
          <MessageSquare className="h-10 w-10 text-brand-secondary/40 mx-auto" />
          <div className="space-y-1">
            <h3 className="font-serif text-lg font-medium text-brand-primary">No Reviews Found</h3>
            <p className="font-sans text-xs text-brand-text-muted max-w-sm mx-auto">
              Be the first premium patron to publish a review! Click the button above to submit feedback on your latest luxury session.
            </p>
          </div>
          <Button
            id="btn-empty-review-add"
            variant="outline"
            size="md"
            onClick={openCreateModal}
            className="font-sans text-[10px] uppercase tracking-wider border-brand-accent hover:border-brand-secondary mx-auto"
          >
            Create First Review
          </Button>
        </div>
      )}

      {/* Reviews Grid */}
      {!loading && !error && reviews.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence>
            {reviews.map((r, index) => {
              const reviewUserId = getReviewUserId(r);
              const isOwnReview = currentUser && reviewUserId === currentUser.id;
              const textContent = r.comment || r.review_text || '';

              return (
                <motion.div
                  key={r.id}
                  id={`review-card-${r.id}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-brand-surface border p-6 hover:border-brand-secondary/35 transition-all duration-300 flex flex-col justify-between group ${
                    isOwnReview ? 'border-brand-secondary/30 bg-brand-gold-light/5' : 'border-brand-accent'
                  }`}
                >
                  <div>
                    {/* Stars and Actions Header */}
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-center gap-1 text-brand-secondary">
                        {Array.from({ length: 5 }).map((_, sIdx) => (
                          <Star
                            key={sIdx}
                            className={`h-4 w-4 ${
                              sIdx < r.rating ? 'fill-brand-secondary' : 'text-brand-accent'
                            }`}
                          />
                        ))}
                      </div>

                      {/* Display Own Tag / Actions */}
                      {isOwnReview ? (
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[8px] font-bold text-brand-secondary uppercase tracking-widest bg-brand-gold-light px-2 py-0.5 border border-brand-secondary/20 mr-1">
                            MY REVIEW
                          </span>
                          <button
                            id={`btn-edit-review-${r.id}`}
                            onClick={() => openEditModal(r)}
                            className="text-brand-text-muted hover:text-brand-primary p-1.5 hover:bg-brand-bg border border-transparent hover:border-brand-accent transition-all duration-200"
                            title="Edit Feedback"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            id={`btn-delete-review-${r.id}`}
                            onClick={() => setDeletingReview(r)}
                            className="text-red-400 hover:text-red-300 p-1.5 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-200"
                            title="Delete Feedback"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="font-mono text-[9px] text-brand-text-muted">Verified Client</span>
                      )}
                    </div>

                    {/* Service Name */}
                    <p className="font-serif text-sm font-semibold text-brand-primary mt-3">
                      {r.service_name}
                    </p>

                    {/* Feedback Content */}
                    <p className="font-sans text-xs text-brand-text leading-relaxed mt-2.5 italic">
                      "{textContent}"
                    </p>
                  </div>

                  {/* Footer Timestamp */}
                  <div className="border-t border-brand-surface-muted/40 mt-5 pt-3 flex justify-between items-center text-brand-text-muted font-mono text-[9px]">
                    <span>SECURE TRANSACTION ID: {r.id.substring(0, 8).toUpperCase()}</span>
                    <span>
                      {new Date(r.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* ==============================================
          WRITE / EDIT REVIEW MODAL
          ============================================== */}
      <Modal
        id="modal-reviews-editor"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingReview ? 'Modify Privilege Feedback' : 'Publish Privilege Feedback'}
        size="md"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4 pt-2">
          {/* Service Dropdown */}
          <div className="space-y-1.5">
            <label className="font-mono text-[9px] font-bold uppercase tracking-wider text-brand-text-muted block">
              SELECT SERVICES RECEIVED
            </label>
            <select
              id="select-review-service"
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
              className="w-full bg-brand-surface border border-brand-accent p-3 text-xs font-sans text-brand-primary focus:border-brand-secondary outline-none rounded-none"
              required
            >
              <option value="" disabled>-- Select Service --</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
              {services.length === 0 && (
                <option value="default-service-id">Exclusive Custom Styling Package</option>
              )}
            </select>
          </div>

          {/* Rating Selection */}
          <div className="space-y-1.5">
            <label className="font-mono text-[9px] font-bold uppercase tracking-wider text-brand-text-muted block">
              PRIVILEGE EXPERIENCE RATING
            </label>
            <div className="flex items-center gap-2 py-1.5">
              {Array.from({ length: 5 }).map((_, idx) => {
                const starVal = idx + 1;
                return (
                  <button
                    key={idx}
                    type="button"
                    id={`btn-star-select-${starVal}`}
                    onClick={() => setSelectedRating(starVal)}
                    className="p-1 hover:scale-110 transition-transform text-brand-secondary"
                  >
                    <Star
                      className={`h-7 w-7 ${
                        starVal <= selectedRating ? 'fill-brand-secondary' : 'text-brand-accent'
                      }`}
                    />
                  </button>
                );
              })}
              <span className="font-mono text-[10px] text-brand-secondary font-bold ml-2">
                {selectedRating === 5 ? 'EXCEPTIONAL' : selectedRating === 4 ? 'EXCELLENT' : selectedRating === 3 ? 'GOOD' : selectedRating === 2 ? 'FAIR' : 'POOR'}
              </span>
            </div>
          </div>

          {/* Text Area */}
          <div className="space-y-1.5">
            <label className="font-mono text-[9px] font-bold uppercase tracking-wider text-brand-text-muted block">
              FEEDBACK COMMENT
            </label>
            <textarea
              id="textarea-review-comment"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Describe styling precision, artist care, lounge comfort, or amenities loop..."
              className="w-full bg-brand-surface border border-brand-accent p-3 text-xs font-sans text-brand-primary focus:border-brand-secondary outline-none h-28 resize-none rounded-none"
              maxLength={1000}
              required
            />
          </div>

          {/* Modal Actions */}
          <div className="flex gap-3 pt-3 border-t border-brand-surface-muted">
            <Button
              id="btn-close-reviews-modal"
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsModalOpen(false)}
              className="font-sans text-[10px] uppercase tracking-wider font-semibold border-brand-accent hover:border-brand-secondary flex-1"
            >
              Cancel
            </Button>
            <Button
              id="btn-submit-reviews-modal"
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              className="font-sans text-[10px] uppercase tracking-wider font-semibold flex-1"
            >
              {editingReview ? 'Save Changes' : 'Publish Review'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ==============================================
          DELETE CONFIRMATION DIALOG
          ============================================== */}
      <Modal
        id="modal-reviews-deleter"
        isOpen={deletingReview !== null}
        onClose={() => setDeletingReview(null)}
        title="Confirm Feedback Removal"
        size="sm"
      >
        <div className="space-y-4 pt-2 pb-4 text-center">
          <div className="h-12 w-12 bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center mx-auto rounded-none">
            <ShieldAlert className="h-6 w-6" />
          </div>

          <div>
            <p className="font-serif text-lg font-semibold text-brand-primary">Remove Review Permanently?</p>
            <p className="font-sans text-xs text-brand-text-muted max-w-sm mx-auto mt-2 leading-relaxed">
              Are you sure you want to delete this verified review? This operation cannot be undone.
            </p>
          </div>

          <div className="flex gap-3 justify-center pt-3 border-t border-brand-surface-muted">
            <Button
              id="btn-deny-delete-review"
              variant="outline"
              size="md"
              onClick={() => setDeletingReview(null)}
              className="font-sans text-[10px] uppercase tracking-wider font-semibold border-brand-accent hover:border-brand-secondary flex-1"
            >
              No, Keep It
            </Button>
            <Button
              id="btn-approve-delete-review"
              variant="primary"
              size="md"
              onClick={handleDeleteConfirm}
              isLoading={isDeleting}
              className="font-sans text-[10px] uppercase tracking-wider font-semibold flex-1 bg-red-500 text-white border-red-500 hover:bg-red-600"
            >
              Yes, Delete
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
